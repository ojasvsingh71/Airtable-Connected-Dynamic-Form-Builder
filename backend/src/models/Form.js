const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const QuestionSchema = new Schema({
    questionKey: { type: String, required: true },
    airtableFieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    conditionalRules: { type: Object, default: null }
});


const FormSchema = new Schema({
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled form' },
    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },
    questions: { type: [QuestionSchema], default: [] }
}, { timestamps: true });


module.exports = mongoose.model('Form', FormSchema);