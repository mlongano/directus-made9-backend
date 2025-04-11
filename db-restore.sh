#!/bin/bash

# --- Configuration ---
# Adjust these variables to match the TARGET environment where you are restoring
# AND the configuration used by the backup script/Directus compose setup.

# Docker Compose file path for the target environment
COMPOSE_FILE="compose-postgres.yml"
# Docker Compose PostgreSQL service name
DB_SERVICE="postgres"
# Docker Compose Directus service name (needed to stop/start for volume restore)
DIRECTUS_SERVICE="directus" # <<<--- IMPORTANT: Set your Directus service name
# Target location for the restored .env file
ENV_FILE=".env"
# Target Docker volume name for Directus uploads/assets
UPLOADS_VOLUME="uploads" # <<<--- IMPORTANT: Set your TARGET volume name
# Target directory for Directus extensions
EXTENSIONS_DIR="extensions"       # <<<--- IMPORTANT: Set your TARGET extensions path

# --- Script Argument Handling ---

# Get backup directory path from the first argument
if [ -z "$1" ]; then
    echo "Usage: $0 <path_to_backup_subdirectory>"
    echo "Example: $0 backups/20250411_173000"
    exit 1
fi
BACKUP_SUBDIR="$1"

# Check if backup directory exists
if [ ! -d "$BACKUP_SUBDIR" ]; then
    echo "Error: Backup directory '$BACKUP_SUBDIR' not found."
    exit 1
fi

echo "Attempting to restore Directus from backup: $BACKUP_SUBDIR"
echo "Target environment defined by compose file: $COMPOSE_FILE"

# --- Confirmation ---

echo
echo "!!!!!!!!!!!!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "This script is potentially DESTRUCTIVE and will attempt to:"
echo " 1. OVERWRITE the existing '$ENV_FILE' file."
echo " 2. STOP and START Docker service: '$DIRECTUS_SERVICE'."
echo " 3. COMPLETELY WIPE and restore the database specified in the restored .env."
echo " 4. COMPLETELY WIPE and restore the Docker volume: '$UPLOADS_VOLUME'."
echo " 5. COMPLETELY WIPE and restore the directory: '$EXTENSIONS_DIR'."
echo "------------------------------------------------------------"
echo "Ensure the target Docker environment is running:"
echo " -> docker compose -f \"$COMPOSE_FILE\" up -d"
echo "Ensure you have selected the correct backup directory."
echo "Backup any current data you might need BEFORE proceeding."
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo
read -p "ARE YOU ABSOLUTELY SURE YOU WANT TO PROCEED WITH THE RESTORE? (Type 'yes' to continue): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled by user."
    exit 0
fi
echo "Proceeding with restore..."
echo

# --- Restore Process ---

RESTORE_FAILED=false

# 1. Restore Configuration (.env)
echo "--- [1/5] Restoring configuration file..."
BACKUP_ENV_FILE="$BACKUP_SUBDIR/config.env.backup"
if [ -f "$BACKUP_ENV_FILE" ]; then
    cp "$BACKUP_ENV_FILE" "$ENV_FILE"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to copy '$BACKUP_ENV_FILE' to '$ENV_FILE'."
        exit 1 # Exit early, critical for DB credentials
    fi
    echo "Configuration file '<span class="math-inline">ENV\_FILE' restored\."
