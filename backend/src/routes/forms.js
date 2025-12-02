const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Form = require('../models/Form');
const User = require('../models/User');
const ResponseModel = require('../models/Response');
const { createAirtableRecord } = require('../utils/airtable');
const { shouldShowQuestion } = require('../utils/conditional');


const SUPPORTED = new Set(['short_text', 'long_text', 'single_select', 'multi_select', 'attachment']);


// Create form
router.post('/', auth, async (req, res) => {
    const { title, airtableBaseId, airtableTableId, questions } = req.body;
    // Basic validation
    if (!airtableBaseId || !airtableTableId) return res.status(400).json({ error: 'base/table required' });
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'questions required' });
    // reject unsupported types
    for (const q of questions) {
        if (!SUPPORTED.has(q.type)) return res.status(400).json({ error: `unsupported type ${q.type}` });
    }
    const form = await Form.create({ owner: req.user._id, title, airtableBaseId, airtableTableId, questions });
    res.json(form);
});


// List forms for authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const list = await Form.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(list.map(f => ({ id: f._id, title: f.title, airtableBaseId: f.airtableBaseId, airtableTableId: f.airtableTableId, createdAt: f.createdAt })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'failed to list forms' });
    }
});


// Get form (public) - allow unauthenticated users to load form for filling
router.get('/:formId', async (req, res) => {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'not found' });
    res.json(form);
});


// Submit form
router.post('/:formId/submit', async (req, res) => {
    // Public submissions allowed; owner token used to write to Airtable
    const { answers } = req.body || {};
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'form not found' });
    // Validate
    for (const q of form.questions) {
        if (!SUPPORTED.has(q.type)) return res.status(400).json({ error: `unsupported type ${q.type}` });
        const visible = shouldShowQuestion(q.conditionalRules, answers || {});
        if (q.required && visible) {
            if (!(q.questionKey in (answers || {})) || answers[q.questionKey] === null || answers[q.questionKey] === '') {
                return res.status(400).json({ error: `Missing required ${q.questionKey}` });
            }
        }
        if (q.type === 'single_select' && answers[q.questionKey] && !q.options.includes(answers[q.questionKey])) {
            return res.status(400).json({ error: `Invalid option for ${q.questionKey}` });
        }
        if (q.type === 'multi_select' && answers[q.questionKey]) {
            if (!Array.isArray(answers[q.questionKey]) || answers[q.questionKey].some(v => !q.options.includes(v))) {
                return res.status(400).json({ error: `Invalid options for ${q.questionKey}` });
            }
        }
    }


    const ownerUser = await User.findById(form.owner);
    if (!ownerUser) return res.status(500).json({ error: 'form owner not found' });
    const fields = {};
    for (const q of form.questions) {
        if (!(q.questionKey in (answers || {}))) continue;
        const val = answers[q.questionKey];
        if (q.type === 'short_text' || q.type === 'long_text' || q.type === 'single_select') fields[q.airtableFieldId] = val;
        else if (q.type === 'multi_select') fields[q.airtableFieldId] = val;
        else if (q.type === 'attachment') {
            // Expect front-end provides public URL(s)
            fields[q.airtableFieldId] = (Array.isArray(val) ? val : [val]).map(u => ({ url: u }));
        }
    }


    try {
        // Check if this is a mock user (for testing)
        const isMockUser = form.owner.profile?.account?.id === 'mock-user-123' || ownerUser.profile?.account?.id === 'mock-user-123';

        let recordId = null;

        // Only write to Airtable if user is not mock
        if (!isMockUser) {
            const airtableResp = await createAirtableRecord(ownerUser.accessToken, form.airtableBaseId, form.airtableTableId, fields);
            recordId = airtableResp?.id || (airtableResp?.records && airtableResp.records[0] && airtableResp.records[0].id);
        } else {
            // For mock users, generate a fake record ID
            recordId = 'mock-rec-' + Date.now();
        }

        const saved = await ResponseModel.create({ formId: form._id, airtableRecordId: recordId, answers, status: isMockUser ? 'created' : 'synced' });
        res.json({ ok: true, id: saved._id, airtableRecordId: recordId });
    } catch (err) {
        console.error('Form submission error:', err.response?.data || err.message);
        res.status(500).json({ error: 'failed to save response', details: err.message });
    }
});


// List responses for a form (DB only)
router.get('/:formId/responses', auth, async (req, res) => {
    const list = await ResponseModel.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.json(list.map(r => ({ id: r._id, createdAt: r.createdAt, status: r.status, answers: r.answers })));
});


module.exports = router;