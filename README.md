# LeadFlow CRM — Urban Cruise

Automated Lead Management System that centralizes leads from Meta Ads, Google Ads, and website forms into a single dashboard.

## Tech Stack

- **Frontend:** React 18 + Vite, TailwindCSS, Recharts, React Router v6, Axios
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB
- **Auth:** JWT access + refresh tokens, bcryptjs
- **Integrations:** Meta Graph API (webhook), Google Ads API, Nodemailer
- **Exports:** xlsx (Excel), pdfkit (PDF)

## Project Structure

```
leadflow-crm/
├── client/          # React Vite frontend (port 5173)
└── server/          # Express backend (port 5000)
```

## Quick Start

### 1. Clone & install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env with your credentials
```

### 3. Start development servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open http://localhost:5173

### 4. Create first admin user

Register via the UI at `/register` — the first user can be promoted to admin manually in MongoDB or by editing the `role` field.

## Environment Variables

Copy `.env.example` to `server/.env` and fill in:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `META_APP_ID` | Meta (Facebook) App ID |
| `META_APP_SECRET` | Meta App Secret |
| `META_VERIFY_TOKEN` | Custom token for Meta webhook verification |
| `META_ACCESS_TOKEN` | Page access token for fetching lead data |
| `GOOGLE_ADS_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API developer token |
| `GOOGLE_ADS_REFRESH_TOKEN` | OAuth2 refresh token |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads customer ID |
| `EMAIL_HOST` | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP password / app password |
| `CLIENT_URL` | Frontend URL (http://localhost:5173) |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List leads (filter, paginate, sort) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead detail |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead (admin/manager) |
| PUT | `/api/leads/bulk-update` | Bulk status/assignment change |
| POST | `/api/leads/:id/notes` | Add note to lead |

### Integrations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/integrations/website/submit` | API Key | Receive website form lead |
| GET | `/api/integrations/meta/webhook` | None | Meta webhook verification |
| POST | `/api/integrations/meta/webhook` | None | Receive Meta leads |
| POST | `/api/integrations/google/sync` | JWT | Sync Google Ads leads |
| GET | `/api/integrations/status` | JWT | Integration status |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | KPI summary |
| GET | `/api/analytics/by-source` | Leads by source |
| GET | `/api/analytics/over-time?period=7d\|30d\|90d` | Leads trend |
| GET | `/api/analytics/funnel` | Conversion funnel |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/export?format=excel\|pdf` | Download report |

## Meta Ads Integration

1. Go to [Meta for Developers](https://developers.facebook.com) → Create App
2. Add **Lead Generation** product
3. Configure Webhook with:
   - **Callback URL:** `https://your-domain.com/api/integrations/meta/webhook`
   - **Verify Token:** value from `META_VERIFY_TOKEN` env var
4. Subscribe to `leadgen` events on your Facebook Page

## Google Ads Integration

1. Create a Google Cloud project and enable Google Ads API
2. Create OAuth2 credentials
3. Generate a refresh token via OAuth Playground
4. Set `GOOGLE_ADS_*` environment variables
5. Use the manual sync button in the app or add a cron job

## Website Form Integration

1. Go to **Integrations → Website** in the app
2. Create an API key
3. POST to `/api/integrations/website/submit` with header `X-API-Key: your_key`

```js
fetch('https://your-domain.com/api/integrations/website/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lf_your_key' },
  body: JSON.stringify({ name, email, phone, service, utmSource, utmMedium, utmCampaign })
})
```

## User Roles

| Role | Permissions |
|---|---|
| `admin` | Full access — leads, users, settings, integrations |
| `manager` | Leads (create/update/assign/delete), campaigns, analytics |
| `sales_rep` | Own leads only (create/update), notifications |

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Any Node host)
```bash
cd server
npm start
```

Set `CLIENT_URL` to your Vercel domain in the server .env.

---

Built for **Urban Cruise** | LeadFlow CRM v1.0
