const express = require('express');
const router = express.Router();
const { exchangeCodeForToken, fetchWhoAmI } = require('../utils/airtable');
const User = require('../models/User');
const jwtUtil = require('../utils/jwt');
const axios = require('axios');


// Simple in-memory state store for OAuth CSRF states (for demo only)
const stateStore = new Map();


router.get('/airtable', (req, res) => {
    const state = Math.random().toString(36).slice(2);
    stateStore.set(state, Date.now());
    const url = `${process.env.AIRTABLE_OAUTH_AUTHORIZE_URL}?response_type=code&client_id=${process.env.AIRTABLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT_URI)}&state=${state}`;
    res.redirect(url);
});


router.get('/airtable/callback', async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('missing code');
    if (!state || !stateStore.has(state)) return res.status(400).send('invalid state');
    try {
        const tokenData = await exchangeCodeForToken(code);
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const profile = await fetchWhoAmI(accessToken);
        const airtableUserId = profile?.account?.id || profile?.current_user?.id || JSON.stringify(profile).slice(0, 16);
        const user = await User.findOneAndUpdate(
            { airtableUserId },
            { airtableUserId, profile, accessToken, refreshToken, tokenExpiresAt: tokenData.expires_at ? new Date(tokenData.expires_at) : null, lastLoginAt: new Date() },
            { upsert: true, new: true }
        );
        const token = jwtUtil.sign(user);
        // redirect to frontend OAuth callback page with token
        res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('OAuth failure');
    }
});


module.exports = router;