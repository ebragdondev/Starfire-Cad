import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth/utils';
import { prisma } from '../../lib/prisma';
import { CallStatus, CommunityRole } from '@prisma/client';
export const cadRouter = Router();
cadRouter.use(requireAuth);
const listSchema = z.object({ communityId: z.string().uuid() });
cadRouter.get('/calls', async (req, res) => {
    const parse = listSchema.safeParse(req.query);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid query' });
    const { communityId } = parse.data;
    // @ts-expect-error user
    const user = req.user;
    const membership = await prisma.membership.findFirst({ where: { userId: user.id, communityId } });
    if (!membership)
        return res.status(403).json({ error: 'Forbidden' });
    const calls = await prisma.call.findMany({ where: { communityId }, orderBy: { createdAt: 'desc' } });
    res.json({ calls });
});
const createSchema = z.object({ communityId: z.string().uuid(), title: z.string().min(1), description: z.string().min(1), location: z.string().min(1) });
cadRouter.post('/calls', async (req, res) => {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const { communityId, title, description, location } = parse.data;
    // @ts-expect-error user
    const user = req.user;
    const membership = await prisma.membership.findFirst({ where: { userId: user.id, communityId } });
    if (!membership)
        return res.status(403).json({ error: 'Forbidden' });
    const call = await prisma.call.create({ data: { communityId, title, description, location, status: CallStatus.OPEN } });
    // TODO: emit over Socket.IO via server instance, or publish to Redis channel for adapter
    res.status(201).json({ call });
});
const updateSchema = z.object({ status: z.nativeEnum(CallStatus).optional(), title: z.string().optional(), description: z.string().optional(), location: z.string().optional() });
cadRouter.patch('/calls/:id', async (req, res) => {
    const { id } = req.params;
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    // @ts-expect-error user
    const user = req.user;
    const call = await prisma.call.findUnique({ where: { id } });
    if (!call)
        return res.status(404).json({ error: 'Not found' });
    const membership = await prisma.membership.findFirst({ where: { userId: user.id, communityId: call.communityId } });
    if (!membership || (membership.role === CommunityRole.MEMBER && parse.data.status && parse.data.status !== call.status)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await prisma.call.update({ where: { id }, data: parse.data });
    res.json({ call: updated });
});
