import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/api';


export default function Responses() {
    const { formId } = useParams();
    const [list, setList] = useState([]);


    useEffect(() => { if (formId) api.listResponses(formId).then(r => setList(r)).catch(e => console.error(e)); }, [formId]);


    return (
        <div className="container">
            <h2>Responses</h2>
            <div>
                {list.map(r => (
                    <div key={r.id} style={{ padding: 12, border: '1px solid #eee', marginBottom: 8 }}>
                        <div className="small">{new Date(r.createdAt).toLocaleString()}</div>
                        <div>Status: {r.status}</div>
                        <div style={{ marginTop: 8 }}>
                            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(r.answers, null, 2)}</pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}