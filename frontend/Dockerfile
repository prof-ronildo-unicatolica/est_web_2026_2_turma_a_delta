# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --silent

# Copia somente os arquivos necessários para o build
COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/

RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]