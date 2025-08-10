import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../auth/utils';
const prisma = new PrismaClient();
export const communityRouter = Router();
communityRouter.use(requireAuth);
const createSchema = z.object({ name: z.string().min(3).max(100) });
communityRouter.post('/', async (req, res) => {
    // @ts-expect-error user
    const user = req.user;
    const parse = createSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const name = parse.data.name;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.community.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing)
        return res.status(409).json({ error: 'Community name or slug in use' });
    const community = await prisma.community.create({ data: { name, slug, createdById: user.id, settings: {} } });
    await prisma.membership.create({ data: { communityId: community.id, userId: user.id, role: 'COMMUNITY_OWNER' } });
    res.status(201).json({ community });
});
communityRouter.get('/', async (req, res) => {
    // @ts-expect-error user
    const user = req.user;
    const memberships = await prisma.membership.findMany({ where: { userId: user.id }, include: { community: true } });
    res.json({ communities: memberships.map((m) => ({ ...m.community, role: m.role })) });
});
const updateSchema = z.object({ name: z.string().min(3).max(100).optional(), settings: z.record(z.any()).optional() });
communityRouter.patch('/:id', async (req, res) => {
    // @ts-expect-error user
    const user = req.user;
    const { id } = req.params;
    const membership = await prisma.membership.findFirst({ where: { userId: user.id, communityId: id } });
    if (!membership || (membership.role !== 'COMMUNITY_OWNER' && membership.role !== 'COMMUNITY_ADMIN' && membership.role !== 'COMMUNITY_MANAGER')) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const data = {};
    if (parse.data.name)
        data.name = parse.data.name;
    if (parse.data.settings)
        data.settings = parse.data.settings;
    const updated = await prisma.community.update({ where: { id }, data });
    res.json({ community: updated });
});
communityRouter.post('/:id/members', async (req, res) => {
    // @ts-expect-error user
    const user = req.user;
    const { id } = req.params;
    const roleSchema = z.object({ userId: z.string().uuid(), role: z.string() });
    const parse = roleSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const adminMembership = await prisma.membership.findFirst({ where: { userId: user.id, communityId: id } });
    if (!adminMembership || (adminMembership.role !== 'COMMUNITY_OWNER' && adminMembership.role !== 'COMMUNITY_ADMIN')) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const member = await prisma.membership.upsert({
        where: { userId_communityId: { userId: parse.data.userId, communityId: id } },
        create: { userId: parse.data.userId, communityId: id, role: parse.data.role },
        update: { role: parse.data.role }
    });
    res.status(201).json({ member });
});
