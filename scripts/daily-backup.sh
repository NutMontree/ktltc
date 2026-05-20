#!/bin/bash

# Export PATH เพื่อให้ Cron Job หา mongodump และ tar เจอได้อย่างถูกต้อง
export PATH=$PATH:/usr/bin:/usr/local/bin

# Configuration
BACKUP_DIR="/home/ktltc/backups"
DB_NAME="ktltc_db"
MONGO_USER="nut"
MONGO_PASS="Nut29122539"
AUTH_DB="admin"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Perform backup
echo "[$(date)] Starting backup for $DB_NAME at $DATE..."
if mongodump --db $DB_NAME --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $AUTH_DB --out $BACKUP_DIR/backup-$DATE; then
    echo "[$(date)] Mongodump successful. Compressing..."
    
    # Compress backup
    cd $BACKUP_DIR || exit 1
    if tar -czf backup-$DATE.tar.gz backup-$DATE; then
        rm -rf backup-$DATE
        echo "[$(date)] Backup completed and compressed: $BACKUP_DIR/backup-$DATE.tar.gz"
        
        # Delete backups older than 7 days
        find $BACKUP_DIR -type f -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
        echo "[$(date)] Old backups purged (older than $RETENTION_DAYS days)."
    else
        echo "[$(date)] ERROR: Compression failed!"
        exit 1
    fi
else
    echo "[$(date)] ERROR: Mongodump failed! Please check MongoDB service and credentials."
    exit 1
fi
