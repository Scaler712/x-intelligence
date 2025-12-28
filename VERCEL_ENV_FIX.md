# Fix Vercel Environment Variable

## The Problem

The API URL is malformed. Looking at the error:
```
POST https://x-intelligence.vercel.app/x-intelligence-production.up.railway.app/api/api-keys
```

It should be:
```
POST https://x-intelligence-production.up.railway.app/api/api-keys
```

## The Fix

Your `VITE_API_URL` environment variable in Vercel is incorrect.

### Step 1: Check Current Value

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL`
5. Check what it's currently set to

### Step 2: Fix the Value

The `VITE_API_URL` should be set to your Railway public URL **with** `https://`:

✅ **Correct**: `https://x-intelligence-production.up.railway.app`
❌ **Wrong**: `x-intelligence-production.up.railway.app` (missing https://)
❌ **Wrong**: `x-intelligence.vercel.app/x-intelligence-production.up.railway.app` (malformed)

### Step 3: Update in Vercel

1. Edit the `VITE_API_URL` variable
2. Set it to: `https://x-intelligence-production.up.railway.app`
3. Make sure there's no trailing slash
4. Save the environment variable
5. **Redeploy** your Vercel project (or it should auto-redeploy)

### Step 4: Verify

After redeploying, check the browser console. The API calls should now go to:
- `https://x-intelligence-production.up.railway.app/api/api-keys` ✅
- NOT `https://x-intelligence.vercel.app/...` ❌

## Quick Checklist

- [ ] `VITE_API_URL` starts with `https://`
- [ ] `VITE_API_URL` is your Railway URL (not Vercel URL)
- [ ] No trailing slash at the end
- [ ] Vercel project has been redeployed after the change

