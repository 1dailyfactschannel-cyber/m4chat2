# ==========================================

# GitHub Actions SSH Setup Instructions

# ==========================================

# Для автоматического деплоя миграций БД через GitHub Actions

## Шаг 1: Сгенерируйте SSH ключ на сервере

Подключитесь к серверу и выполните:

```bash
ssh-keygen -t ed25519 -a 200 -C "github-actions@m4chat" -f ~/.ssh/github_actions
# Не вводите пароль (просто нажмите Enter 2 раза)

# Добавьте публичный ключ в authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Выведите приватный ключ (скопируйте его полностью)
cat ~/.ssh/github_actions
```

**Вывод будет примерно таким:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB... (много текста)
-----END OPENSSH PRIVATE KEY-----
```

**Важно:** Скопируйте ВЕСЬ текст включая `-----BEGIN...` и `-----END...`

---

## Шаг 2: Добавьте секреты в GitHub

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**

### Secret 1: SSH ключ

- **Name:** `SERVER_SSH_KEY`
- **Value:** (весь приватный ключ из шага 1)

### Secret 2: IP сервера

- **Name:** `SERVER_IP`
- **Value:** `89.208.14.253`

---

## Шаг 3: Проверьте подключение

На сервере выполните:

```bash
# Проверьте что SSH работает
ssh -i ~/.ssh/github_actions root@89.208.14.253
# Должно подключиться без пароля

# Если не работает, проверьте права:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
```

---

## Шаг 4: Запустите workflow

Теперь при каждом изменении в `lib/db/src/schema/` GitHub Actions автоматически:

1. Подключится к серверу по SSH
2. Выполнит `drizzle-kit push` в контейнере
3. Обновит структуру БД

**Ручной запуск:**
GitHub → Actions → Deploy Database Migrations → Run workflow

---

## Как это работает

```
Вы делаете git push с изменениями схемы
           ↓
GitHub Actions запускается автоматически
           ↓
Подключается к 89.208.14.253 по SSH
           ↓
Выполняет drizzle-kit push в контейнере m4chat-api
           ↓
База данных обновлена! ✅
```

---

## ⚠️ Безопасность

- Никогда не коммитьте приватный ключ в репозиторий!
- Используйте только GitHub Secrets
- Ограничьте права ключа: он может только подключаться и выполнять docker команды
- Можно создать отдельного пользователя (не root) для GitHub Actions
