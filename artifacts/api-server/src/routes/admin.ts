import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// Секретный токен из переменных окружения
const ADMIN_TOKEN =
  process.env.ADMIN_TOKEN || "your-secure-admin-token-change-this";

// Разрешённые типы SQL команд (whitelist)
const ALLOWED_COMMANDS = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "CREATE TABLE",
  "ALTER TABLE",
  "CREATE INDEX",
  "DROP TABLE", // Осторожно с этим!
  "DELETE", // Только с WHERE
];

// Запрещённые паттерны
const FORBIDDEN_PATTERNS = [
  /DROP\s+DATABASE/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*;?\s*$/i, // DELETE без WHERE
];

/**
 * Middleware для проверки токена
 */
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers["x-admin-token"] || req.query.token;

  if (!token) {
    res.status(401).json({ error: "Token required" });
    return;
  }

  if (token !== ADMIN_TOKEN) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }

  next();
};

/**
 * Проверка безопасности SQL
 */
const validateSQL = (sql: string): { valid: boolean; error?: string } => {
  // Проверка на запрещённые паттерны
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sql)) {
      return {
        valid: false,
        error: `Forbidden SQL pattern detected: ${pattern}`,
      };
    }
  }

  // Проверка что команда разрешена
  const upperSQL = sql.trim().toUpperCase();
  const isAllowed = ALLOWED_COMMANDS.some((cmd) => upperSQL.startsWith(cmd));

  if (!isAllowed) {
    return { valid: false, error: "SQL command not in whitelist" };
  }

  return { valid: true };
};

/**
 * POST /admin/db/query - Выполнение SQL запроса
 */
router.post("/query", authMiddleware, async (req, res) => {
  const { sql: query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "SQL query required" });
  }

  // Проверка безопасности
  const validation = validateSQL(query);
  if (!validation.valid) {
    return res.status(403).json({ error: validation.error });
  }

  try {
    const startTime = Date.now();

    // Выполнение запроса
    const result = await db.execute(sql.raw(query));

    const duration = Date.now() - startTime;

    // Логирование
    console.log(
      `[Admin API] Query executed in ${duration}ms: ${query.substring(0, 100)}...`,
    );

    res.json({
      success: true,
      duration: `${duration}ms`,
      rows: result.rows || [],
      rowCount: result.rowCount,
      command: result.command,
    });
  } catch (error: any) {
    console.error("[Admin API] Query error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /admin/db/schema - Получение схемы БД
 */
router.get("/schema", authMiddleware, async (req, res) => {
  try {
    const tables = await db.execute(sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    res.json({
      success: true,
      tables: tables.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /admin/db/migrate - Выполнение миграции Drizzle
 */
router.post("/migrate", authMiddleware, async (req, res) => {
  try {
    // Выполняем drizzle-kit push через exec
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    const { stdout, stderr } = await execPromise(
      "cd /app && pnpm --filter @workspace/db run push-force",
      { timeout: 60000 },
    );

    res.json({
      success: true,
      output: stdout,
      errors: stderr,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

export default router;
