FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /app

# Копируем package.json файлы
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/electron-app/package.json ./artifacts/electron-app/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY scripts/package.json ./scripts/

# Инвалидируем кэш при изменении зависимостей
ARG CACHE_BUST=9

# Удаляем Windows-specific lockfile и устанавливаем зависимости заново под Linux
RUN rm -f pnpm-lock.yaml && pnpm install

# Копируем build trigger (изменение этого файла инвалидирует Docker cache)
COPY .build-trigger .build-trigger

# Копируем остальные файлы
COPY . .

# Билдим
RUN pnpm --filter @workspace/api-server run build && \
    pnpm --filter @workspace/frontend run build

ENV NODE_ENV=production
ENV BASE_PATH=/

# ==========================================
# Образ для API-сервера
# ==========================================
FROM node:22-slim AS api
RUN corepack enable
WORKDIR /app

# Копируем все файлы из builder
COPY --from=builder /app /app

# Восстанавливаем workspace-линки (hardlinks из builder ломаются)
WORKDIR /app
RUN pnpm install

# Гарантированно свежие файлы (инвалидируют кэш)
COPY artifacts/api-server/src/app.ts /app/artifacts/api-server/src/app.ts
COPY artifacts/api-server/src/index.ts /app/artifacts/api-server/src/index.ts
COPY artifacts/api-server/src/migrations.ts /app/artifacts/api-server/src/migrations.ts

# Пересобираем API с обновлённым кодом
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080
CMD ["sh", "-c", "sleep 5 && exec pnpm --filter @workspace/api-server run start"]

# ==========================================
# Образ для Frontend (Nginx)
# ==========================================
FROM nginx:alpine AS web
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY --from=builder /app/artifacts/mockup-sandbox/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/log/nginx /run/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
