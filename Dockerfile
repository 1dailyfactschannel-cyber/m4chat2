FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /app

# Копируем package.json с packageManager first для кеширования слоёв
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/electron-app/package.json ./artifacts/electron-app/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY scripts/package.json ./scripts/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем остальные файлы
COPY . .

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
RUN corepack enable && apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
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
# Удаляем дефолтный nginx welcome page
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
# Копируем собранные статические файлы фронтенда
COPY --from=builder /app/artifacts/mockup-sandbox/dist /usr/share/nginx/html
# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Проверяем конфигурацию nginx на валидность
RUN nginx -t

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
