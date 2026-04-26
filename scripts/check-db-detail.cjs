const { Client } = require('D:/Project/m4chat2-replit-agent/m4chat2-replit-agent/lib/db/node_modules/pg');

const client = new Client({
  host: '89.208.14.253',
  port: 5446,
  database: 'm4chat_pg',
  user: 'postgres',
  password: 'XYL9zWCqwjACdnm',
  ssl: false,
  connectionTimeoutMillis: 10000,
});

async function check() {
  try {
    await client.connect();
    
    // Какая БД?
    const db = await client.query('SELECT current_database(), current_user, version()');
    console.log('🔌 Подключение:', JSON.stringify(db.rows[0], null, 2));
    
    // Все таблицы во всех схемах
    const allTables = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    console.log('\n📋 Все таблицы (все схемы):');
    console.log(JSON.stringify(allTables.rows, null, 2));
    
    // Все схемы
    const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
    console.log('\n📁 Схемы:', JSON.stringify(schemas.rows.map(r => r.schema_name)));

    // Drizzle таблицы (supposedly _drizzle_migrations)
    const drizzle = await client.query(`SELECT * FROM information_schema.tables WHERE table_name LIKE '%drizzle%' OR table_name LIKE '%migration%'`);
    console.log('\n🔄 Drizzle/migration таблицы:', JSON.stringify(drizzle.rows, null, 2));

  } catch (e) {
    console.error('❌', e.message);
  } finally {
    await client.end();
  }
}

check();
