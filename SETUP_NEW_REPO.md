# 🆕 Setting Up a New GitHub Repository

## Step 1: Create Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name:** `x-intelligence` (or your preferred name)
   - **Description:** "X Intelligence - SaaS platform for analyzing X/Twitter data"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect Your Local Code to New Repo

After creating the repo, GitHub will show you commands. Use these:

```bash
# Remove old remote (if exists)
git remote remove origin

# Add your new repository
git remote add origin https://github.com/YOUR_USERNAME/x-intelligence.git

# Push your code
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Verify

```bash
git remote -v
```

Should show your new repository URL.

## Step 4: Deploy!

Now follow the deployment guides:
- Quick start: `GITHUB_DEPLOYMENT_STEPS.md`
- Full guide: `DEPLOYMENT_GUIDE.md`

