#!/bin/bash
# auto-deploy.sh - Automated deployment script for KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
export PATH=$PATH:/usr/bin:/usr/local/bin
cd $PROJECT_DIR || exit

# 1. Fetch latest changes from GitHub
echo "[$(date)] Checking for updates..."
git fetch origin main

# 2. Compare local HEAD with remote HEAD
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date)] New version detected! Starting deployment..."
    
    # 3. Pull latest code
    git pull origin main
    
    # 4. Install dependencies (if package.json changed)
    # npm install
    
    # 5. Build the project
    echo "[$(date)] Building project..."
    npm run build
    
    # 6. Restart PM2 service
    echo "[$(date)] Restarting PM2 service..."
    pm2 restart ktltc
    
    echo "[$(date)] Deployment successful!"
else
    echo "[$(date)] No changes detected. Already up to date."
fi
