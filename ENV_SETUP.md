# Environment Variables Setup Guide

## Critical Issue: Internal Railway URLs

If you're seeing errors like:
- `WebSocket connection to 'wss://x-intelligence.railway.internal/...' failed`
- `405 Method Not Allowed` errors
- `Unexpected token '<', "<!doctype "... is not valid JSON`

This means your `VITE_API_URL` is set to an **internal Railway URL** which browsers cannot access.

## Fix: Use Public Railway URL

### Step 1: Get Your Railway Public URL

1. Go to your Railway project: https://railway.app
2. Click on your service
3. Go to the **Settings** tab
4. Find **Domains** section
5. You should see a public URL like: `https://your-project-name.up.railway.app`
6. **Copy this URL** (it should NOT contain `.internal`)

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Find or add `VITE_API_URL`
5. Set it to your **public Railway URL** (e.g., `https://your-project-name.up.railway.app`)
6. **Important**: Make sure it's NOT set to `x-intelligence.railway.internal`
7. Save the environment variable
8. **Redeploy** your Vercel project for the change to take effect

### Step 3: Verify

After redeploying, check your browser console:
- You should NOT see `railway.internal` in any URLs
- WebSocket connections should use your public Railway URL
- API calls should work properly

## Required Environment Variables

### Vercel (Frontend)
- `VITE_API_URL` - Your public Railway URL (e.g., `https://your-project.up.railway.app`)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Railway (Backend)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `ENCRYPTION_KEY` - 32 character encryption key (for API key encryption)
- `SCRAPER_KEY` - Your scraper.tech API key (optional, users can set in UI)
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)
- `PORT` - Port number (Railway sets this automatically, but can override)

## Common Mistakes

❌ **Wrong**: `VITE_API_URL=https://x-intelligence.railway.internal`
✅ **Correct**: `VITE_API_URL=https://your-project-name.up.railway.app`

❌ **Wrong**: Using internal Railway hostname
✅ **Correct**: Using Railway public domain

❌ **Wrong**: Not redeploying after changing environment variables
✅ **Correct**: Always redeploy Vercel after changing `VITE_*` variables

