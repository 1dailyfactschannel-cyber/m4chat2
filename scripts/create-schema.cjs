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

async function createSchema() {
  try {
    await client.connect();
    console.log('✅ Подключение к БД\n');

    // 1. users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица users создана');

    // 2. chats
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        type VARCHAR(50) DEFAULT 'private',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица chats создана');

    // 3. chat_members
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_members (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, user_id)
      )
    `);
    console.log('✅ Таблица chat_members создана');

    // 4. messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT,
        message_type VARCHAR(50) DEFAULT 'text',
        media_url VARCHAR(500),
        reply_to INTEGER REFERENCES messages(id) ON DELETE SET NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица messages создана');

    // 5. message_reads
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_id)
      )
    `);
    console.log('✅ Таблица message_reads создана');

    // 6. sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица sessions создана');

    // Индексы
    await client.query('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    console.log('✅ Индексы созданы');

    // Проверка
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('\n📋 Итоговые таблицы:');
    tables.rows.forEach(r => console.log('   ✅ ' + r.tablename));

    console.log('\n🎉 Все таблицы успешно созданы!');
  } catch (e) {
    console.error('❌ Ошибка:', e.message);
  } finally {
    await client.end();
  }
}

createSchema();
