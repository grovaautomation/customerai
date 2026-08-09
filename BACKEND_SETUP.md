# Customer AI Backend Setup

## Overview

Backend untuk Customer AI Lead Generation Platform menggunakan:
- **API**: Next.js API Route Handlers
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Better Auth (credentials provider)
- **Background**: PM2 Worker
- **WhatsApp**: Evolution API (placeholder)

## Quick Start

### 1. Environment Variables

```bash
# Already configured in .env.local
DATABASE_URL=postgresql://customerai:CustomerAI_Secure2026!@localhost:5432/customerai
AUTH_SECRET=8iiEZxCuRtq1q/KjfY4tnpF8jVdoQrph
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CustomerAI_Admin2026!
```

### 2. Database

PostgreSQL sudah running dan schema sudah di-push.

### 3. Start Dev Server

```bash
cd /home/ubuntu/projects/customerai
npm run dev
```

### 4. Start Worker (Background)

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in` | Login dengan email/password |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/sign-out` | Logout |

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/[id]` | Get campaign detail |
| PATCH | `/api/campaigns/[id]` | Update campaign |
| DELETE | `/api/campaigns/[id]` | Delete campaign |
| GET | `/api/campaigns/[id]/progress` | SSE progress stream |
| GET | `/api/campaigns/[id]/leads` | Get campaign leads |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List all leads |

### Connectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/connectors` | Get WhatsApp connector status |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/[campaignId]` | Download Excel file |

## PM2 Commands

```bash
# View status
pm2 list

# View worker logs
pm2 logs customerai-worker

# Restart worker
pm2 restart customerai-worker

# Stop worker
pm2 stop customerai-worker

# Save state
pm2 save
```

## Database Commands

```bash
# Push schema changes
DATABASE_URL="postgresql://customerai:CustomerAI_Secure2026!@localhost:5432/customerai" npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Development

```bash
# Start dev server
npm run dev

# Start worker (separate terminal)
npm run worker

# Build for production
npm run build
```

## Security Notes

1. **Credentials**: Admin credentials ada di `.env.local` - JANGAN commit!
2. **Evolution API**: Setup URL dan API key saat deployment
3. **Database**: Hanya accessible via localhost
4. **Auth**: All API routes protected
