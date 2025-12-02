const express = require('express');
const router = express.Router();
const { uploader } = require('../utils/upload');

router.post('/', uploader.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const urlBase = process.env.BACKEND_URL || '';
    const url = `${urlBase.replace(/\/$/, '')}/uploads/${req.file.filename}`;
    res.json({ ok: true, url, filename: req.file.filename });
});

module.exports = router;
