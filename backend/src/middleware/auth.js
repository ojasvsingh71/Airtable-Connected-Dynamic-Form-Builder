const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { refreshAccessTokenIfNeeded } = require('../utils/airtable');


module.exports = async function (req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing auth' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' });
    const token = parts[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ error: 'Invalid user' });
        // try refreshing access token if needed
        try {
            const newTokens = await refreshAccessTokenIfNeeded(user);
            if (newTokens && newTokens.access_token) {
                user.accessToken = newTokens.access_token;
                if (newTokens.refresh_token) user.refreshToken = newTokens.refresh_token;
                if (newTokens.expires_at) user.tokenExpiresAt = new Date(newTokens.expires_at);
                await user.save();
            }
        } catch (e) {
            console.warn('Token refresh failed', e.message || e);
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};