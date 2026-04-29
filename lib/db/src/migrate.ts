import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Running migrations...");

  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../migrations"),
  });

  console.log("Migrations completed.");

  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
