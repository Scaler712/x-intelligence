# Supabase Setup - Quick Instructions

## ✅ Environment Files Created

I've created/updated your environment files with your Supabase credentials:
- `.env` (server) - ✅ Updated
- `client/.env` (client) - ✅ Created

## 📋 Next Steps

### 1. Run Database Migration

You need to run the SQL migration in Supabase SQL Editor:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gzvhhrkwhozkphctakpd
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `server/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- All database tables (users, scrapes, tweets, ai_insights, user_api_keys, exports)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic user profile creation

### 2. Create Storage Buckets (Automated)

Run this command to create the storage buckets:

```bash
node server/scripts/createStorageBuckets.js
```

Or create them manually in Supabase Dashboard > Storage:
- `scrapes` (private, 50MB limit)
- `exports` (private, 50MB limit)
- `backups` (private, 50MB limit)

### 3. Verify Setup

After running the migration and creating buckets, verify:

1. **Database Tables**: Go to Table Editor → You should see: users, scrapes, tweets, ai_insights, user_api_keys, exports
2. **Storage Buckets**: Go to Storage → You should see: scrapes, exports, backups
3. **Test the app**: Run `npm run dev` and try registering a new user

## 🔑 Important Notes

- **Encryption Key**: Generated and saved in `.env` (ENCRYPTION_KEY)
- **Service Role Key**: Keep this SECRET! It's in `.env` (SUPABASE_SERVICE_KEY)
- **Anon Key**: Safe to use in client code (VITE_SUPABASE_ANON_KEY)

## 🚀 Ready to Go!

Once you've:
1. ✅ Run the SQL migration
2. ✅ Created storage buckets (or run the script)
3. ✅ Added your SCRAPER_KEY to `.env` (if you have one)

You can start the app:
```bash
npm run dev        # Terminal 1 - Server
cd client && npm run dev  # Terminal 2 - Client
```

Then visit http://localhost:5173 (or your Vite port) and register/login!


