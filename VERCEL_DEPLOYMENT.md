# Vercel Deployment Guide

This guide explains how to deploy the X Intelligence application to Vercel.

## Architecture Overview

This application consists of:
1. **Frontend**: React + Vite (deployed to Vercel)
2. **Backend**: Node.js + Express + Socket.io (needs persistent connection)

**Important**: Socket.io requires persistent WebSocket connections, which don't work with Vercel's serverless functions. The backend must be deployed separately.

## Deployment Options

### Option 1: Frontend on Vercel + Backend on Railway/Render (Recommended)

**Frontend (Vercel):**
- Fast CDN delivery
- Automatic SSL
- Easy deployments

**Backend (Railway/Render/Fly.io):**
- Supports persistent WebSocket connections
- Can run Node.js server continuously

### Option 2: Full Stack on Railway/Render

Deploy both frontend and backend together on a platform that supports both.

---

## Step 1: Deploy Frontend to Vercel

### Prerequisites
- Vercel account (free tier works)
- GitHub/GitLab/Bitbucket repository with your code

### Steps

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `client` (or leave as root if deploying from root)
     - **Build Command**: `cd client && npm install && npm run build`
     - **Output Directory**: `client/dist`
     - **Install Command**: `npm install && cd client && npm install`

3. **Set Environment Variables in Vercel Dashboard**:
   
   Go to Project Settings → Environment Variables and add:

   ```env
   # Supabase (Public - safe for frontend)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # API URL (your backend deployment URL)
   VITE_API_URL=https://your-backend-url.railway.app
   # OR
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**: Click "Deploy"

---

## Step 2: Deploy Backend Separately

Since Socket.io needs persistent connections, deploy the backend to one of these platforms:

### Option A: Railway (Recommended - Easy Setup)

1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Configure:
   - **Root Directory**: `/` (root of repo)
   - **Start Command**: `node server/index.js`
   - **Build Command**: (leave empty or `npm install`)

6. **Set Environment Variables** in Railway:
   ```env
   SCRAPER_KEY=your_scraper_key
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ENCRYPTION_KEY=your_32_char_encryption_key
   NODE_ENV=production
   ```

7. Railway will provide a URL like: `https://your-app.railway.app`

### Option B: Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: Free tier works for testing

5. **Set Environment Variables** (same as Railway)

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in your project root
3. Follow prompts
4. Set environment variables: `fly secrets set KEY=value`

---

## Step 3: Update Frontend Configuration

After deploying the backend, update your frontend environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to point to your backend deployment URL
3. Redeploy the frontend (or it will auto-deploy on next push)

---

## Step 4: Update Client Code for Production

Update the Socket.io connection URL in your client code:

**File: `client/src/pages/ScraperPage.jsx`**

```jsx
// Replace:
const SOCKET_URL = 'http://localhost:3001';

// With:
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Or create an environment-aware socket connection:

```jsx
const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
```

---

## Step 5: CORS Configuration

Update your backend CORS settings to allow your Vercel domain:

**File: `server/index.js`**

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000",
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.FRONTEND_URL, // Add your Vercel URL
      // Add your custom domain if you have one
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

Set `FRONTEND_URL` environment variable in your backend deployment:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## Environment Variables Summary

### Vercel (Frontend)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://your-backend.railway.app
```

### Railway/Render/Fly.io (Backend)
```env
SCRAPER_KEY=your_scraper_key
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ... (keep secret!)
ENCRYPTION_KEY=your_32_char_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Troubleshooting

### Socket.io Connection Issues
- Check CORS settings in backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check browser console for connection errors
- Ensure backend is running and accessible

### Environment Variables Not Working
- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

---

## Quick Deploy Checklist

- [ ] Backend deployed (Railway/Render/Fly.io)
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set (including `VITE_API_URL`)
- [ ] CORS configured on backend
- [ ] Socket.io URL updated in client code
- [ ] Tested end-to-end

---

## Alternative: Deploy Everything to Railway

If you prefer to keep everything in one place:

1. Deploy to Railway
2. Set root directory to `/`
3. Start command: `node server/index.js`
4. Railway will serve both frontend (if you build it) and backend
5. You can configure Railway to serve static files from `client/dist`

However, Vercel provides better CDN and performance for frontend static assets.

