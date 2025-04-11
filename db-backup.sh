#!/bin/bash

# --- Configuration ---
# Adjust these variables to match your environment

# Docker Compose file path
COMPOSE_FILE="compose-postgres.yml"
# Docker Compose PostgreSQL service name
DB_SERVICE="postgres"
# PostgreSQL user (often matches Directus config)
DB_USER="directus"
# PostgreSQL database name (often matches Directus config)
DB_NAME="directus"
# Main directory to store all backups
BACKUP_DIR="backups"
# Path to the Directus .env file (relative to script location or absolute)
ENV_FILE=".env"
# Name of the Docker volume used for Directus uploads/assets
# Find this using 'docker volume ls' or 'docker inspect <directus_container>'
UPLOADS_VOLUME="uploads" # <<<--- IMPORTANT: CHANGE THIS TO YOUR ACTUAL VOLUME NAME
UPLOADS_DIR="uploads" # <<<--- IMPORTANT: CHANGE THIS TO YOUR ACTUAL VOLUME NAME
# Path to the Directus extensions directory (relative to script location or absolute)
EXTENSIONS_DIR="extensions"       # <<<--- CHANGE THIS if your extensions are elsewhere
DB_PASSWORD_ENV_VAR="POSTGRES_PASSWORD"

# --- Script Logic ---

echo "Starting Directus full backup process..."

# 1. Create Timestamped Backup Subdirectory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FULL_BACKUP_SUBDIR="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$FULL_BACKUP_SUBDIR"
if [ $? -ne 0 ]; then
    echo "Error: Could not create backup subdirectory '$FULL_BACKUP_SUBDIR'."
    exit 1
fi
echo "Backup target directory: $FULL_BACKUP_SUBDIR"

# Flag to track if any part of the backup failed
BACKUP_FAILED=false

# 2. Configuration (.env) Backup
echo "--- Backing up configuration file ($ENV_FILE)..."
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$FULL_BACKUP_SUBDIR/config.env.backup"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to copy '$ENV_FILE'."
        BACKUP_FAILED=true
    else
        echo "Configuration file backed up successfully."
        # Attempt to read DB password from .env for pg_dump
        # Basic extraction, might need adjustment if password contains '=' or needs complex parsing
        DB_PASSWORD=$(grep "^$DB_PASSWORD_ENV_VAR=" "$ENV_FILE" | head -n 1 | cut -d '=' -f2-)
        if [ -z "$DB_PASSWORD" ]; then
            echo "Warning: Could not extract DB_PASSWORD from '$ENV_FILE'. Database backup might require manual password input or fail if password is required."
        fi
    fi
else
    echo "Warning: Configuration file '$ENV_FILE' not found. Skipping config backup."
    # No .env means we likely don't have the password automatically
    DB_PASSWORD=""
fi

# 3. Database Backup (PostgreSQL)
echo "--- Backing up PostgreSQL database ($DB_NAME)..."
# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: Docker Compose file not found at '$COMPOSE_FILE'. Skipping database backup."
    BACKUP_FAILED=true
else
    # Prepare password option if found
    PGPASSWORD_OPT=""
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD_OPT="-e PGPASSWORD=$DB_PASSWORD"
        echo "Using password from .env file for database backup."
    else
         echo "Warning: Database password not found in .env. Backup might fail or prompt if password required."
    fi

    docker compose -f $COMPOSE_FILE exec -T $PGPASSWORD_OPT \
        $DB_SERVICE \
        pg_dump -U $DB_USER -d $DB_NAME | gzip > "$FULL_BACKUP_SUBDIR/database.sql.gz"

    # Check pg_dump exit status ($PIPESTATUS[0] checks the first command in a pipe)
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        echo "Error: Database backup command failed (exit code ${PIPESTATUS[0]})."
        BACKUP_FAILED=true
        # Clean up potentially empty/corrupt file
        rm "$FULL_BACKUP_SUBDIR/database.sql.gz" 2>/dev/null
    else
        echo "Database backup successful."
    fi
fi

# # 4. File Assets Backup (Volume)
# echo "--- Backing up file assets (volume: $UPLOADS_VOLUME)..."
# # Check if the volume actually exists
# if docker volume inspect "$UPLOADS_VOLUME" > /dev/null 2>&1; then
#     # Use a temporary container to tar the volume contents
#     docker run --rm \
#       -v "${UPLOADS_VOLUME}:/assets_data:ro" \
#       -v "${FULL_BACKUP_SUBDIR}:/backup" \
#       alpine \
#       tar czf /backup/assets.tar.gz -C /assets_data . # Archive contents of /assets_data
#
#     if [ $? -ne 0 ]; then
#         echo "Error: Failed to back up assets volume '$UPLOADS_VOLUME'."
#         BACKUP_FAILED=true
#     else
#         echo "Assets volume backup successful."
#     fi
# else
#     echo "Warning: Docker volume '$UPLOADS_VOLUME' not found. Skipping assets backup."
#     # If the volume doesn't exist, it might not be an error depending on setup (e.g., using cloud storage)
#     # Consider changing this to an info message if assets might legitimately not be in a local volume.
# fi
# 4. Uploads Backup (Directory)
echo "--- Backing up uploads directory ($UPLOADS_DIR)..."
if [ -d "$UPLOADS_DIR" ]; then
    # Use tar to archive the extensions directory
    # -C changes directory before archiving to avoid leading paths in the archive
    tar czf "$FULL_BACKUP_SUBDIR/uploads.tar.gz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to back up extensions directory '$UPLOADS_DIR'."
        BACKUP_FAILED=true
    else
        echo "Uploads directory backup successful."
    fi
else
    echo "Info: Uploads directory '$UPLOADS_DIR' not found. Skipping uploads backup"
fi

# 5. Extensions Backup (Directory)
echo "--- Backing up extensions directory ($EXTENSIONS_DIR)..."
if [ -d "$EXTENSIONS_DIR" ]; then
    # Use tar to archive the extensions directory
    # -C changes directory before archiving to avoid leading paths in the archive
    tar czf "$FULL_BACKUP_SUBDIR/extensions.tar.gz" -C "$(dirname "$EXTENSIONS_DIR")" "$(basename "$EXTENSIONS_DIR")"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to back up extensions directory '$EXTENSIONS_DIR'."
        BACKUP_FAILED=true
    else
        echo "Extensions directory backup successful."
    fi
else
    echo "Info: Extensions directory '$EXTENSIONS_DIR' not found. Skipping extensions backup (this might be normal if no custom extensions are used)."
fi

# --- Completion Summary ---
echo "---"
if [ "$BACKUP_FAILED" = true ]; then
    echo "Directus full backup process completed with ERRORS."
    echo "Please review the output above."
    exit 1
else
    echo "Directus full backup process completed successfully."
    echo "Backup stored in: $FULL_BACKUP_SUBDIR"
    exit 0
fi
