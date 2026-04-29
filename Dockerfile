FROM node:22-slim AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Копируем исходники и устанавливаем зависимости
COPY . .
RUN pnpm install --frozen-lockfile

# Билдим только artifacts напрямую без общего typecheck
# NODE_ENV=production ставим ПОСЛЕ install, чтобы devDeps (drizzle-kit, tsx) были доступны
RUN pnpm --filter @workspace/api-server run build && \
    pnpm --filter @workspace/frontend run build

ENV NODE_ENV=production
ENV BASE_PATH=/

# ==========================================
# Образ для API-сервера
# ==========================================
FROM node:22-slim AS api
RUN corepack enable && corepack prepare pnpm@latest --activate && apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Копируем собранное приложение из builder
COPY --from=builder /app /app

# Копируем исходники для доступа к admin routes
COPY --from=builder /app/artifacts/api-server/src /app/artifacts/api-server/src

EXPOSE 8080
# Запускаем миграции БД перед стартом API
CMD ["sh", "-c", "pnpm --filter @workspace/db run migrate && pnpm --filter @workspace/api-server run start"]

# ==========================================
# Образ для Frontend (Nginx)
# ==========================================
FROM nginx:alpine AS web
# Копируем собранные статические файлы фронтенда
COPY --from=builder /app/artifacts/mockup-sandbox/dist /usr/share/nginx/html
# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
