#!/bin/bash
# auto-deploy.sh - Automated deployment script for KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
export PATH=$PATH:/usr/bin:/usr/local/bin
cd $PROJECT_DIR || exit

# 1. Update remote info (fetch only, no pull)
git fetch origin main

# 2. Compare hashes and check if pull is needed
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse origin/main)
LAST_BUILT_COMMIT=""

if [ -f ".last_built_commit" ]; then
    LAST_BUILT_COMMIT=$(cat .last_built_commit)
fi

# PULL: If local is behind remote, pull it
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
    echo "[$(date)] Mismatch detected. Pulling latest changes..."
    # Attempt to pull. If there are conflicts, it might fail, which is safe.
    git pull origin main
    # Refresh LOCAL_HEAD after pull
    LOCAL_HEAD=$(git rev-parse HEAD)
fi

# TRIGGER: Build only if this commit hasn't been built
if [ "$LOCAL_HEAD" != "$LAST_BUILT_COMMIT" ]; then
    echo "[$(date)] Starting build for commit: $LOCAL_HEAD"
    
    # 3. Build the project
    if npm run build; then
        # 4. Restart PM2 service
        echo "[$(date)] Restarting PM2 service..."
        # Make sure pm2 is in path or use absolute path
        /usr/local/bin/pm2 restart ktltc || pm2 restart ktltc
        
        # Save the successful build commit
        echo $LOCAL_HEAD > .last_built_commit
        echo "[$(date)] Deployment successful!"
    else
        echo "[$(date)] Build failed! Deployment aborted."
        exit 1
    fi
else
    echo "[$(date)] Already up to date and built."
fi
