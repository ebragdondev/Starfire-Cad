FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
RUN npm i -g pnpm@10.11.1 && pnpm i
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "build/index.js"]