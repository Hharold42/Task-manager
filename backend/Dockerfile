FROM node:20-alpine AS builder
WORKDIR /app

ARG DATABASE_URL=postgresql://taskapp:taskapp@db:5432/taskapp?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate --config prisma.config.ts
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

ARG DATABASE_URL=postgresql://taskapp:taskapp@db:5432/taskapp?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "DATABASE_URL=${DATABASE_URL:-postgresql://taskapp:taskapp@db:5432/taskapp?schema=public} npx prisma migrate deploy --config prisma.config.ts && node dist/main"]
