#!/bin/bash

# Script to connect your local code to a new GitHub repository
# Usage: ./connect-to-new-repo.sh YOUR_GITHUB_USERNAME REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./connect-to-new-repo.sh YOUR_GITHUB_USERNAME REPO_NAME"
    echo "Example: ./connect-to-new-repo.sh johndoe x-intelligence"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Connecting to new GitHub repository..."
echo "Repository URL: ${REPO_URL}"
echo ""

# Remove old remote if it exists
echo "📡 Removing old remote..."
git remote remove origin 2>/dev/null || echo "No old remote to remove"

# Add new remote
echo "➕ Adding new remote..."
git remote add origin ${REPO_URL}

# Verify
echo ""
echo "✅ Remote configured:"
git remote -v

echo ""
echo "📤 Ready to push! Run:"
echo "   git push -u origin main"
echo ""
echo "Or if you get an error about the branch name, try:"
echo "   git push -u origin main:main"

