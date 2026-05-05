#!/bin/bash

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
echo "Starting backup for $DB_NAME at $DATE..."
mongodump --db $DB_NAME --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $AUTH_DB --out $BACKUP_DIR/backup-$DATE

# Compress backup
cd $BACKUP_DIR
tar -czf backup-$DATE.tar.gz backup-$DATE
rm -rf backup-$DATE

# Delete backups older than 7 days
find $BACKUP_DIR -type f -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/backup-$DATE.tar.gz"
