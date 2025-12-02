const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listBases, listTablesForBase } = require('../utils/airtable');

// Mock data for testing
const MOCK_BASES = [
    { id: 'mock-base-1', name: 'Customer Forms' },
    { id: 'mock-base-2', name: 'Product Feedback' }
];

const MOCK_TABLES = {
    'mock-base-1': [
        {
            id: 'mock-table-1',
            name: 'Contact Forms',
            fields: [
                { id: 'fld1', name: 'Name', type: 'text' },
                { id: 'fld2', name: 'Email', type: 'email' },
                { id: 'fld3', name: 'Role', type: 'singleSelect', options: { choices: [{ name: 'Engineer' }, { name: 'Designer' }, { name: 'Manager' }] } },
                { id: 'fld4', name: 'Message', type: 'multilineText' },
                { id: 'fld5', name: 'Resume', type: 'attachment' }
            ]
        }
    ],
    'mock-base-2': [
        {
            id: 'mock-table-2',
            name: 'Feedback',
            fields: [
                { id: 'fld10', name: 'Product Name', type: 'text' },
                { id: 'fld11', name: 'Rating', type: 'singleSelect', options: { choices: [{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, { name: '5' }] } },
                { id: 'fld12', name: 'Features', type: 'multipleSelects', options: { choices: [{ name: 'UI' }, { name: 'Performance' }, { name: 'Docs' }] } },
                { id: 'fld13', name: 'Comments', type: 'multilineText' }
            ]
        }
    ]
};

router.get('/bases', auth, async (req, res) => {
    try {
        // If user is mock user, return mock data; otherwise use real Airtable API
        if (req.user.profile?.account?.id === 'mock-user-123') {
            return res.json({ bases: MOCK_BASES });
        }
        const data = await listBases(req.user.accessToken);
        res.json(data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        // Fall back to mock data if API fails
        res.json({ bases: MOCK_BASES });
    }
});


router.get('/bases/:baseId/tables', auth, async (req, res) => {
    try {
        // If user is mock user, return mock data
        if (req.user.profile?.account?.id === 'mock-user-123') {
            const tables = MOCK_TABLES[req.params.baseId] || [];
            return res.json({ tables });
        }
        const data = await listTablesForBase(req.user.accessToken, req.params.baseId);
        res.json(data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        // Fall back to mock data if API fails
        const tables = MOCK_TABLES[req.params.baseId] || [];
        res.json({ tables });
    }
});


router.get('/bases/:baseId/tables/:tableId/fields', auth, async (req, res) => {
    try {
        // If user is mock user, return mock data
        if (req.user.profile?.account?.id === 'mock-user-123') {
            const tables = MOCK_TABLES[req.params.baseId] || [];
            const t = tables.find(x => x.id === req.params.tableId || x.name === req.params.tableId);
            if (!t) return res.status(404).json({ error: 'table not found' });
            return res.json({ fields: t.fields || [] });
        }
        const data = await listTablesForBase(req.user.accessToken, req.params.baseId);
        const tables = data.tables || data;
        const t = (tables || []).find(x => x.id === req.params.tableId || x.name === req.params.tableId);
        if (!t) return res.status(404).json({ error: 'table not found' });
        res.json({ fields: t.fields || [] });
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch table fields' });
    }
});


module.exports = router;