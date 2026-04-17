#!/bin/bash
# ==========================================
# M4Chat Database Check Script
# ==========================================
# Проверяет состояние базы данных и API
#
# Использование: bash check-db.sh

set -e

echo "🔍 Проверка состояния M4Chat"
echo "============================"

# Проверка контейнеров
echo ""
echo "📦 Контейнеры:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "m4chat|NAMES" || echo "❌ Контейнеры не найдены"

# Проверка БД
echo ""
echo "🗄️  База данных:"
if docker ps | grep -q "m4chat-db"; then
    echo "✅ Контейнер БД запущен"
    
    # Проверка подключения
    if docker exec m4chat-db psql -U postgres -d m4chat_pg -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Подключение к БД работает"
        
        # Список таблиц
        echo ""
        echo "📋 Таблицы:"
        docker exec m4chat-db psql -U postgres -d m4chat_pg -c "\dt" 2>/dev/null || echo "⚠️ Таблиц пока нет (запустите setup-db.sh)"
    else
        echo "❌ Не удалось подключиться к БД"
    fi
else
    echo "❌ Контейнер БД не запущен"
fi

# Проверка API
echo ""
echo "⚙️  API сервер:"
if docker ps | grep -q "m4chat-api"; then
    echo "✅ Контейнер API запущен"
    
    # Проверка health endpoint
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' m4chat-api 2>/dev/null)
    if [ -n "$API_IP" ]; then
        if docker exec m4chat-api wget -qO- http://localhost:8080/health > /dev/null 2>&1; then
            echo "✅ API отвечает на health check"
        else
            echo "⚠️ API запущен, но health check не проходит"
        fi
    fi
else
    echo "❌ Контейнер API не запущен"
fi

# Проверка Web
echo ""
echo "🌐 Web сервер:"
if docker ps | grep -q "m4chat-web"; then
    echo "✅ Контейнер Web запущен"
else
    echo "❌ Контейнер Web не запущен"
fi

echo ""
echo "========================"
echo "🔍 Проверка завершена!"
