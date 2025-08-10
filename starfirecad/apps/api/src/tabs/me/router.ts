import { Router } from 'express';
import { requireAuth } from '../auth/utils';
import { prisma } from '../../lib/prisma';

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get('/', async (req, res) => {
  // @ts-expect-error user
  const user = req.user;
  res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.globalRole } });
});

meRouter.get('/preferences', async (req, res) => {
  // @ts-expect-error user
  const user = req.user;
  const prefs = await prisma.userPreference.findUnique({ where: { userId: user.id } });
  res.json({ preferences: prefs ?? { uiLayout: {} } });
});

meRouter.put('/preferences', async (req, res) => {
  // @ts-expect-error user
  const user = req.user;
  const { uiLayout } = req.body as { uiLayout: unknown };
  const updated = await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, uiLayout: uiLayout as any },
    update: { uiLayout: uiLayout as any }
  });
  res.json({ preferences: updated });
});