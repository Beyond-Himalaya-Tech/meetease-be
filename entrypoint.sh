#!/bin/sh
set -e

# ----------------------------
# Wait until PostgreSQL is ready
# ----------------------------
wait_for_postgres() {
    echo "Waiting for PostgreSQL at $POSTGRES_HOST:$DB_PORT..."

    until PGPASSWORD="$POSTGRES_PASSWORD" psql \
        "host=$POSTGRES_HOST port=$DB_PORT dbname=$POSTGRES_DB user=$POSTGRES_USER sslmode=require" \
        -c '\q' >/dev/null 2>&1
    do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 2
    done

    echo "PostgreSQL is up"
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
    run_migrations
    run_generate
    start_nest
}

main
