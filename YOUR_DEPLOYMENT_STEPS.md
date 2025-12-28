# 🚀 Your Deployment Steps (GitHub: Scaler712)

## ✅ Code is Ready!

All your code is committed and ready to push! ✅

---

## 🆕 Step 1: Create GitHub Repository

1. **Go to:** https://github.com/new

2. **Fill in:**
   - Repository name: `x-intelligence` (or your preferred name)
   - Description: "X Intelligence SaaS Platform"
   - Visibility: Public or Private (your choice)
   - **DO NOT check any boxes** (README, .gitignore, license)

3. **Click "Create repository"**

4. **Copy the repository URL** - it will be:
   ```
   https://github.com/Scaler712/x-intelligence.git
   ```

---

## 🔗 Step 2: Connect Your Code

Once you've created the repository, run these commands:

```bash
# Remove old remote
git remote remove origin

# Add your new repository
git remote add origin https://github.com/Scaler712/x-intelligence.git

# Push your code
git push -u origin main
```

**That's it!** Your code will be on GitHub.

---

## 🚀 Step 3: Deploy to Vercel & Railway

### Deploy Frontend (Vercel)

1. Go to **https://vercel.com**
2. Sign up/Log in with **GitHub**
3. Click **"Add New Project"**
4. Select repository: **`Scaler712/x-intelligence`**
5. Configure:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_API_URL` = `http://localhost:3001` (update after backend)
7. Click **"Deploy"**
8. Copy your Vercel URL (e.g., `x-intelligence-abc.vercel.app`)

### Deploy Backend (Railway)

1. Go to **https://railway.app**
2. Sign up/Log in with **GitHub**
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select repository: **`Scaler712/x-intelligence`**
5. Add Environment Variables:
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ENCRYPTION_KEY=your_32_char_key
   FRONTEND_URL=https://your-vercel-url.vercel.app
   NODE_ENV=production
   SCRAPER_KEY=your_key (optional)
   ```
6. Copy your Railway URL (e.g., `x-intelligence-production.railway.app`)

### Connect Them

1. Go back to **Vercel** → Settings → Environment Variables
2. Update `VITE_API_URL` = `https://your-railway-url.railway.app`
3. Redeploy frontend

---

## ✅ Quick Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Frontend connected to backend
- [ ] Test the app!

---

## 📚 More Help

- **Quick guide:** `GITHUB_DEPLOYMENT_STEPS.md`
- **Complete guide:** `DEPLOYMENT_GUIDE.md`

