FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ 2>/dev/null || true
RUN npm i -g pnpm@10.11.1 && pnpm i --prod=false
COPY . .
RUN pnpm prisma generate && pnpm build
CMD ["node", "dist/index.js"]