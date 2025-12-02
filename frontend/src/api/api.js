import axios from 'axios';


const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });


// Attach token from localStorage when present
API.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});


export async function getMe() { return API.get('/api/me').then(r => r.data); }
export async function startOAuth() { window.location.href = `${import.meta.env.VITE_API_URL}/auth/airtable`; }
export async function listBases() { return API.get('/api/airtable/bases').then(r => r.data); }
export async function listTables(baseId) { return API.get(`/api/airtable/bases/${baseId}/tables`).then(r => r.data); }
export async function getTableFields(baseId, tableId) { return API.get(`/api/airtable/bases/${baseId}/tables/${tableId}/fields`).then(r => r.data); }
export async function createForm(payload) { return API.post('/api/forms', payload).then(r => r.data); }
export async function getForm(formId) { return API.get(`/api/forms/${formId}`).then(r => r.data); }
export async function submitForm(formId, answers) { return API.post(`/api/forms/${formId}/submit`, { answers }).then(r => r.data); }
export async function listResponses(formId) { return API.get(`/api/forms/${formId}/responses`).then(r => r.data); }
export async function listForms() { return API.get('/api/forms').then(r => r.data); }
export async function uploadFile(file) {
    const fd = new FormData(); fd.append('file', file);
    const r = await API.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
}


export default API;