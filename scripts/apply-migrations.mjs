import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const sqlPath = path.join(__dirname, "../database/migrations.sql");
  if (!fs.existsSync(sqlPath)) {
    console.log("[apply-migrations] migrations.sql not found, skipping.");
    await client.end();
    return;
  }

  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Split by semicolons but keep statements intact
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let applied = 0;
  let skipped = 0;

  for (const stmt of statements) {
    try {
      await client.query(stmt + ";");
      applied++;
    } catch (err) {
      const code = err && err.code;
      // 42701 = column already exists
      // 42P07 = relation already exists
      // 42710 = index already exists
      if (code === "42701" || code === "42P07" || code === "42710") {
        skipped++;
      } else {
        console.error("[apply-migrations] Error:", err.message, "| Statement:", stmt.slice(0, 80));
      }
    }
  }

  await client.end();
  console.log(`[apply-migrations] Applied: ${applied}, skipped: ${skipped}`);
}

applyMigrations().catch((err) => {
  console.error("[apply-migrations] Failed:", err.message);
  process.exit(1);
});
