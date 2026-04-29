# M4Chat — Roadmap to Telegram Desktop Clone

> **Strategy:** Own backend + own protocol (not MTProto). Visually and functionally closest to Telegram Desktop. Electron-first. Production-ready from day one.

---

## Stack

| Component | Choice |
|-----------|--------|
| **Monorepo** | pnpm workspaces |
| **Backend** | Express 5, PostgreSQL 15, Drizzle ORM, Socket.io |
| **Frontend** | React 19, Vite 7, Tailwind 4, Framer Motion, Radix/shadcn |
| **State** | TanStack Query (server), Zustand (client) |
| **API Client** | Orval-generated hooks + Zod |
| **Desktop** | Electron (tray, notifications, auto-updater, hotkeys) |
| **Auth** | JWT Bearer + Refresh tokens + bcrypt/argon2 + TOTP |
| **File Storage** | **RustFS** (S3-compatible, self-hosted, Docker) |
| **Media SDK** | `@aws-sdk/client-s3` |
| **Search** | PostgreSQL `tsvector` |
| **E2E Encryption** | Signal Protocol (Phase 6) |
| **Animations** | Framer Motion + CSS Tailwind |

---

## Phase 0. Foundation & Infrastructure (Week 1) ✅

| # | Task | Status |
|---|------|--------|
| 0.1 | **Extend DB schema** | ✅ |
| 0.2 | **Drizzle migrations** | ✅ |
| 0.3 | **WebSocket server** | ✅ |
| 0.4 | **Full OpenAPI spec** | ✅ |
| 0.5 | **Orval codegen** | ✅ |
| 0.6 | **Security base** | ✅ |
| 0.7 | **RustFS + file upload** | ✅ |
| 0.8 | **Docker production** | ✅ |

### 0.7 RustFS Architecture
```
Client (Electron)
    ↓ POST /api/files (multipart)
Backend (Express + multer)
    ↓ S3 SDK (@aws-sdk/client-s3)
RustFS (Docker, port 9000)
    ↓ volume
Disk (/data)
```
- Presigned URLs for direct download to avoid backend bottleneck.

---

## Phase 1. Backend Core — Real-time Messaging (Week 2) ✅

| # | Task | Status |
|---|------|--------|
| 1.1 | Auth v2 (refresh tokens, logout all, `/auth/devices`) | ✅ |
| 1.2 | 2FA TOTP (`/auth/2fa/setup`, `/auth/2fa/verify`) | ✅ |
| 1.3 | Chats API (CRUD, members, invite links) | ✅ |
| 1.4 | Messages API (send, edit, soft delete, forward, pin, reactions) | ✅ |
| 1.5 | Read receipts (`sent → delivered → read`) | ✅ |
| 1.6 | WebSocket events (`message:new`, `message:edited`, `typing`, `read`, `user:online`) | ✅ |
| 1.7 | Search (PostgreSQL `tsvector` for messages + users) | ✅ |
| 1.8 | Polls API | ⏸️ Deferred |

---

## Phase 2. Frontend Core — API Integration (Week 3) ✅

| # | Task | Status |
|---|------|--------|
| 2.1 | State: TanStack Query + Zustand + Socket.io-client | ✅ |
| 2.2 | Auth flow — real API, LoginScreen integration | ✅ |
| 2.3 | Chat List — real data, folders, archive, search | ✅ |
| 2.4 | Message List — API + cursor pagination + `@tanstack/react-virtual` | ✅ |
| 2.5 | Message Input — text, reply, emoji, drag-drop files, voice recording | ✅ |
| 2.6 | Read receipts — checkmarks UI | ✅ |
| 2.7 | Typing indicator | ✅ |
| 2.8 | User profile + avatars (RustFS URLs) | ✅ |

---

## Phase 2.5. UI/UX Animations (Weeks 3–4, parallel with Phase 2) ✅

| # | Animation | Technique | Status |
|---|-----------|-----------|--------|
| 2.5.1 | Message send (slide + scale + fade) | Framer Motion `AnimatePresence` | ✅ |
| 2.5.2 | Double-tap heart (fly out + fade) | Framer Motion `animate` | ✅ |
| 2.5.3 | Scroll to message | `scrollIntoView({ behavior: 'smooth' })` | ✅ |
| 2.5.4 | Typing dots (stagger bounce) | CSS keyframes + stagger | ✅ |
| 2.5.5 | Chat list filter transitions | `AnimatePresence` + `layout` | ✅ |
| 2.5.6 | Burger drawer (slide + backdrop fade) | Framer Motion | ✅ |
| 2.5.7 | Context menu (scale from origin) | Framer Motion | ✅ |
| 2.5.8 | Lightbox/Modals (scale + backdrop blur) | Framer Motion | ✅ |
| 2.5.9 | Call overlay (ripple pulse) | CSS infinite animation | ✅ |
| 2.5.10 | Reactions popup (slideUp + stagger) | Framer Motion | ✅ |
| 2.5.11 | Skeleton loaders (shimmer) | Tailwind `animate-shimmer` | ✅ |
| 2.5.12 | Media lightbox (shared layoutId) | Framer Motion `layoutId` | ✅ |
| 2.5.13 | Send button morph (mic → send) | Framer Motion `layout` | ✅ |
| 2.5.14 | Checkmarks crossfade | Framer Motion `AnimatePresence` | ✅ |
| 2.5.15 | Drag & drop (border dash + bounce) | CSS transitions | ✅ |
| 2.5.16 | Voice recording (scale + waveform) | Framer Motion + `requestAnimationFrame` | ✅ |
| 2.5.17 | Load more spinner | Spinner rotate | ✅ |
| 2.5.18 | Background crossfade | CSS `transition: background 300ms` | ✅ |
| 2.5.19 | Emoji panel slide | Framer Motion `y: 100% → 0` | ✅ |
| 2.5.20 | Page transitions (login → main) | Framer Motion `opacity + scale` | ✅ |

