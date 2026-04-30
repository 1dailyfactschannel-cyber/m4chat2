#!/bin/sh
set -e

echo "[entrypoint] Waiting for database..."
sleep 5

echo "[entrypoint] Applying schema updates..."
node ./scripts/apply-migrations.mjs || {
  echo "[entrypoint] WARNING: Schema updates failed, continuing anyway..."
}

echo "[entrypoint] Starting API server..."
exec pnpm --filter @workspace/api-server run start
