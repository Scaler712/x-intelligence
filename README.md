# X Intelligence - SaaS Infrastructure

A multi-tenant SaaS platform for analyzing and collecting X/Twitter data with advanced filtering, AI-powered insights, and cloud storage.

## Features

- ✅ User authentication & multi-tenancy (Supabase Auth)
- ✅ Cloud storage & sync (Supabase Storage)
- ✅ Advanced AI features (OpenAI & Anthropic - user-provided API keys)
- ✅ Advanced export & reporting (PDF & Excel with AI insights)
- ✅ Real-time scraping with WebSocket
- ✅ Tweet filtering and analytics
- ✅ Hook extraction and analysis
- ✅ Batch processing
- ✅ Data comparison tools

## Tech Stack

### Backend
- Node.js + Express
- Socket.io for real-time communication
- Supabase (PostgreSQL, Auth, Storage)
- OpenAI & Anthropic SDKs

### Frontend
- React + Vite
- Tailwind CSS with Electric Design System
- IndexedDB for local caching
- Socket.io client

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Scraper.tech API key (for data collection)
- OpenAI or Anthropic API key (optional, for AI features)

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration: `server/migrations/001_initial_schema.sql`
3. Go to Storage and create these buckets:
   - `scrapes` (private)
   - `exports` (private)
   - `backups` (private)
4. Get your Supabase credentials:
   - Project URL
   - Anon key
   - Service role key (keep secret!)

### 3. Environment Variables

#### Server (`.env` in root)

```env
# Scraper API Key
SCRAPER_KEY=your_scraper_key_here

# Server Port
PORT=3001

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Encryption Key (32 characters minimum)
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

#### Client (`.env` in `client/`)

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 5. Database Migration

Run the SQL migration in your Supabase SQL Editor:
- File: `server/migrations/001_initial_schema.sql`

This creates:
- Tables: users, scrapes, tweets, ai_insights, user_api_keys, exports
- Row Level Security (RLS) policies
- Indexes for performance

### 6. Run Development Servers

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

The app will be available at `http://localhost:5173` (or your Vite port).

## Usage

1. **Register/Login**: Create an account or sign in
2. **Configure API Keys**:
   - Scraper API key (required) - in Settings
   - OpenAI/Anthropic keys (optional) - in Settings for AI features
3. **Start Analyzing**: Enter a Twitter username and start collection
4. **View Results**: Browse tweets, hooks, and analytics
5. **Export**: Download PDF or Excel reports with AI insights
6. **Cloud Sync**: Your data is automatically synced to cloud storage

## Architecture

### Authentication Flow
- Users register/login via Supabase Auth
- JWT tokens are used for API authentication
- Socket.io connections can optionally be authenticated

### Data Flow
1. User initiates scrape → WebSocket connection
2. Server scrapes data → Stores in database + cloud storage
3. Real-time updates → Client via Socket.io
4. Local caching → IndexedDB for offline access
5. Cloud sync → Automatic background sync

### Multi-tenancy
- All data is isolated by `user_id`
- Row Level Security (RLS) policies enforce isolation
- Storage buckets are organized by user ID

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Storage
- `POST /api/storage/sync` - Sync local data to cloud
- `GET /api/storage/scrapes` - List user scrapes
- `GET /api/storage/scrape/:id` - Get scrape data
- `DELETE /api/storage/scrape/:id` - Delete scrape

### AI
- `POST /api/ai/recommendations` - Generate AI recommendations
- `GET /api/ai/insights/:scrapeId` - Get cached insights
- `POST /api/ai/analyze` - Analyze content
- `POST /api/ai/hooks` - Generate hook variations

### API Keys
- `GET /api/api-keys` - List user's API keys
- `POST /api/api-keys` - Store API key (encrypted)
- `PUT /api/api-keys/:id` - Update API key
- `DELETE /api/api-keys/:id` - Delete API key

### Export
- `POST /api/export/generate` - Generate export (PDF/Excel)
- `GET /api/export/history` - Get export history
- `GET /api/export/:id/download` - Get download URL

## Security

- ✅ API keys encrypted at rest (AES-256-GCM)
- ✅ Row Level Security (RLS) for data isolation
- ✅ JWT authentication for all API routes
- ✅ Encrypted storage for user API keys
- ✅ Secure password handling (Supabase Auth)

## Production Deployment

1. Set up production Supabase project
2. Configure environment variables in your hosting platform
3. Build client: `cd client && npm run build`
4. Deploy server (ensure it serves client `dist/` folder)
5. Set up SSL/HTTPS
6. Configure CORS for your domain

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
