// ==========================================
// Database Connection Test Script
// ==========================================
// Запустите внутри контейнера API:
// docker exec -it m4chat-api node /app/test-db.js
//
// Или добавьте как endpoint в приложение

const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:XYL9zWCqwjACdnm@db:5432/m4chat_pg",
});

async function testConnection() {
  try {
    console.log("🔌 Testing database connection...");

    // Проверка подключения
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");

    // Проверка версии PostgreSQL
    const versionResult = await client.query("SELECT version()");
    console.log("📦 PostgreSQL version:", versionResult.rows[0].version);

    // Проверка текущей базы данных
    const dbResult = await client.query("SELECT current_database()");
    console.log("🗄️  Current database:", dbResult.rows[0].current_database);

    // Проверка списка таблиц
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log("⚠️  No tables found. Run schema.sql to create tables.");
    } else {
      console.log("📋 Tables in database:");
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Проверка количества пользователей
    try {
      const usersResult = await client.query(
        "SELECT COUNT(*) as count FROM users",
      );
      console.log(`👥 Users in database: ${usersResult.rows[0].count}`);
    } catch (e) {
      console.log("👥 Users table not found (run schema.sql)");
    }

    client.release();
    console.log("\n✅ All checks passed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
