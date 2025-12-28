# Supabase Setup Guide

## Quick Setup

To set up Supabase for this project, you have two options:

### Option 1: Automated Setup Script (Recommended)

1. Get your Supabase credentials from your Supabase project dashboard:
   - Go to Project Settings > API
   - Copy your **Project URL**
   - Copy your **service_role** key (keep this secret!)

2. Set them in your `.env` file OR run the setup script:

```bash
# Add to .env file
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ... (your service role key)

# Then run the setup script
node server/scripts/setupSupabase.js
```

The script will:
- ✅ Run the database migration
- ✅ Create storage buckets (scrapes, exports, backups)
- ✅ Verify everything is set up correctly

### Option 2: Manual Setup

#### Step 1: Database Migration

1. Go to your Supabase project dashboard
2. Click on **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `server/migrations/001_initial_schema.sql`
5. Run the query

This will create:
- All necessary tables (users, scrapes, tweets, ai_insights, user_api_keys, exports)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic user profile creation

#### Step 2: Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets (click "New bucket"):

   **Bucket: `scrapes`**
   - Public: No (Private)
   - File size limit: 50 MB
   - Allowed MIME types: `application/json`

   **Bucket: `exports`**
   - Public: No (Private)
   - File size limit: 50 MB
   - Allowed MIME types: `application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

   **Bucket: `backups`**
   - Public: No (Private)
   - File size limit: 50 MB

#### Step 3: Environment Variables

Add these to your `.env` file (root directory):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ... (anon/public key)
SUPABASE_SERVICE_KEY=eyJ... (service_role key - KEEP SECRET!)
ENCRYPTION_KEY=<generate a 32+ character random string>
```

Generate encryption key:
```bash
openssl rand -base64 32
```

Add these to `client/.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon/public key)
VITE_API_URL=http://localhost:3001
```

## Verify Setup

After setup, you can verify everything is working:

1. Check database tables exist:
   - Go to Table Editor in Supabase
   - You should see: users, scrapes, tweets, ai_insights, user_api_keys, exports

2. Check storage buckets:
   - Go to Storage
   - You should see: scrapes, exports, backups

3. Test the connection:
   ```bash
   npm run dev
   ```
   - Try registering a new user
   - The user should be created in the `users` table automatically

## Troubleshooting

### Migration fails
- Make sure you're running it in the SQL Editor with proper permissions
- Check for any error messages and resolve them
- The migration is idempotent (safe to run multiple times)

### Storage bucket creation fails
- Make sure you have proper permissions
- Buckets are created in the Storage section, not via SQL

### Authentication not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in `client/.env`
- Check browser console for any Supabase errors
- Make sure email confirmation is disabled (or configure it in Supabase Auth settings)

## Need Help?

If you encounter issues, check:
1. Supabase project is active (not paused)
2. All environment variables are set correctly
3. Migration SQL was executed successfully
4. Storage buckets exist and are private


