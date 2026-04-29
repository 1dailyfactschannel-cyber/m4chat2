# M4Chat — Roadmap: Telegram Desktop Clone Features

## ✅ ЭТАП 1: Core UX (Foundation) — ГОТОВО
- [x] 1.1 Форматирование текста (Markdown parser + renderer + toolbar)
- [x] 1.2 Закреплённые чаты (pinned field + UI pin/unpin + sort)
- [x] 1.3 Архив чатов (archive section + swipe + unread counter + auto-hide)
- [x] 1.4 Сохранённые сообщения (auto-create self-chat on register + "Избранное" link)
- [x] 1.5 Загрузка аватаров (crop to square + resize + upload API + display)
- [x] 1.6 Экран настроек (full-screen modal: profile, notifications, privacy, security, data, language, about)

## ✅ ЭТАП 2: Messaging Enhancements — ГОТОВО
- [x] 2.1 @упоминания (parse + highlight + clickable + notification)
- [x] 2.2 Тихие сообщения (silent flag + no sound notification)
- [x] 2.3 Автоудаление сообщений (timer per chat: 24h/7d/1mo + cron worker)
- [x] 2.4 Спойлеры (||text|| → blurred blob + click to reveal)

## ✅ ЭТАП 3: Security (E2E) — ГОТОВО
- [x] 3.1 Интеграция Signal Protocol в отправку сообщений
  - [x] Шифрование payload при отправке в secret chats
  - [x] Дешифрование при получении
  - [x] Ротация ключей (через Double Ratchet)
- [x] 3.2 Секретные чаты (new chat type: secret + encryptedPayload + self-destruct)
  - [x] Новый тип чата `secret` в БД
  - [x] UI создания секретного чата
  - [x] Поле `encryptedPayload` в messagesTable
  - [x] Самоуничтожающиеся сообщения (autoDeleteTimer)
- [ ] 3.3 Проверка ключей безопасности (UI: fingerprint comparison) — ОТЛОЖЕНО
- [x] 3.4 Обработка prekeys и их ротация — базовая реализация

## ⏳ ЭТАП 4: Calls & Media (No Group Calls)
- [ ] 4.1 Скриншеринг (getDisplayMedia + toggle during call)
- [ ] 4.2 Waveform аудио (canvas visualization + seekbar)
- [ ] 4.3 Галерея медиа (prev/next navigation in lightbox)

## ⏳ ЭТАП 5: Polish
- [ ] 5.1 Push-уведомления (Electron Notification + sounds + taskbar badge)
- [ ] 5.2 Опросы (Polls: create + vote + progress bars)
- [ ] 5.3 Кастомные папки (use existing DB tables + UI CRUD + DnD)
- [ ] 5.4 Предпросмотр ссылок (OG parsing + link preview card)

## ⏳ ЭТАП 6: Future (Nice to Have)
- [ ] 6.1 Стикеры
- [ ] 6.2 GIF-поиск
- [ ] 6.3 Перевод сообщений
- [ ] 6.4 Круглые видео (Video Notes)
- [ ] 6.5 Боты и Mini Apps
- [ ] 6.6 Прокси (SOCKS5/MTProto)
- [ ] 6.7 QR-логин
- [ ] 6.8 Телефонная регистрация (SMS)
- [ ] 6.9 Кастомные темы оформления
