import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireGlobalAdmin } from '../auth/utils';
const prisma = new PrismaClient();
export const adminRouter = Router();
adminRouter.use(requireAuth, requireGlobalAdmin);
adminRouter.get('/users', async (_req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, email: true, username: true, globalRole: true, createdAt: true } });
    res.json({ users });
});
adminRouter.get('/communities', async (_req, res) => {
    const communities = await prisma.community.findMany({ select: { id: true, name: true, slug: true, createdAt: true } });
    res.json({ communities });
});
