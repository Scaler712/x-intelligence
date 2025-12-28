# 🚀 Complete Deployment Guide - GitHub to Vercel + Railway

This guide will walk you through deploying your X Intelligence app using GitHub integration. **No credentials needed** - everything uses OAuth!

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Railway account (free tier works) OR Render account
- [ ] Supabase project set up
- [ ] Scraper.tech API key (optional, can be added later)

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Commit All Changes

Your code is already connected to GitHub. Let's commit all the recent changes:

```bash
# Add all files
git add .

# Commit with a descriptive message
git commit -m "Prepare for deployment: Add Vercel config, update design system, fix Socket.io env vars"

# Push to GitHub
git push origin main
```

**Note:** If you get authentication errors, you may need to set up a GitHub Personal Access Token or SSH key.

---

## Step 2: Deploy Frontend to Vercel (via GitHub)

### 2.1 Connect Vercel to GitHub

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "Sign Up"** (or "Log In" if you have an account)
3. **Choose "Continue with GitHub"** - This uses OAuth, no password needed!
4. **Authorize Vercel** - Click "Authorize Vercel" when prompted
5. **You're in!** You'll see the Vercel dashboard

### 2.2 Import Your Repository

1. **Click "Add New Project"** (big button in dashboard)
2. **Find your repository** - Search for `x-destroyer` or your repo name
3. **Click "Import"** next to your repository

### 2.3 Configure Project Settings

Vercel will auto-detect some settings, but verify/update these:

**Framework Preset:** `Vite` (should auto-detect)

**Root Directory:** 
- Option A: Leave as `/` (root)
- Option B: Set to `client` if you want to deploy only the client folder

**Build and Output Settings:**
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/dist`
- **Install Command:** `npm install && cd client && npm install`

**Node.js Version:** `18.x` or `20.x` (Vercel will auto-select)

### 2.4 Add Environment Variables

**Before clicking "Deploy", add these environment variables:**

Click "Environment Variables" section and add:

```
VITE_SUPABASE_URL
```
Value: `https://your-project-id.supabase.co`

```
VITE_SUPABASE_ANON_KEY
```
Value: `eyJ...` (your Supabase anon/public key)

