import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/api';
import FieldPreview from '../components/FieldPreview';
import { shouldShowQuestion } from '../utils/conditional';


export default function FormViewer() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});


    useEffect(() => { api.getForm(formId).then(r => setForm(r)).catch(e => alert('failed to load')); }, [formId]);


    if (!form) return <div className="container">Loading...</div>;


    function handleChange(key, value) { setAnswers(prev => ({ ...prev, [key]: value })); }


    async function handleSubmit(e) {
        e.preventDefault();
        const errs = {};
        for (const q of form.questions) {
            const visible = shouldShowQuestion(q.conditionalRules, answers);
            if (q.required && visible) {
                const val = answers[q.questionKey];
                if (val === undefined || val === null || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && val.trim() === '')) {
                    errs[q.questionKey] = 'Required';
                }
            }
        }
        setErrors(errs);
        if (Object.keys(errs).length) return;


        // For attachments, upload files first
        const prepared = { ...answers };
        for (const q of form.questions) {
            if (q.type === 'attachment' && prepared[q.questionKey] instanceof File) {
                const file = prepared[q.questionKey];
                const uploadResp = await api.uploadFile(file);
                prepared[q.questionKey] = uploadResp.url;
            }
        }
        try {
            const resp = await api.submitForm(formId, prepared);
            alert('Submitted! id: ' + resp.id);
        } catch (err) {
            console.error(err);
            alert('Failed to submit');
        }
    }


    return (
        <div className="container">
            <h2>{form.title}</h2>
            <form onSubmit={handleSubmit}>
                {form.questions.map(q => {
                    const visible = shouldShowQuestion(q.conditionalRules, answers);
                    if (!visible) return null;
                    return (
                        <div key={q.questionKey}>
                            <FieldPreview q={q} value={answers[q.questionKey]} onChange={val => handleChange(q.questionKey, val)} />
                            {errors[q.questionKey] && <div style={{ color: 'red' }}>{errors[q.questionKey]}</div>}
                        </div>
                    );
                })}
                <div style={{ marginTop: 12 }}>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}