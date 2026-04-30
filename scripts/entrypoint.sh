#!/bin/sh
set -e

echo "[entrypoint] Waiting for database..."
sleep 5

echo "[entrypoint] Running migrations..."
pnpm --filter @workspace/db run migrate || {
  echo "[entrypoint] WARNING: Migrations failed, continuing anyway..."
}

echo "[entrypoint] Starting API server..."
exec pnpm --filter @workspace/api-server run start
