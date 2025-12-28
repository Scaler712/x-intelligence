#!/bin/bash

# Script to push code to GitHub
# Run this AFTER you've created the repository on GitHub

echo "🚀 Pushing code to GitHub..."
echo ""

# Check if repository exists
if git ls-remote origin &>/dev/null; then
    echo "✅ Repository found!"
    echo "📤 Pushing code..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Success! Your code is now on GitHub!"
        echo "🌐 Repository: https://github.com/Scaler712/x-intelligence"
        echo ""
        echo "Next steps:"
        echo "1. Go to Vercel.com and deploy your frontend"
        echo "2. Go to Railway.app and deploy your backend"
        echo "3. See YOUR_DEPLOYMENT_STEPS.md for details"
    else
        echo "❌ Push failed. Check the error above."
    fi
else
    echo "❌ Repository not found!"
    echo ""
    echo "Please create the repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: x-intelligence"
    echo "3. Don't check any boxes"
    echo "4. Click 'Create repository'"
    echo "5. Then run this script again"
fi

