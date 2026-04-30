#!/bin/sh
set -e

echo "[entrypoint] Waiting for database..."
sleep 5

echo "[entrypoint] Running migrations..."
node ./lib/db/src/migrate.mjs || {
  echo "[entrypoint] WARNING: Migrations failed, continuing anyway..."
}

echo "[entrypoint] Starting API server..."
exec pnpm --filter @workspace/api-server run start
