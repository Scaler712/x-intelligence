# Fix VITE_API_URL in Vercel

## The Problem

The URL being called is:
```
https://x-intelligence-production.up.railway.app/api/api-keys/api/api-keys
```

Notice the duplicate `/api/api-keys`! This means your `VITE_API_URL` is incorrectly set.

## The Fix

Your `VITE_API_URL` in Vercel should be set to just the base URL, **without** `/api`:

✅ **Correct**: `https://x-intelligence-production.up.railway.app`
❌ **Wrong**: `https://x-intelligence-production.up.railway.app/api/api-keys`
❌ **Wrong**: `https://x-intelligence-production.up.railway.app/api`

## Steps to Fix

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `VITE_API_URL`
3. Change it to: `https://x-intelligence-production.up.railway.app`
   - Must start with `https://`
   - Must NOT end with `/api` or `/api/api-keys`
   - Must NOT have a trailing slash
4. Save the environment variable
5. **Redeploy** your Vercel project

## Why?

The code constructs URLs like: `${API_URL}/api/api-keys`

So if `VITE_API_URL` is set to:
- `https://x-intelligence-production.up.railway.app` → ✅ Works correctly
- `https://x-intelligence-production.up.railway.app/api` → ❌ Creates `/api/api/api-keys`
- `https://x-intelligence-production.up.railway.app/api/api-keys` → ❌ Creates `/api/api-keys/api/api-keys`

The code now automatically strips trailing `/api` paths, but you should still set it correctly.

