#!/bin/bash
# Backup script for PostgreSQL database

# Configuration
BACKUP_DIR="/backups"
DOWNLOADS_DIR="$HOME/Downloads/pm-backups"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-pm_auth_db}"
DB_USER="${DB_USERNAME:-postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$DOWNLOADS_DIR"

echo "Starting backup of database: $DB_NAME"

# Perform backup
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE" \
    --verbose \
    --no-owner \
    --no-privileges

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"

    # Compress the backup
    gzip "$BACKUP_FILE"

    # Copy to Downloads folder
    cp "${BACKUP_FILE}.gz" "$DOWNLOADS_DIR/"

    echo "Backup copied to: $DOWNLOADS_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

    # Clean up old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
    find "$DOWNLOADS_DIR" -name "*.sql.gz" -mtime +7 -delete
else
    echo "Backup failed!"
    exit 1
fi