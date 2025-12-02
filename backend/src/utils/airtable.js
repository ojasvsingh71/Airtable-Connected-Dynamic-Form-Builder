const axios = require('axios');


async function exchangeCodeForToken(code) {
    const url = process.env.AIRTABLE_OAUTH_TOKEN_URL;
    const body = {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.AIRTABLE_CLIENT_ID,
        client_secret: process.env.AIRTABLE_CLIENT_SECRET,
        redirect_uri: process.env.AIRTABLE_REDIRECT_URI
    };
    const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    return resp.data;
}


async function fetchWhoAmI(accessToken) {
    const url = 'https://api.airtable.com/v0/meta/whoami';
    const resp = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return resp.data;
}


async function listBases(accessToken) {
    // Airtable meta API: GET /v0/meta/bases
    const url = 'https://api.airtable.com/v0/meta/bases';
    const resp = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return resp.data;
}


async function listTablesForBase(accessToken, baseId) {
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    const resp = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return resp.data;
}


async function createAirtableRecord(accessToken, baseId, tableIdOrName, fields) {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableIdOrName)}`;
    const resp = await axios.post(url, { fields }, { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
    return resp.data;
}


async function exchangeRefreshToken(refreshToken) {
    const url = process.env.AIRTABLE_OAUTH_TOKEN_URL;
    const body = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.AIRTABLE_CLIENT_ID,
        client_secret: process.env.AIRTABLE_CLIENT_SECRET
    };
    const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    return resp.data;
}

async function refreshAccessTokenIfNeeded(user) {
    if (!user) return null;
    if (!user.refreshToken) return null;
    const expiresAt = user.tokenExpiresAt ? new Date(user.tokenExpiresAt).getTime() : 0;
    const now = Date.now();
    // refresh if missing expiry or will expire within 60 seconds
    if (expiresAt === 0 || expiresAt - now < 60 * 1000) {
        const data = await exchangeRefreshToken(user.refreshToken);
        return data;
    }
    return null;
}


module.exports = { exchangeCodeForToken, fetchWhoAmI, listBases, listTablesForBase, createAirtableRecord, exchangeRefreshToken, refreshAccessTokenIfNeeded };