import React from 'react';


export default function QuestionEditor({ question, onChange, onRemove }) {
    return (
        <div style={{ border: '1px solid #eee', padding: 12, marginBottom: 8 }}>
            <div className="row">
                <div style={{ flex: 1 }}>
                    <label>Label</label>
                    <input value={question.label} onChange={e => onChange({ ...question, label: e.target.value })} />
                </div>
                <div style={{ width: 140 }}>
                    <label>Key</label>
                    <input value={question.questionKey} onChange={e => onChange({ ...question, questionKey: e.target.value })} />
                </div>
                <div style={{ width: 120 }}>
                    <label>Required</label>
                    <select value={question.required ? 'yes' : 'no'} onChange={e => onChange({ ...question, required: e.target.value === 'yes' })}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
                <div>
                    <button onClick={onRemove} style={{ background: '#ef4444' }}>Remove</button>
                </div>
            </div>
            <div style={{ marginTop: 8 }} className="small">Airtable Field ID: <span className="kv">{question.airtableFieldId}</span></div>
            {question.type && (question.type === 'single_select' || question.type === 'multi_select') && (
                <div className="field">
                    <label>Options (comma separated)</label>
                    <input value={(question.options || []).join(',')} onChange={e => onChange({ ...question, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                </div>
            )}
        </div>
    );
}