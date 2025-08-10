# StarfireCAD Monorepo

Next-gen, customizable CAD/MDT platform for FiveM roleplay communities.

## Stack
- Frontend: Next.js (App Router, TypeScript, Tailwind), React Query, React Grid Layout, Socket.IO client
- Backend: Express (TypeScript), Prisma (PostgreSQL), Zod, Socket.IO, BullMQ (Redis)
- Auth: Local email/username/password (bcrypt + JWT/Session), role-based access control
- Infra: PostgreSQL, Redis, Stripe billing
- Packaging: pnpm workspaces, Docker, Docker Compose

## Apps
- `apps/web`: Next.js UI (drag-and-drop layouts, community and admin panels)
- `apps/api`: Express API, Socket.IO, Prisma

## Quickstart (local)
1. Install deps
```bash
pnpm i
```
2. Set env
```bash
cp .env.example .env
# (optional) set NEXT_PUBLIC_API_URL=http://localhost:4000
```
3. Start dev servers (in two terminals)
```bash
pnpm --filter @starfirecad/api dev # port 4000
pnpm --filter @starfirecad/web dev # port 3000
```

## Docker Compose (single-EC2)
- Includes `api`, `web`, `postgres`, `redis`
- Copy `.env.example` to `.env` and set secrets
```bash
docker compose up -d --build
```

## Notes
- Run `pnpm --filter @starfirecad/api prisma:generate` after schema changes
- To create migrations, provide `DATABASE_URL` and run `pnpm --filter @starfirecad/api prisma:migrate`

## License
Proprietary