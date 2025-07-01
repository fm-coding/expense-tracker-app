#!/bin/bash
# Restore script for PostgreSQL database

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /backups/pm_auth_db_backup_20250623_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-pm_auth_db}"
DB_USER="${DB_USERNAME:-postgres}"

echo "Starting restore of database: $DB_NAME from $BACKUP_FILE"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Drop existing connections
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();"

# Restore database
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE" \
    --verbose

if [ $? -eq 0 ]; then
    echo "Restore completed successfully!"
else
    echo "Restore failed!"
    exit 1
fi