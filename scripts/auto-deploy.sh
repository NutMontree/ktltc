#!/bin/bash
# auto-deploy.sh - Automated deployment script for KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
export PATH=$PATH:/usr/bin:/usr/local/bin
cd $PROJECT_DIR || exit

# 1. Update remote info (fetch only, no pull)
git fetch origin production

# 2. Compare hashes and check if pull is needed
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse origin/production)
LAST_BUILT_COMMIT=""

if [ -f ".last_built_commit" ]; then
    LAST_BUILT_COMMIT=$(cat .last_built_commit)
fi

# PULL & DEPLOY: If the production branch commit differs from the last built commit
if [ "$REMOTE_HEAD" != "$LAST_BUILT_COMMIT" ]; then
    echo "[$(date)] New successful build detected on production branch. Pulling..."
    # Pull production changes into current branch (main)
    git pull origin production --no-rebase
    
    # Refresh LOCAL_HEAD after pull
    LOCAL_HEAD=$(git rev-parse HEAD)
    
    echo "[$(date)] Starting build for commit: $LOCAL_HEAD"
    
    # 3. Build the project
    if npm run build; then
        # 4. Restart PM2 service
        echo "[$(date)] Restarting PM2 service..."
        # Make sure pm2 is in path or use absolute path
        /usr/local/bin/pm2 restart ktltc --update-env || pm2 restart ktltc --update-env
        
        # Save the successful build commit
        echo $REMOTE_HEAD > .last_built_commit
        echo "[$(date)] Deployment successful!"
    else
        echo "[$(date)] Build failed! Deployment aborted."
        exit 1
    fi
else
    echo "[$(date)] Already up to date with the latest production build."
fi
