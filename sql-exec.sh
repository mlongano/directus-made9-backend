#!/bin/bash

# Default compose file path
COMPOSE_FILE="compose-postgres.yml"
# Default PostgreSQL service name
DB_SERVICE="postgres"
# Default PostgreSQL user
DB_USER="directus"
# Default PostgreSQL database name (psql might require it depending on context)
# If your directus user connects to a specific DB by default, you might not need -d
# DB_NAME="directus" 

# Check if a SQL file path is provided as the first argument
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_sql_file>"
  exit 1
fi

SQL_FILE="$1"

# Check if the provided SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: SQL file not found at '$SQL_FILE'"
  exit 1
fi

# Check if the compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Docker Compose file not found at '$COMPOSE_FILE'"
  exit 1
fi

echo "Executing SQL from '$SQL_FILE' on service '$DB_SERVICE' as user '$DB_USER'..."

cat "$SQL_FILE"
# Read the SQL file and pipe its content to psql running inside the container
cat "$SQL_FILE" | docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" psql -U "$DB_USER" # Add -d "$DB_NAME" if needed

# Check the exit status of the docker compose command
if [ $? -eq 0 ]; then
  echo "SQL execution completed successfully."
else
  echo "Error during SQL execution. Please check the output above."
  exit 1
fi

exit 0
