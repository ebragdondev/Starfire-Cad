FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
RUN npm i -g pnpm@10.11.1 && pnpm i
COPY . .
RUN pnpm prisma generate && pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/dist ./dist
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /usr/local/bin/pnpm /usr/local/bin/pnpm
COPY --from=deps /usr/local/lib/node_modules /usr/local/lib/node_modules

CMD sh -c "pnpm prisma:deploy && node dist/index.js"