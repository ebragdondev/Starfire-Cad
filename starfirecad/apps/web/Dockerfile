# Install deps and build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
RUN npm i -g pnpm@10.11.1 && pnpm i
COPY . .
RUN pnpm build

# Run standalone server
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]