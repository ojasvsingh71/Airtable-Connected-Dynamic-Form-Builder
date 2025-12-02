const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    const u = req.user;
    res.json({ id: u._id, airtableUserId: u.airtableUserId, profile: u.profile, lastLoginAt: u.lastLoginAt });
});

module.exports = router;
