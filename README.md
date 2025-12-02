# Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create dynamic forms based on Airtable table schemas, apply conditional logic, and sync responses between the app and Airtable using OAuth and webhooks.

## Features

✅ **Airtable OAuth Login** — Secure OAuth 2.0 authentication  
✅ **Dynamic Form Builder** — Create forms by selecting Airtable bases, tables, and fields  
✅ **Conditional Logic** — Show/hide fields based on user answers using AND/OR operators  
✅ **Form Responses** — Save responses to both Airtable and MongoDB  
✅ **Webhook Sync** — Automatically sync Airtable record updates back to the database  
✅ **Mock OAuth** — Built-in mock login for testing without real Airtable credentials  
✅ **Token Refresh** — Automatic Airtable access token refresh when expired  
✅ **File Uploads** — Support for attachment fields with file upload

## Tech Stack

- **Frontend**: React 19 + React Router 7 + Vite
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **Authentication**: Airtable OAuth 2.0 + JWT
- **File Storage**: Local disk (configurable to S3)
- **Webhooks**: Airtable webhooks with HMAC-SHA256 signature verification

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Airtable account with OAuth app credentials (optional for testing)

## Local Setup

### 1. Clone and Install Dependencies

```bash
git clone <repo-url>
cd Airtable-Connected-Dynamic-Form-Builder

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

Copy `sample.env.example` and create `.env` files:

**`backend/.env`:**

```dotenv
PORT=4000
MONGODB_URI=mongodb://localhost:27017/airtable-forms
JWT_SECRET=your-secret-key-change-this

# For uploading files
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# Airtable OAuth (get from https://airtable.com/create/oauth)
AIRTABLE_OAUTH_AUTHORIZE_URL=https://airtable.com/oauth2/v1/authorize
AIRTABLE_OAUTH_TOKEN_URL=https://airtable.com/oauth2/v1/token
AIRTABLE_CLIENT_ID=your_client_id
AIRTABLE_CLIENT_SECRET=your_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:5173/oauth/callback

# Webhooks
AIRTABLE_WEBHOOK_SECRET=your_webhook_secret_from_airtable
```

**`frontend/.env.local`:**

```dotenv
VITE_API_URL=http://localhost:4000
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 4. Testing Without Airtable Credentials

Click **"Mock Login"** on the dashboard to test with mock Airtable data (includes sample bases and tables).

### 5. Testing With Real Airtable

1. Create an OAuth app at https://airtable.com/create/oauth
2. Set redirect URI to `http://localhost:5173/oauth/callback`
3. Add Client ID and Secret to `backend/.env`
4. Click "Log in with Airtable" to authenticate

## API Endpoints

### Authentication

- `GET /auth/airtable` — Start Airtable OAuth flow
- `GET /auth/airtable/callback` — OAuth callback (handled by backend)
- `GET /auth/mock-airtable` — Mock login for testing

### User

- `GET /api/me` — Get current user profile (requires auth)

### Airtable Metadata

- `GET /api/airtable/bases` — List user's Airtable bases (requires auth)
- `GET /api/airtable/bases/:baseId/tables` — List tables in a base (requires auth)
- `GET /api/airtable/bases/:baseId/tables/:tableId/fields` — Get table fields (requires auth)

### Forms

- `POST /api/forms` — Create a form (requires auth)
- `GET /api/forms` — List user's forms (requires auth)
- `GET /api/forms/:formId` — Get form details (public)
- `POST /api/forms/:formId/submit` — Submit form responses (public)
- `GET /api/forms/:formId/responses` — List form responses (requires auth)

### File Upload

- `POST /api/upload` — Upload attachment files (requires auth)

### Webhooks

- `POST /webhooks/airtable` — Airtable webhook handler (signature verified)

## Core Components

### Frontend

