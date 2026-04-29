FROM node:22-slim AS builder
WORKDIR /app

# Копируем package.json first для кеширования слоёв
COPY package.json package-lock.json* pnpm-workspace.yaml .npmrc ./
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/electron-app/package.json ./artifacts/electron-app/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY scripts/package.json ./scripts/

# Устанавливаем зависимости через npm (избегаем проблем pnpm lockfile на разных платформах)
RUN npm install

# Копируем остальные файлы
COPY . .

# Билдим только artifacts напрямую без общего typecheck
RUN npm run build --workspace=@workspace/api-server && \
    npm run build --workspace=@workspace/frontend

ENV NODE_ENV=production
ENV BASE_PATH=/

# ==========================================
# Образ для API-сервера
# ==========================================
FROM node:22-slim AS api
WORKDIR /app

# Копируем собранное приложение из builder
COPY --from=builder /app /app

# Копируем исходники для доступа к admin routes
COPY --from=builder /app/artifacts/api-server/src /app/artifacts/api-server/src

EXPOSE 8080
# Запускаем миграции БД перед стартом API
CMD ["sh", "-c", "npm run migrate --workspace=@workspace/db && npm start --workspace=@workspace/api-server"]

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
