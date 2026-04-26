const { Client } = require('pg');

const client = new Client({
  host: '89.208.14.253',
  port: 5446,
  database: 'm4chat_pg',
  user: 'postgres',
  password: 'XYL9zWCqwjACdnm',
  ssl: false,
  connectionTimeoutMillis: 10000,
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Подключение к БД успешно!\n');

    // 1. Список таблиц
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Таблицы в базе данных:');
    if (tablesRes.rows.length === 0) {
      console.log('   ❌ Таблиц не найдено!');
    } else {
      tablesRes.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    console.log();

    // 2. Структура каждой таблицы
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const columnsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`📊 Структура таблицы "${tableName}":`);
      columnsRes.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
      console.log();
    }

    // 3. Foreign Keys
    const fkRes = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);
    
    console.log('🔗 Foreign Keys:');
    if (fkRes.rows.length === 0) {
      console.log('   ❌ Foreign keys не найдены');
    } else {
      fkRes.rows.forEach(fk => {
        console.log(`   ✅ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    console.log();

    // 4. Количество записей
    console.log('📈 Количество записей:');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ${row.table_name}: ${countRes.rows[0].count}`);
    }

    console.log('\n✅ Проверка завершена!');

  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDatabase();
