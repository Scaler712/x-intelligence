# 🚀 Quick Start: Deploy via GitHub (5 Minutes)

## What You Need
- GitHub account ✅
- Vercel account (sign up free)
- Railway account (sign up free)

## Step-by-Step

### 1️⃣ Push Code to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Deploy Frontend (Vercel) - 2 minutes

1. Go to **vercel.com** → Sign up with GitHub
2. Click **"Add New Project"**
3. Select your repository
4. Configure:
   - Build: `cd client && npm install && npm run build`
   - Output: `client/dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_API_URL` = `http://localhost:3001` (update later)
6. Click **"Deploy"**
7. **Copy your Vercel URL** (e.g., `app-abc123.vercel.app`)

### 3️⃣ Deploy Backend (Railway) - 2 minutes

1. Go to **railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add environment variables:
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ENCRYPTION_KEY=generate_with_openssl_rand_base64_32
   FRONTEND_URL=https://your-vercel-url.vercel.app
   NODE_ENV=production
   SCRAPER_KEY=your_key (optional)
   ```
5. **Copy your Railway URL** (e.g., `app-xyz.railway.app`)

### 4️⃣ Connect Them - 1 minute

1. Go back to **Vercel** → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` = `https://your-railway-url.railway.app`
3. Go to Deployments → Click "..." → **"Redeploy"**

### 5️⃣ Done! 🎉

Visit your Vercel URL and test the app!

---

## Environment Variables Quick Reference

**Vercel (Frontend):**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://your-app.railway.app
```

**Railway (Backend):**
```
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
ENCRYPTION_KEY=32_char_random_string
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## Troubleshooting

**Can't connect?**
- Check `VITE_API_URL` matches Railway URL exactly
- Check `FRONTEND_URL` matches Vercel URL exactly
- Redeploy both after changing variables

**Build fails?**
- Check logs in Vercel/Railway dashboard
- Verify Node.js 18+ is selected
- Check all dependencies are in package.json

**Need help?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.

