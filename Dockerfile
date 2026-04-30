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
ARG CACHE_BUST=4

# Удаляем Windows-specific lockfile и устанавливаем зависимости заново под Linux
RUN rm -f pnpm-lock.yaml && pnpm install

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

# Копируем необходимые файлы из builder (без кэшированных старых скриптов)
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=builder /app/.npmrc /app/.npmrc

# Workspace packages
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/artifacts/api-server /app/artifacts/api-server
COPY --from=builder /app/artifacts/mockup-sandbox /app/artifacts/mockup-sandbox
COPY --from=builder /app/scripts /app/scripts

# Скрипт миграций и SQL
COPY scripts/apply-migrations.mjs /app/scripts/apply-migrations.mjs
COPY database/migrations.sql /app/database/migrations.sql

EXPOSE 8080
CMD ["sh", "-c", "sleep 5 && echo '[entrypoint] Applying schema updates...' && node /app/scripts/apply-migrations.mjs || echo '[entrypoint] Schema updates skipped.' && exec pnpm --filter @workspace/api-server run start"]

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
