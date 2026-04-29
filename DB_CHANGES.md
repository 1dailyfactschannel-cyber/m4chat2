# Накопленные изменения базы данных

> Этот файл содержит ВСЕ изменения схемы БД, которые необходимо применить в production.
> Локальная БД недоступна (проблемы с аутентификацией PostgreSQL), поэтому миграции накапливаются здесь.

## Применённые миграции (Drizzle)

### 0002_lean_rocket_racer.sql — Добавлено поле entities в messages
```sql
ALTER TABLE "messages" ADD COLUMN "entities" jsonb;
```

## ✅ ЭТАП 1: Core UX — ПОЛНОСТЬЮ ГОТОВО

### ✅ 1.1 Форматирование текста
**Таблица:** `messages`
```sql
ALTER TABLE "messages" ADD COLUMN "entities" jsonb;
```

### ✅ 1.2 Закреплённые чаты
**Таблица:** `chat_members`
```sql
ALTER TABLE "chat_members" ADD COLUMN "pinned_at" timestamp with time zone;
CREATE INDEX "chat_members_pinned_at_idx" ON "chat_members" ("pinned_at");
```

### ✅ 1.3 Архив чатов
**Таблица:** `chat_members`
```sql
ALTER TABLE "chat_members" ADD COLUMN "archived_at" timestamp with time zone;
CREATE INDEX "chat_members_archived_at_idx" ON "chat_members" ("archived_at");
```

### ✅ 1.4 Сохранённые сообщения
**Таблица:** `chats`
```sql
ALTER TABLE "chats" ADD COLUMN "is_self_chat" boolean DEFAULT false;
CREATE INDEX "chats_is_self_chat_idx" ON "chats" ("is_self_chat");
```

### ✅ 1.5 Загрузка аватаров
**Изменений не требуется** — используются существующие поля.

### ✅ 1.6 Экран настроек
**Изменений не требуется** — чисто frontend компонент.

---

## ✅ ЭТАП 2: Messaging Enhancements — ПОЛНОСТЬЮ ГОТОВО

### ✅ 2.1 @упоминания
**Изменений не требуется** — хранятся в JSONB `entities`.

### ✅ 2.2 Тихие сообщения
**Таблица:** `messages`
```sql
ALTER TABLE "messages" ADD COLUMN "is_silent" boolean DEFAULT false;
```

### ✅ 2.3 Автоудаление сообщений
**Таблица:** `chats`
```sql
ALTER TABLE "chats" ADD COLUMN "auto_delete_timer" integer;
```

### ✅ 2.4 Спойлеры
**Изменений не требуется** — уже реализовано в рамках форматирования.

---

## ✅ ЭТАП 3: Security (E2E) — ГОТОВО

### ✅ 3.1-3.2 Секретные чаты (Signal Protocol)
**Таблица:** `chats`, `messages`
```sql
ALTER TABLE "chats" ADD COLUMN "is_secret" boolean DEFAULT false;
ALTER TABLE "messages" ADD COLUMN "encrypted_payload" text;
```

---

## ✅ ЭТАП 4: Calls & Media — ГОТОВО
**Изменений не требуется** — чисто frontend.

---

## ✅ ЭТАП 5: Polish — ГОТОВО

### ✅ 5.1 Push-уведомления
**Изменений не требуется** — чисто frontend + Electron.

### ✅ 5.2 Опросы (Polls)
**Таблицы:** `polls`, `poll_votes`
```sql
CREATE TABLE "polls" (
  "id" serial PRIMARY KEY,
  "message_id" integer NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "question" text NOT NULL,
  "options" jsonb,
  "is_anonymous" boolean DEFAULT true,
  "allows_multiple" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX "polls_message_id_idx" ON "polls" ("message_id");

CREATE TABLE "poll_votes" (
  "id" serial PRIMARY KEY,
  "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "option_index" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX "poll_votes_poll_user_idx" ON "poll_votes" ("poll_id", "user_id");
```

### ✅ 5.3 Кастомные папки
**Изменений не требуется** — таблицы `chat_folders` и `folder_chats` уже существуют.

### ✅ 5.4 Предпросмотр ссылок
**Изменений не требуется** — чисто frontend + API endpoint.

---

## Как применить в production

1. Запустить локально/на сервере с доступной БД:
```bash
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
```

2. Или применить SQL напрямую через psql:
```bash
psql $DATABASE_URL -f db_changes.sql
```

3. После применения — удалить выполненные пункты из этого файла.

---

**Последнее обновление:** Текущая дата
**Статус:** Этап 1 ✅ | Этап 2 ✅ | Этап 3 ✅ | Этап 4 ✅ | Этап 5 ✅
