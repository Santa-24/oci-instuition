# Multi-stage production container for OCI Backend Service
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./

FROM base AS dependencies
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY src/ ./src/

USER expressjs

EXPOSE 8080

CMD ["node", "src/server.js"]
