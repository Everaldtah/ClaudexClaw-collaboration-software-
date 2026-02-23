# ─── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json .
RUN npm install

COPY frontend/ .
RUN npm run build

# ─── Stage 2: Backend + serve built frontend ───────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

COPY backend/package.json .
RUN npm install --omit=dev

COPY backend/ .

# Copy built frontend into backend's serve directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3010

ENV NODE_ENV=production
ENV PORT=3010

CMD ["node", "server.js"]
