import { createServer } from "http";
import fs from "fs";
import path from "path";
import app from "./app";
import { createWebSocketServer } from "./websocket/server";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function applyMigrations() {
  try {
    // __dirname in bundle = /app/artifacts/api-server/dist
    // migrations.sql is at /app/database/migrations.sql
    const sqlPath = path.join(__dirname, "../../../database/migrations.sql");

    if (!fs.existsSync(sqlPath)) {
      logger.info("migrations.sql not found, skipping schema updates");
      return;
    }

    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let applied = 0;
    let skipped = 0;

    for (const stmt of statements) {
      try {
        await pool.query(stmt + ";");
        applied++;
      } catch (err: any) {
        const code = err.code;
        if (code === "42701" || code === "42P07" || code === "42710") {
          skipped++;
        } else {
          logger.error({ err: err.message, stmt: stmt.slice(0, 80) }, "Migration statement failed");
        }
      }
    }

    logger.info({ applied, skipped }, "Schema updates completed");
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to apply schema updates");
  }
}

async function startServer() {
  await applyMigrations();

  const httpServer = createServer(app);
  const io = createWebSocketServer(httpServer);

  // Attach io to app for use in routes
  app.set("io", io);

  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

startServer().catch((err) => {
  logger.error(err);
  process.exit(1);
});
