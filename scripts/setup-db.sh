#!/bin/bash
# ==========================================
# M4Chat Database Setup Script
# ==========================================
# Этот скрипт настраивает базу данных M4Chat
# 
# Использование:
# 1. Скопируй на сервер: scp setup-db.sh user@server:/tmp/
# 2. Подключись по SSH: ssh user@server
# 3. Запусти: bash /tmp/setup-db.sh

set -e  # Остановить при ошибке

echo "🚀 M4Chat Database Setup"
echo "========================"

# Проверка, запущен ли контейнер БД
if ! docker ps | grep -q "m4chat-db"; then
    echo "❌ Контейнер m4chat-db не найден!"
    echo "Сначала создайте стек в Portainer."
    exit 1
fi

echo "✅ Контейнер БД найден"

# Скачивание schema.sql
echo "📥 Скачивание schema.sql..."
curl -sL "https://raw.githubusercontent.com/1dailyfactschannel-cyber/m4chat2/main/database/schema.sql" -o /tmp/schema.sql

if [ ! -f /tmp/schema.sql ]; then
    echo "❌ Не удалось скачать schema.sql"
    exit 1
fi

echo "✅ Schema.sql скачан"

# Выполнение SQL скрипта
echo "🗄️  Создание таблиц в базе данных..."
docker exec -i m4chat-db psql -U postgres -d m4chat_pg < /tmp/schema.sql

echo ""
echo "✅ База данных успешно настроена!"
echo ""

# Проверка созданных таблиц
echo "📋 Список созданных таблиц:"
docker exec m4chat-db psql -U postgres -d m4chat_pg -c "\dt"

echo ""
echo "🎉 Готово! Теперь можно использовать API."
echo ""
echo "Проверьте доступ:"
echo "  - Web: http://$(hostname -I | awk '{print $1}'):8082"
echo "  - API Health: http://$(hostname -I | awk '{print $1}'):8082/api/health"
