#!/bin/sh
set -e

# ----------------------------
# Wait until PostgreSQL is ready
# ----------------------------
wait_for_postgres() {
    echo "Waiting for PostgreSQL at $POSTGRES_HOST..."
    until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" -c '\q'; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 1
    done
    echo "PostgreSQL is up"
}

# ----------------------------
# Create database user if not exists
# ----------------------------
create_db_user() {
    echo "Ensuring database user exists..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" <<EOF
DO
\$\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_USER}'
   ) THEN
      CREATE USER ${POSTGRES_USER} WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD}';
   END IF;
END
\$\$;
EOF
}

# ----------------------------
# Create main database if not exists
# ----------------------------
create_database() {
    echo "Ensuring main database exists..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" <<EOF
DO
\$\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}'
   ) THEN
      CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
   END IF;
END
\$\$;
EOF
}

# ----------------------------
# Create schema meet_ease
# ----------------------------
create_schema() {
    echo "Creating schema 'meet_ease' if not exists..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE SCHEMA IF NOT EXISTS meet_ease AUTHORIZATION $POSTGRES_USER;"
}

# ----------------------------
# Grant schema privileges
# ----------------------------
grant_privileges() {
    echo "Ensuring schema ownership and privileges..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF
GRANT ALL PRIVILEGES ON SCHEMA meet_ease TO $POSTGRES_USER;
ALTER SCHEMA meet_ease OWNER TO $POSTGRES_USER;
EOF
}

# ----------------------------
# Run Prisma migrations
# ----------------------------
run_migrations() {
    echo "Running Prisma migrations..."
    npx prisma migrate deploy
}

# ----------------------------
# Run Prisma generate
# ----------------------------
run_generate() {
    echo "Running Prisma generate..."
    npx prisma generate
}

# ----------------------------
# Start NestJS application
# ----------------------------
start_nest() {
    echo "Starting NestJS application..."
    exec npm run start:dev
}

# ----------------------------
# Main execution
# ----------------------------
main() {
    wait_for_postgres
    create_db_user
    create_database
    create_schema
    grant_privileges
    run_migrations
    run_generate
    start_nest
}

# Call main
main