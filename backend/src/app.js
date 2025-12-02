const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const authRoutes = require('./routes/auth');
const mockAuthRoutes = require('./routes/mock-auth');
const airtableMetaRoutes = require('./routes/airtableMeta');
const formsRoutes = require('./routes/forms');
const webhooksRoutes = require('./routes/webhooks');
const meRoutes = require('./routes/me');
const uploadRoutes = require('./routes/upload');


const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/auth', authRoutes);
app.use('/auth', mockAuthRoutes);
app.use('/api/airtable', airtableMetaRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/me', meRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/webhooks', webhooksRoutes);


app.get('/', (req, res) => res.json({ ok: true }));


// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

module.exports = app;