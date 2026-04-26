-- ==========================================
-- Проверка структуры базы данных M4Chat
-- ==========================================
-- Выполните этот скрипт в DBeaver (SQL Editor)

-- 1. Проверка списка таблиц
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Проверка структуры каждой таблицы
-- Если таблицы существуют, ниже будут результаты

-- 3. Проверка foreign keys
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
WHERE tc.constraint_type = 'FOREIGN KEY';

-- 4. Проверка индексов
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 5. Подсчёт записей в каждой таблице
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'chats', COUNT(*) FROM chats
UNION ALL SELECT 'chat_members', COUNT(*) FROM chat_members
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'message_reads', COUNT(*) FROM message_reads
UNION ALL SELECT 'sessions', COUNT(*) FROM sessions;