```
VITE_API_URL
```
Value: `http://localhost:3001` (we'll update this after backend deploys)

**How to add:**
1. Click "Environment Variables"
2. Click "Add" or "+"
3. Enter the name (e.g., `VITE_SUPABASE_URL`)
4. Enter the value
5. Select environments: Production, Preview, Development (check all)
6. Click "Save"

### 2.5 Deploy!

1. **Click "Deploy"** button
2. **Wait 2-3 minutes** - Vercel will:
   - Clone your repo
   - Install dependencies
   - Build your app
   - Deploy to CDN
3. **Get your URL** - You'll see something like `x-intelligence-abc123.vercel.app`

**✅ Frontend is now live!** (But it won't work fully until backend is connected)

---

## Step 3: Deploy Backend to Railway (via GitHub)

### 3.1 Connect Railway to GitHub

1. **Go to [railway.app](https://railway.app)**
2. **Click "Start a New Project"**
3. **Choose "Deploy from GitHub repo"**
4. **Authorize Railway** - Click "Authorize Railway" (OAuth, no password!)
5. **Select your repository** - Find `x-destroyer` or your repo name
6. **Click "Deploy Now"**

### 3.2 Configure Railway Service

Railway will auto-detect Node.js. Verify these settings:

**Service Settings:**
- **Root Directory:** `/` (root of repo)
- **Start Command:** `node server/index.js`
- **Build Command:** (leave empty or `npm install`)

**To check/edit:**
1. Click on your service
2. Go to "Settings" tab
3. Scroll to "Deploy" section

### 3.3 Add Environment Variables

**Critical step!** Add all these environment variables:

1. **Click on your service** in Railway
2. **Go to "Variables" tab**
3. **Click "New Variable"** for each:

```
SCRAPER_KEY
```
Value: Your scraper.tech API key (or leave empty if you'll add it later)

```
PORT
```
Value: `3001`

```
SUPABASE_URL
```
Value: `https://your-project-id.supabase.co`

```
SUPABASE_ANON_KEY
```
Value: `eyJ...` (your Supabase anon key)

```
SUPABASE_SERVICE_KEY
```
Value: `eyJ...` (your Supabase service role key - **KEEP SECRET!**)

```
ENCRYPTION_KEY
```
Value: A 32+ character random string
Generate with: `openssl rand -base64 32`

```
FRONTEND_URL
```
Value: `https://your-app.vercel.app` (your Vercel URL from Step 2)

```
NODE_ENV
```
Value: `production`

**Important:** After adding `FRONTEND_URL`, Railway will automatically redeploy.

### 3.4 Get Your Backend URL

1. **Wait for deployment** (usually 1-2 minutes)
2. **Click on your service**
3. **Go to "Settings" tab**
4. **Find "Domains" section**
5. **Copy the Railway URL** - Something like `your-app.railway.app`

**✅ Backend is now live!**

---

## Step 4: Connect Frontend to Backend

### 4.1 Update Vercel Environment Variable

1. **Go back to Vercel Dashboard**
2. **Click on your project**
3. **Go to "Settings" → "Environment Variables"**
4. **Find `VITE_API_URL`**
5. **Click the three dots (...) → "Edit"**
6. **Update value to:** `https://your-app.railway.app` (your Railway URL)
7. **Click "Save"**

### 4.2 Redeploy Frontend

1. **Go to "Deployments" tab** in Vercel
2. **Find your latest deployment**
3. **Click the three dots (...) → "Redeploy"**
4. **Confirm redeploy**

**This will rebuild with the new API URL!**

---

## Step 5: Verify Everything Works

### 5.1 Test Frontend

1. **Visit your Vercel URL:** `https://your-app.vercel.app`
2. **You should see the login page**
3. **Try registering a new account**

### 5.2 Test Backend Connection

1. **Open browser DevTools (F12)**
2. **Go to "Console" tab**
3. **Try logging in**
4. **Check for any connection errors**

### 5.3 Test Socket.io (Scraping Feature)

1. **Log in to your app**
2. **Go to Dashboard**
3. **Try starting a scrape**
4. **Check if real-time updates work**

---

## 🔧 Troubleshooting

### Problem: Frontend can't connect to backend

**Solution:**
- Check `VITE_API_URL` in Vercel matches Railway URL exactly
- Check `FRONTEND_URL` in Railway matches Vercel URL exactly
- Verify CORS settings in `server/index.js` (already updated)
- Check Railway logs: Railway Dashboard → Your Service → "Deployments" → Click latest → "View Logs"

### Problem: Socket.io connection fails

**Solution:**
- Socket.io needs WebSocket support (Railway has this)
- Check Railway logs for errors
- Verify `VITE_API_URL` includes `https://` (not `http://`)
- Check browser console for specific error messages

### Problem: Environment variables not working

**Solution:**
- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after adding/updating variables
- Check variable names are exact (case-sensitive)
- Verify variables are set for "Production" environment

### Problem: Build fails

**Solution:**
- Check build logs in Vercel/Railway
- Verify Node.js version (should be 18+)
- Check that all dependencies are in `package.json`
- Look for specific error messages in logs

### Problem: Database connection errors

**Solution:**
- Verify Supabase credentials are correct
- Check Supabase project is active
- Verify database migrations have been run
- Check Supabase logs in dashboard

---

## 📝 Quick Reference

### Vercel Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://your-app.railway.app
```

### Railway Environment Variables
```
SCRAPER_KEY=your_key
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
ENCRYPTION_KEY=your_32_char_key
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Railway connected to GitHub
- [ ] Backend deployed to Railway
- [ ] Backend environment variables set
- [ ] `VITE_API_URL` updated in Vercel
- [ ] `FRONTEND_URL` set in Railway
- [ ] Frontend redeployed
- [ ] Tested login/registration
- [ ] Tested scraping feature
- [ ] Everything works! 🚀

---

## 🔄 Future Updates

**To update your app:**
1. Make changes locally
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push origin main`
4. **Vercel and Railway will auto-deploy!** (if auto-deploy is enabled)

**To disable auto-deploy:**
- Vercel: Settings → Git → Disable "Automatic deployments"
- Railway: Settings → Source → Disable auto-deploy

---

## 💡 Pro Tips

1. **Use Railway's free tier** - 500 hours/month free (plenty for testing)
2. **Vercel free tier** - Unlimited deployments, great for frontend
3. **Monitor usage** - Check Railway dashboard for usage stats
4. **Set up custom domains** - Both platforms support custom domains
5. **Enable preview deployments** - Vercel creates preview URLs for PRs

---

## 🆘 Need Help?

If you run into issues:
1. Check the logs in both Vercel and Railway dashboards
2. Verify all environment variables are set correctly
3. Check browser console for client-side errors
4. Review this guide step-by-step

**You're all set!** Your app should now be live and accessible worldwide! 🌍

