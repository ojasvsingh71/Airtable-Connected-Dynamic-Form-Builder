const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ResponseSchema = new Schema({
    formId: { type: mongoose.Types.ObjectId, ref: 'Form', required: true },
    airtableRecordId: { type: String },
    answers: { type: Object, required: true },
    status: { type: String, enum: ['created', 'synced', 'deletedInAirtable'], default: 'created' }
}, { timestamps: true });


module.exports = mongoose.model('Response', ResponseSchema);