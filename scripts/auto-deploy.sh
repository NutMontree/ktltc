#!/bin/bash
# auto-deploy.sh - Automated deployment script for KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
export PATH=$PATH:/usr/bin:/usr/local/bin
cd $PROJECT_DIR || exit

# 1. Fetch latest changes from GitHub
echo "[$(date)] Checking for updates..."
git fetch origin main

# 2. Compare local HEAD with the last built commit
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse origin/main)
LAST_BUILT_COMMIT=""

if [ -f ".last_built_commit" ]; then
    LAST_BUILT_COMMIT=$(cat .last_built_commit)
fi

if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ] || [ "$LOCAL_HEAD" != "$LAST_BUILT_COMMIT" ]; then
    echo "[$(date)] Update detected! (Local: $LOCAL_HEAD, Remote: $REMOTE_HEAD, Last Built: $LAST_BUILT_COMMIT)"
    
    # 3. Pull latest code if remote is ahead
    if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
        echo "[$(date)] Pulling latest changes..."
        git pull origin main
        LOCAL_HEAD=$(git rev-parse HEAD)
    fi
    
    # 4. Install dependencies if package.json changed
    # if git diff --name-only $LAST_BUILT_COMMIT $LOCAL_HEAD | grep -q "package.json"; then
    #     echo "[$(date)] package.json changed. Installing dependencies..."
    #     npm install
    # fi
    
    # 5. Build the project
    echo "[$(date)] Building project..."
    if npm run build; then
        # 6. Restart PM2 service
        echo "[$(date)] Restarting PM2 service..."
        pm2 restart ktltc
        
        # Save the successful build commit
        echo $LOCAL_HEAD > .last_built_commit
        echo "[$(date)] Deployment successful!"
    else
        echo "[$(date)] Build failed! Deployment aborted."
        exit 1
    fi
else
    echo "[$(date)] No changes detected. Already up to date."
fi