- `src/pages/Dashboard.jsx` — Login and main navigation
- `src/pages/FormBuilder.jsx` — Create/edit forms
- `src/pages/FormsList.jsx` — View user's forms
- `src/pages/FormViewer.jsx` — Fill and submit forms (public)
- `src/pages/Responses.jsx` — View form responses
- `src/components/FieldPreview.jsx` — Render form fields
- `src/components/ProtectedRoute.jsx` — Auth guard
- `src/utils/conditional.js` — Conditional logic evaluation

### Backend

- `src/models/User.js` — User schema (OAuth tokens, profile)
- `src/models/Form.js` — Form definition schema
- `src/models/Response.js` — Form responses schema
- `src/routes/auth.js` — OAuth authentication
- `src/routes/forms.js` — Form CRUD operations
- `src/routes/webhooks.js` — Airtable webhook handling
- `src/utils/airtable.js` — Airtable API helpers
- `src/utils/conditional.js` — Conditional logic (shared with frontend)
- `src/middleware/auth.js` — JWT authentication + token refresh

## Testing

### Unit Tests

```bash
cd backend
npm test
# Runs Jest tests for conditional logic
```

### Manual Testing Checklist

- [ ] Mock login works
- [ ] Create form with selected fields
- [ ] Form appears in "My forms"
- [ ] Fill form with conditional logic
- [ ] Submit form saves to DB and Airtable
- [ ] Responses appear in responses list
- [ ] File upload works for attachments
- [ ] Logout clears token

## Deployment

### Frontend (Vercel)

1. Push repo to GitHub
2. Go to https://vercel.com and import repository
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
4. Deploy

### Backend (Render or Railway)

**Using Render:**

1. Push repo to GitHub
2. Go to https://render.com and create new Web Service
3. Connect GitHub repository
4. Set environment variables from `sample.env.example`
5. Build command: `cd backend && npm install`
6. Start command: `npm start`
7. Deploy

**Using Railway:**

1. Push repo to GitHub
2. Go to https://railway.app and link GitHub
3. Add environment variables
4. Railway auto-detects Node.js and runs `npm start`

### MongoDB Cloud (Atlas)

1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
3. Add to backend `.env` as `MONGODB_URI`

### Environment Variables for Production

```dotenv
# Backend
PORT=3000 (or assigned by platform)
MONGODB_URI=mongodb+srv://... (from Atlas)
JWT_SECRET=generate-a-long-random-string
BACKEND_URL=https://your-backend.com
FRONTEND_URL=https://your-frontend.com

# Airtable
AIRTABLE_CLIENT_ID=your_production_client_id
AIRTABLE_CLIENT_SECRET=your_production_client_secret
AIRTABLE_REDIRECT_URI=https://your-frontend.com/oauth/callback
AIRTABLE_WEBHOOK_SECRET=from_airtable_webhook_settings
```

## Webhook Setup (Advanced)

To enable Airtable webhooks:

1. In your Airtable base, go to **Automations** → **Webhooks**
2. Add webhook URL: `https://your-backend.com/webhooks/airtable`
3. Copy the webhook secret and add to `AIRTABLE_WEBHOOK_SECRET` in backend `.env`
4. Subscribe to events: `record.created`, `record.updated`, `record.destroyed`

When enabled, updates to Airtable records will automatically sync back to your MongoDB database.

## File Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── helpers/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.local
├── sample.env.example
└── README.md
```

## Troubleshooting

**"Invalid client_id or mismatched redirect_uri"**

- Ensure your Airtable app's redirect URI matches `AIRTABLE_REDIRECT_URI` in `.env`
- Use mock login to test without real credentials

**"MongoDB connected" but forms won't save**

- Check `MONGODB_URI` is correct and database is accessible
- Ensure MongoDB is running locally or check Atlas cluster status

**File uploads fail**

- Backend must have write permissions to `backend/uploads` directory
- Check `BACKEND_URL` is set correctly for file URL generation

**Token errors after login**

- Check `JWT_SECRET` is set (should be same in production)
- Check browser localStorage for token: `console.log(localStorage.getItem('token'))`
