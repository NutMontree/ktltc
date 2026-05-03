#!/bin/bash
# auto-deploy.sh - Automated deployment script for KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
export PATH=$PATH:/usr/bin:/usr/local/bin
cd $PROJECT_DIR || exit

# 1. Update remote info (fetch only, no pull)
git fetch origin main

# 2. Compare hashes
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse origin/main)
LAST_BUILT_COMMIT=""

if [ -f ".last_built_commit" ]; then
    LAST_BUILT_COMMIT=$(cat .last_built_commit)
fi

# TRIGGER: Build only if we are in sync with GitHub AND this commit hasn't been built
if [ "$LOCAL_HEAD" == "$REMOTE_HEAD" ] && [ "$LOCAL_HEAD" != "$LAST_BUILT_COMMIT" ]; then
    echo "[$(date)] In sync with GitHub. Starting build for commit: $LOCAL_HEAD"
    
    # 3. Build the project
    if npm run build; then
        # 4. Restart PM2 service
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
    # Optional: Log if we are waiting for a push
    if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
        echo "[$(date)] Local is different from GitHub. Waiting for push/pull before building."
    else
        echo "[$(date)] Already up to date and built."
    fi
fi
