#!/bin/bash

# Script to prepare and push to GitHub
# This will remove old remote and set up connection to new repo

REPO_NAME="x-intelligence"
GITHUB_USERNAME="Scaler712"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🔧 Preparing to push to GitHub..."
echo ""
echo "Repository: ${REPO_URL}"
echo ""

# Set git config if not already set
if [ -z "$(git config user.email)" ]; then
    git config user.email "kristians@thegrowthsystems.io"
    echo "✅ Git email configured"
fi

if [ -z "$(git config user.name)" ]; then
    git config user.name "Scaler712"
    echo "✅ Git username configured"
fi

# Remove old remote
echo "📡 Removing old remote..."
git remote remove origin 2>/dev/null && echo "✅ Old remote removed" || echo "ℹ️  No old remote to remove"

# Add new remote
echo "➕ Adding new remote..."
git remote add origin ${REPO_URL}
echo "✅ Remote added: ${REPO_URL}"

# Show status
echo ""
echo "📋 Current configuration:"
echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo "   Email: $(git config user.email)"
echo "   Name: $(git config user.name)"
echo ""

echo "🚀 Ready to push!"
echo ""
echo "⚠️  IMPORTANT: Before pushing, make sure you've:"
echo "   1. Created the repository on GitHub: https://github.com/new"
echo "   2. Created a Personal Access Token: https://github.com/settings/tokens"
echo ""
echo "Then run:"
echo "   git push -u origin main"
echo ""
echo "When prompted for password, use your Personal Access Token (not your GitHub password)!"

