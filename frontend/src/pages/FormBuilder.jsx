import React, { useEffect, useState } from 'react';
import * as api from '../api/api';
import QuestionEditor from '../components/QuestionEditor';
import { useNavigate } from 'react-router-dom';


export default function FormBuilder() {
    const navigate = useNavigate();
    const [bases, setBases] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedBase, setSelectedBase] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [fields, setFields] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('New form');


    useEffect(() => { if (selectedBase) loadTables(selectedBase); }, [selectedBase]);


    async function loadBases() {
        try { const data = await api.listBases(); setBases(data.bases || data); } catch (e) { alert('Failed to load bases'); }
    }
    useEffect(() => { loadBases(); }, []);


    async function loadTables(baseId) {
        try { const data = await api.listTables(baseId); setTables(data.tables || data); } catch (e) { alert('failed to load tables'); }
    }


    async function loadFields(baseId, tableId) {
        try {
            const data = await api.getTableFields(baseId, tableId);
            setFields(data.fields || []);
        } catch (e) {
            alert('Failed to load fields');
        }
    }


    function addQuestionFromField(field) {
        const q = { questionKey: field.id, airtableFieldId: field.id, label: field.name, type: mapAirtableType(field.type), required: false, options: field.options?.choices?.map(c => c.name) || [] };
        setQuestions(prev => [...prev, q]);
    }


    function mapAirtableType(t) {
        if (!t) return 'short_text';
        if (t === 'singleSelect') return 'single_select';
        if (t === 'multipleSelects') return 'multi_select';
        if (t === 'multilineText') return 'long_text';
        if (t === 'text') return 'short_text';
        if (t === 'attachment') return 'attachment';
        // fallback to short_text
        return 'short_text';
    }



    function saveForm() {
        const payload = { title, airtableBaseId: selectedBase, airtableTableId: selectedTable, questions };
        api.createForm(payload).then(r => {
            // success — redirect to forms list
            navigate('/forms');
        }).catch(e => { alert('failed to save'); });
    }


    return (
        <div className="container">
            <h2>Form Builder</h2>
            <div className="field">
                <label>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="row">
                <div style={{ flex: 1 }}>
                    <label>Base</label>
                    <select value={selectedBase} onChange={e => setSelectedBase(e.target.value)}>
                        <option value="">-- select base --</option>
                        {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label>Table</label>
                    <select value={selectedTable} onChange={e => { setSelectedTable(e.target.value); loadFields(selectedBase, e.target.value); }}>
                        <option value="">-- select table --</option>
                        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>


            <div style={{ marginTop: 12 }}>
                <h4>Table fields</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {fields.map(f => (
                        <div key={f.id} style={{ padding: 8, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600 }}>{f.name}</div>
                            <div className="small">{f.type}</div>
                            <div style={{ marginTop: 8 }}>
                                <button onClick={() => addQuestionFromField(f)}>Add</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <div style={{ marginTop: 20 }}>
                <h4>Questions</h4>
                {questions.map((q, i) => (
                    <QuestionEditor key={i} question={q} onChange={newQ => setQuestions(questions.map((x, j) => j === i ? newQ : x))} onRemove={() => setQuestions(questions.filter((x, j) => j !== i))} />
                ))}
            </div>


            <div style={{ marginTop: 12 }}>
                <button onClick={saveForm}>Save Form</button>
            </div>
        </div>
    );
}