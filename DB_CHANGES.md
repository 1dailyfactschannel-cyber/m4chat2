# Накопленные изменения базы данных

> Этот файл содержит ВСЕ изменения схемы БД, которые необходимо применить в production.
> Локальная БД недоступна (проблемы с аутентификацией PostgreSQL), поэтому миграции накапливаются здесь.

## Применённые миграции (Drizzle)

### 0002_lean_rocket_racer.sql — Добавлено поле entities в messages
```sql
ALTER TABLE "messages" ADD COLUMN "entities" jsonb;
```

## ✅ ЭТАП 1: Core UX — ПОЛНОСТЬЮ ГОТОВО

### ✅ 1. Закреплённые чаты (Pinned Chats) — Этап 1.2
**Таблица:** `chat_members`
```sql
ALTER TABLE "chat_members" ADD COLUMN "pinned_at" timestamp with time zone;
CREATE INDEX "chat_members_pinned_at_idx" ON "chat_members" ("pinned_at");
```

### ✅ 2. Архив чатов (Chat Archive) — Этап 1.3
**Таблица:** `chat_members`
```sql
ALTER TABLE "chat_members" ADD COLUMN "archived_at" timestamp with time zone;
CREATE INDEX "chat_members_archived_at_idx" ON "chat_members" ("archived_at");
```

### ✅ 3. Сохранённые сообщения (Saved Messages) — Этап 1.4
**Таблица:** `chats`
```sql
ALTER TABLE "chats" ADD COLUMN "is_self_chat" boolean DEFAULT false;
CREATE INDEX "chats_is_self_chat_idx" ON "chats" ("is_self_chat");
```

### ✅ 4. Загрузка аватаров (Avatars) — Этап 1.5
**Изменений не требуется** — используются существующие поля `avatar_url` (users) и `photo` (chats).

### ✅ 5. Экран настроек (Settings Screen) — Этап 1.6
**Изменений не требуется** — чисто frontend компонент DesktopSettings.

---

## ЭТАП 2: Messaging Enhancements — В РАБОТЕ

### 6. @упоминания — Этап 2.1
**Таблица:** `messages` (уже есть `entities`)
**Изменений не требуется** — mentions хранятся в JSONB `entities`.
**Дополнительно (опционально, для нотификаций):**
```sql
CREATE TABLE "message_mentions" (
  "id" serial PRIMARY KEY,
  "message_id" integer NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "mentioned_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX "message_mentions_user_id_idx" ON "message_mentions" ("user_id");
```

### 7. Тихие сообщения — Этап 2.2
**Таблица:** `messages`
```sql
ALTER TABLE "messages" ADD COLUMN "is_silent" boolean DEFAULT false;
```

### 8. Автоудаление сообщений — Этап 2.3
**Таблица:** `chats`
```sql
ALTER TABLE "chats" ADD COLUMN "auto_delete_timer" integer; -- секунды: 86400 (24ч), 604800 (7д), 2592000 (30д)
```

### 9. Спойлеры — Этап 2.4
**Изменений не требуется** — уже реализовано в рамках форматирования (entities).

---

## ЭТАП 3: Security (E2E)

### 10. Секретные чаты (Secret Chats) — Этап 3.2
**Таблица:** `chats`, `messages`
```sql
ALTER TABLE "chats" ADD COLUMN "is_secret" boolean DEFAULT false;
ALTER TABLE "messages" ADD COLUMN "encrypted_payload" text;
ALTER TABLE "messages" ADD COLUMN "self_destruct_timer" integer;
```

---

## ЭТАП 5: Polish

### 11. Настройки уведомлений per chat
**Таблица:** `chat_members`
```sql
ALTER TABLE "chat_members" ADD COLUMN "mute_until" timestamp with time zone;
ALTER TABLE "chat_members" ADD COLUMN "notification_settings" jsonb DEFAULT '{}';
```

---

## Как применить в production

1. Запустить локально/на сервере с доступной БД:
```bash
pnpm --filter @workspace/db run migrate
```

2. Или применить SQL напрямую через psql:
```bash
psql $DATABASE_URL -f db_changes.sql
```

3. После применения — удалить выполненные пункты из этого файла.

---

**Последнее обновление:** Текущая дата
**Статус:** Этап 1 ✅ ГОТОВО | Этап 2 🔄 В РАБОТЕ
