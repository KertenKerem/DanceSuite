#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until bunx prisma db push --skip-generate 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

echo "Running database migrations..."
bunx prisma migrate deploy 2>/dev/null || bunx prisma db push

echo "Generating Prisma client..."
bunx prisma generate

echo "Seeding admin user..."
bun run prisma/seed-admin.js 2>/dev/null || echo "Admin user already exists or seeding skipped"

echo "Starting the application..."
exec "$@"