\# Attempt to load DB credentials from the newly restored \.env file
\# Using source is cleaner but can have side effects; using grep/cut is safer here\.
DB\_PASSWORD\=</span>(grep '^DB_PASSWORD=' "<span class="math-inline">ENV\_FILE" \| head \-n 1 \| cut \-d '\=' \-f2\-\)
DB\_USER\=</span>(grep '^DB_USER=' "<span class="math-inline">ENV\_FILE" \| head \-n 1 \| cut \-d '\=' \-f2\-\)
DB\_NAME\=</span>(grep '^DB_DATABASE=' "$ENV_FILE" | head -n 1 | cut -d '=' -f2-) # Directus usually uses DB_DATABASE

    # Validate that critical variables were found
    if [ -z "$DB_PASSWORD" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
        echo "Error: Could not read required DB variables (DB_PASSWORD, DB_USER, DB_DATABASE) from restored '$ENV_FILE'."
        exit 1
    fi
    echo "Database credentials loaded from restored .env (User: $DB_USER, DB: $DB_NAME)."
else
    echo "Error: Backup config file '$BACKUP_ENV_FILE' not found. Cannot proceed without configuration."
    exit 1
fi
echo

# 2. Restore Database (PostgreSQL)
echo "--- [2/5] Restoring database '$DB_NAME'..."
BACKUP_DB_FILE="$BACKUP_SUBDIR/database.sql.gz"
if [ ! -f "$BACKUP_DB_FILE" ]; then
    echo "Error: Database backup file '$BACKUP_DB_FILE' not found."
    exit 1
fi

# Prepare docker exec command with password
PGPASSWORD_OPT="-e PGPASSWORD=$DB_PASSWORD"
DB_EXEC="docker compose -f $COMPOSE_FILE exec -T $PGPASSWORD_OPT $DB_SERVICE"

# Drop and Recreate Database
echo "Dropping existing database '$DB_NAME' (if it exists)..."
$DB_EXEC dropdb -U "$DB_USER" --if-exists "$DB_NAME"
# We don't strictly check dropdb error, as --if-exists handles the 'does not exist' case.
# Other errors (connection, permission) might still occur.

echo "Creating new database '$DB_NAME'..."
$DB_EXEC createdb -U "$DB_USER" "$DB_NAME"
if [ $? -ne 0 ]; then
    echo "Error: Failed to create database '$DB_NAME'."
    exit 1
fi

# Import Data
echo "Importing data from '$BACKUP_DB_FILE'..."
gunzip < "$BACKUP_DB_FILE" | $DB_EXEC psql -U "$DB_USER" -d "<span class="math-inline">DB\_NAME"
IMPORT\_STATUS\=</span>{PIPESTATUS[1]} # Check exit status of psql
if [ $IMPORT_STATUS -ne 0 ]; then
    echo "Error: Failed to import database data into '$DB_NAME' (psql exit code $IMPORT_STATUS)."
    exit 1
fi
echo "Database restore successful."
echo

# 3. Restore File Assets (Volume)
echo "--- [3/5] Restoring file assets (volume: $UPLOADS_VOLUME)..."
BACKUP_ASSETS_FILE="$BACKUP_SUBDIR/assets.tar.gz"
if [ ! -f "$BACKUP_ASSETS_FILE" ]; then
     echo "Warning: Assets backup file '$BACKUP_ASSETS_FILE' not found. Skipping assets restore."
else
    echo "Stopping Directus service ($DIRECTUS_SERVICE) to safely restore volume..."
    docker compose -f $COMPOSE_FILE stop $DIRECTUS_SERVICE
    if [ $? -ne 0 ]; then
        echo "Error: Failed to stop service '$DIRECTUS_SERVICE'. Cannot safely restore volume."
        exit 1
    fi

    echo "Clearing existing data in volume '<span class="math-inline">UPLOADS\_VOLUME'\.\.\."
docker run \-\-rm \-v "</span>{UPLOADS_VOLUME}:/assets_data" alpine sh -c "rm -rf /assets_data/* /assets_data/.* 2>/dev/null"
    if [ $? -ne 0 ]; then
        # Don't exit, but warn. Maybe volume was empty or permissions issue.
        echo "Warning: Potentially failed to completely clear volume '$UPLOADS_VOLUME'. Proceeding with extraction."
    fi

    echo "Extracting assets from '<span class="math-inline">BACKUP\_ASSETS\_FILE' into volume\.\.\."
docker run \-\-rm \\
\-v "</span>{UPLOADS_VOLUME}:/assets_data" \
        -v "${BACKUP_SUBDIR}:/backup:ro" \
        alpine \
        tar xzf /backup/assets.tar.gz -C /assets_data
    if [ $? -ne 0 ]; then
        echo "Error: Failed to extract assets into volume '$UPLOADS_VOLUME'."
        # Attempt to restart Directus anyway? Or exit? Let's exit to be safe.
        docker compose -f $COMPOSE_FILE start $DIRECTUS_SERVICE # Attempt restart before exiting
        exit 1
    fi

    echo "Assets volume restore successful."
    # Directus service will be started after extensions restore (if any)
fi
echo

# 4. Restore Extensions (Directory)
echo "--- [4/5] Restoring extensions directory ($EXTENSIONS_DIR)..."
BACKUP_EXT_FILE="$BACKUP_SUBDIR/extensions.tar.gz"
if [ ! -f "$BACKUP_EXT_FILE" ]; then
    echo "Info: Extensions backup file '<span class="math-inline">BACKUP\_EXT\_FILE' not found\. Skipping extensions restore\."
else
\# Ensure target parent directory exists
PARENT\_EXT\_DIR\=</span>(dirname "$EXTENSIONS_DIR")
    mkdir -p "$PARENT_EXT_DIR"
    if [ $? -ne 0 ]; then
        echo "Error: Could not create parent directory '$PARENT_EXT_DIR' for extensions."
        # Attempt to restart Directus? Or exit? Let's exit.
        docker compose -f $COMPOSE_FILE start $DIRECTUS_SERVICE # Attempt restart
        exit 1
    fi

    echo "Clearing existing extensions directory '$EXTENSIONS_DIR'..."
    rm
