import React from 'react';


export default function FieldPreview({ q, value, onChange }) {
    if (q.type === 'short_text') return <div className="field"><label>{q.label}</label><input value={value || ''} onChange={e => onChange(e.target.value)} /></div>;
    if (q.type === 'long_text') return <div className="field"><label>{q.label}</label><textarea value={value || ''} onChange={e => onChange(e.target.value)} /></div>;
    if (q.type === 'single_select') return <div className="field"><label>{q.label}</label><select value={value || ''} onChange={e => onChange(e.target.value)}><option value="">--</option>{(q.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
    if (q.type === 'multi_select') return <div className="field"><label>{q.label}</label>{(q.options || []).map(o => <label key={o}><input type="checkbox" checked={(value || []).includes(o)} onChange={e => {
        const set = new Set(value || []); if (e.target.checked) set.add(o); else set.delete(o); onChange(Array.from(set));
    }} /> {o}</label>)}</div>;
    if (q.type === 'attachment') return <div className="field"><label>{q.label}</label><input type="file" onChange={e => onChange(e.target.files[0])} /></div>;
    return null;
}