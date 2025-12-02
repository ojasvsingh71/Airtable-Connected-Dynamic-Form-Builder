import React, { useEffect, useState } from 'react';
import * as api from '../api/api';
import { Link } from 'react-router-dom';

export default function FormsList() {
    const [forms, setForms] = useState([]);

    useEffect(() => { load(); }, []);

    async function load() {
        try { const data = await api.listForms(); setForms(data); } catch (e) { alert('failed to load forms'); }
    }

    if (!forms) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h2>My Forms</h2>
            <div>
                {forms.length === 0 && <div>No forms yet — create one in Builder.</div>}
                {forms.map(f => (
                    <div key={f.id} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
                        <div style={{ fontWeight: 700 }}>{f.title}</div>
                        <div className="small">Base: {f.airtableBaseId} — Table: {f.airtableTableId}</div>
                        <div style={{ marginTop: 8 }}>
                            <Link to={`/form/${f.id}`}><button>Open</button></Link>
                            <Link to={`/forms/${f.id}/responses`} style={{ marginLeft: 8 }}><button>Responses</button></Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
