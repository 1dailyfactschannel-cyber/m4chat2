FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Копируем исходники и устанавливаем зависимости
COPY . .
RUN pnpm install --frozen-lockfile

# Собираем проект
ENV NODE_ENV=production
ENV BASE_PATH=/
RUN pnpm run build

# ==========================================
# Образ для API-сервера
# ==========================================
FROM node:22-alpine AS api
RUN corepack enable && corepack prepare pnpm@latest --activate && apk add --no-cache wget
WORKDIR /app

# Копируем собранное приложение из builder
COPY --from=builder /app /app

EXPOSE 8080
# Запускаем миграции БД перед стартом API
CMD ["sh", "-c", "pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run start"]

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
