const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwtUtil = require('../utils/jwt');

// Mock OAuth - for testing without real Airtable credentials
router.get('/mock-airtable', (req, res) => {
    // Simulate Airtable OAuth flow with a mock user
    const mockProfile = {
        account: { id: 'mock-user-123' },
        current_user: {
            id: 'mock-user-123',
            email: 'test@example.com',
            name: 'Test User'
        }
    };

    const mockTokenData = {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Simulate user creation
    const airtableUserId = mockProfile.account.id || mockProfile.current_user.id;
    User.findOneAndUpdate(
        { airtableUserId },
        {
            airtableUserId,
            profile: mockProfile,
            accessToken: mockTokenData.access_token,
            refreshToken: mockTokenData.refresh_token,
            tokenExpiresAt: new Date(mockTokenData.expires_at),
            lastLoginAt: new Date()
        },
        { upsert: true, new: true }
    ).then(user => {
        const token = jwtUtil.sign(user);
        // Redirect to frontend OAuth callback with token
        res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`);
    }).catch(err => {
        console.error(err);
        res.status(500).send('Mock OAuth failure');
    });
});

module.exports = router;