---

## Phase 3. Groups & Channels (Week 4) ✅

| # | Task | Status |
|---|------|--------|
| 3.1 | Groups: creation, invite links, settings | ✅ |
| 3.2 | Roles: creator, admin, member, restricted | ✅ |
| 3.3 | Channels: broadcast-only, subscribers, comments | ✅ |
| 3.4 | Member management (add, remove, kick, ban) | ✅ |
| 3.5 | Forward, Reply thread, Pin, Scheduled messages | ✅ |
| 3.6 | Reactions API + UI | ✅ |

---

## Phase 4. Electron Native Experience (Week 5) ✅

| # | Task | Status |
|---|------|--------|
| 4.1 | Tray icon + badge count | ✅ |
| 4.2 | Notifications (Electron `Notification`) | ✅ |
| 4.3 | Hotkeys (`Ctrl+K`, `Ctrl+N`, `Escape`) | ✅ |
| 4.4 | Minimize to tray, window state persistence | ✅ |
| 4.5 | Protocol handler `m4chat://` | ✅ |
| 4.6 | Auto-updater (`electron-updater`) | ✅ |
| 4.7 | Spellcheck | ✅ |
| 4.8 | IPC `unread-count` → tray badge | ✅ |

---

## Phase 5. Media, Calls, Performance (Week 6) ✅

| # | Task | Status |
|---|------|--------|
| 5.1 | Voice messages (`MediaRecorder` + waveform) | ✅ |
| 5.2 | Files & images (drag-drop, preview, lightbox) | ✅ |
| 5.3 | Link previews (Open Graph parser) | ⏸️ Deferred |
| 5.4 | Video circles | ⏸️ Deferred |
| 5.5 | WebRTC calls (signaling via WebSocket, P2P) | ✅ |
| 5.6 | IndexedDB cache | ✅ |
| 5.7 | Performance: `@tanstack/react-virtual`, memoization | ✅ |

---

## Phase 6. E2E Encryption, Tests, CI/CD (Week 7) 🚧

### 6.1 CI/CD — GitHub Actions
| # | Task | Status |
|---|------|--------|
| 6.1.1 | Workflow: `pnpm install`, `typecheck`, `build` | 🚧 |
| 6.1.2 | Workflow: `vitest` (backend unit + integration) | 🚧 |
| 6.1.3 | Workflow: Docker build + push to GHCR | 🚧 |
| 6.1.4 | Workflow: lint + format check | 🚧 |

### 6.2 Backend Tests
| # | Task | Status |
|---|------|--------|
| 6.2.1 | Vitest + Supertest setup | 🚧 |
| 6.2.2 | Auth tests (register, login, refresh, 2FA) | 🚧 |
| 6.2.3 | Chat tests (create, join, invite, members) | 🚧 |
| 6.2.4 | Message tests (send, edit, delete, reactions) | 🚧 |
| 6.2.5 | File upload tests | 🚧 |
| 6.2.6 | WebSocket tests | 🚧 |

### 6.3 E2E Encryption (Signal Protocol)
| # | Task | Status |
|---|------|--------|
| 6.3.1 | DB schema: `signal_prekeys`, `signal_sessions`, `signal_identity` | 🚧 |
| 6.3.2 | Server endpoints: `/keys/bundle`, `/keys/prekey` | 🚧 |
| 6.3.3 | Client key generation (identity, signed pre-key, one-time pre-keys) | 🚧 |
| 6.3.4 | X3DH key agreement (initial handshake) | 🚧 |
| 6.3.5 | Double Ratchet (send/receive chains) | 🚧 |
| 6.3.6 | Encrypt/decrypt message payload before send | 🚧 |
| 6.3.7 | Group E2E (Sender Keys) | ⏸️ Deferred |

### 6.4 Security Hardening
| # | Task | Status |
|---|------|--------|
| 6.4.1 | Rate limiting on all endpoints | ✅ (partial) |
| 6.4.2 | Helmet + CSP headers | ✅ |
| 6.4.3 | Argon2id password hashing (migration from bcrypt) | ⏸️ Deferred |
| 6.4.4 | Input sanitization (XSS) | ✅ |

### 6.5 Monitoring
| # | Task | Status |
|---|------|--------|
| 6.5.1 | Sentry integration (backend + frontend) | ⏸️ Deferred |
| 6.5.2 | Structured logging (pino) | ⏸️ Deferred |

---

## Architecture Decisions

1. **RustFS over MinIO/S3**: Open-source (Apache 2.0), S3-compatible, lighter for single-node, Docker-native.
2. **Socket.io over raw WS**: Built-in rooms, auth middleware, reconnection, namespacing.
3. **Drizzle Migrations over `push`**: Production-safe schema evolution.
4. **bcrypt over SHA256**: Industry-standard password hashing.
5. **Electron over Tauri**: Faster development, mature ecosystem, auto-updater, protocol handlers.

---

## Notes

- Mobile version is **not** planned. Desktop only.
- All backend is production-ready and deployed via Docker Compose (Portainer).
- Frontend connects to real API — no mocks after Phase 2.
- E2E encryption is Phase 6 to avoid blocking core features.
