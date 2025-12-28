#!/bin/bash

# Quick script to connect to your GitHub repository
# Usage: ./connect-repo.sh [repo-name]

REPO_NAME=${1:-"x-intelligence"}
GITHUB_USERNAME="Scaler712"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🔗 Connecting to GitHub repository..."
echo "Repository: ${REPO_URL}"
echo ""

# Remove old remote if it exists
echo "📡 Removing old remote..."
git remote remove origin 2>/dev/null && echo "✅ Old remote removed" || echo "ℹ️  No old remote found"

# Add new remote
echo "➕ Adding new remote..."
git remote add origin ${REPO_URL}
echo "✅ Remote added: ${REPO_URL}"

# Verify
echo ""
echo "📋 Current remotes:"
git remote -v

echo ""
echo "🚀 Ready to push! Run:"
echo "   git push -u origin main"
echo ""
echo "⚠️  Make sure you've created the repository on GitHub first!"
echo "    Go to: https://github.com/new"

