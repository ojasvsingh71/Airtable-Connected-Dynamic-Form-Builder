const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ResponseModel = require('../models/Response');
const Form = require('../models/Form');


// Airtable webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
    if (!secret) {
        console.warn('No webhook secret configured — skipping signature verification');
        return true; // allow in dev without secret
    }
    const computed = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('base64');
    return computed === signature;
}

// Map Airtable field updates back to response answers
async function updateResponseAnswers(recordId, fieldsFromAirtable) {
    const response = await ResponseModel.findOne({ airtableRecordId: recordId });
    if (!response) return null;

    const form = await Form.findById(response.formId);
    if (!form) return null;

    // Build a map of airtableFieldId → questionKey
    const fieldToQuestionMap = {};
    for (const q of form.questions) {
        fieldToQuestionMap[q.airtableFieldId] = q.questionKey;
    }

    // Update response answers with values from Airtable
    const updatedAnswers = { ...response.answers };
    for (const [fieldId, fieldValue] of Object.entries(fieldsFromAirtable)) {
        const questionKey = fieldToQuestionMap[fieldId];
        if (questionKey) {
            updatedAnswers[questionKey] = fieldValue;
        }
    }

    response.answers = updatedAnswers;
    await response.save();
    return response;
}

// Airtable sends webhooks in this format:
// {
//   "timestamp": "2024-01-01T00:00:00.000Z",
//   "actionMetadata": { "sourceMetadata": { ... } },
//   "payloadFormat": "v0",
//   "actionType": "create" | "update" | "destroy",
//   "createdTablesById": { ... },
//   "changedTablesById": {
//     "tblXXX": {
//       "createdMetadata": { ... },
//       "changedMetadata": { ... },
//       "destroyedFieldIds": [],
//       "changedRecordsById": {
//         "recXXX": { "current": { "fields": { "fldXXX": value } }, "previous": { ... } }
//       },
//       "destroyedRecordIds": ["recXXX"]
//     }
//   }
// }

router.post('/airtable', express.json({ type: '*/*' }), async (req, res) => {
    try {
        // Verify signature if secret is configured
        const signature = req.headers['x-airtable-content-mac'];
        const secret = process.env.AIRTABLE_WEBHOOK_SECRET;

        if (signature && !verifyWebhookSignature(req.body, signature, secret)) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        const payload = req.body;

        // Handle Airtable v0 payload format
        const changedTables = payload.changedTablesById || {};
        for (const [tableId, tableChanges] of Object.entries(changedTables)) {
            // Handle updated records
            const changedRecords = tableChanges.changedRecordsById || {};
            for (const [recordId, recordChange] of Object.entries(changedRecords)) {
                const fields = recordChange.current?.fields || {};

                // Update response in DB with new field values from Airtable
                await updateResponseAnswers(recordId, fields);

                // Mark as synced
                await ResponseModel.findOneAndUpdate(
                    { airtableRecordId: recordId },
                    { status: 'synced', updatedAt: new Date() }
                );
            }

            // Handle destroyed records
            const destroyedRecordIds = tableChanges.destroyedRecordIds || [];
            for (const recordId of destroyedRecordIds) {
                await ResponseModel.findOneAndUpdate(
                    { airtableRecordId: recordId },
                    { status: 'deletedInAirtable', updatedAt: new Date() }
                );
            }
        }

        res.json({ ok: true, processed: payload.timestamp });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'webhook handler error', details: err.message });
    }
});

module.exports = router;