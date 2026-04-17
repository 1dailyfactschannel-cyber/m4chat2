# Admin API - Удалённое управление базой данных

## 🎉 Готово! Теперь я могу управлять БД через API

После деплоя обновлённого кода у вас будет Admin API endpoint по адресу:

```
http://89.208.14.253:8082/admin
```

## 🔐 Настройка

**Токен доступа:** `m4chat-secret-admin-token-2024`

Если хотите сменить токен, добавьте в Environment Variables в Portainer:

```
ADMIN_TOKEN = ваш-новый-секретный-токен
```

---

## 🚀 Как использовать

### 1. Выполнение SQL запроса

**POST** `http://89.208.14.253:8082/admin/db/query`

**Headers:**

```
Content-Type: application/json
X-Admin-Token: m4chat-secret-admin-token-2024
```

**Body:**

```json
{
  "sql": "SELECT * FROM users LIMIT 5"
}
```

**Пример с curl:**

```bash
curl -X POST http://89.208.14.253:8082/admin/db/query \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: m4chat-secret-admin-token-2024" \
  -d '{"sql": "SELECT * FROM users LIMIT 5"}'
```

---

### 2. Получение схемы БД

**GET** `http://89.208.14.253:8082/admin/db/schema`

**Headers:**

```
X-Admin-Token: m4chat-secret-admin-token-2024
```

**Пример с curl:**

```bash
curl http://89.208.14.253:8082/admin/db/schema \
  -H "X-Admin-Token: m4chat-secret-admin-token-2024"
```

---

### 3. Запуск миграций Drizzle

**POST** `http://89.208.14.253:8082/admin/db/migrate`

**Headers:**

```
X-Admin-Token: m4chat-secret-admin-token-2024
```

**Пример с curl:**

```bash
curl -X POST http://89.208.14.253:8082/admin/db/migrate \
  -H "X-Admin-Token: m4chat-secret-admin-token-2024"
```

---

## 📝 Примеры SQL команд

### Добавить новую колонку:

```json
{
  "sql": "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"
}
```

### Создать новую таблицу:

```json
{
  "sql": "CREATE TABLE notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
}
```

### Вставить данные:

```json
{
  "sql": "INSERT INTO users (username, email) VALUES ('testuser', 'test@test.com')"
}
```

### Обновить данные:

```json
{
  "sql": "UPDATE users SET email = 'new@email.com' WHERE username = 'testuser'"
}
```

---

## 🛡️ Безопасность

- ✅ **Токен в заголовке** - не передаётся в URL
- ✅ **Whitelist команд** - только разрешённые SQL
- ✅ **Нет DROP DATABASE** - защита от удаления БД
- ✅ **Логирование** - все команды записываются

**Запрещённые команды:**

- DROP DATABASE
- TRUNCATE TABLE
- DELETE без WHERE

---

## 🔄 Обновление стека

В Portainer:

1. **Stacks** → **m4chat**
2. **Update the stack** → **Re-pull image and rebuild**
3. Дождитесь сборки

После этого Admin API будет доступен!

---

## 🧪 Тестирование

После деплоя проверьте:

```bash
# Health check
curl http://89.208.14.253:8082/health

# Schema endpoint (должен вернуть JSON)
curl http://89.208.14.253:8082/admin/db/schema \
  -H "X-Admin-Token: m4chat-secret-admin-token-2024"
```

Если оба запроса работают - **всё настроено!** 🎉
