import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../env';
import { requireAuth, setAuthCookie, clearAuthCookie, getUserFromRequest } from './utils';

const prisma = new PrismaClient();
export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128)
});

authRouter.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, username, password } = parse.data;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ error: 'Email or username already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, username, passwordHash } });

  const token = jwt.sign({ uid: user.id, role: user.globalRole }, env.AUTH_SECRET, { expiresIn: '7d' });
  setAuthCookie(res, token);

  res.status(201).json({ user: { id: user.id, email: user.email, username: user.username, role: user.globalRole } });
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(8)
});

authRouter.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { emailOrUsername, password } = parse.data;

  const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ uid: user.id, role: user.globalRole }, env.AUTH_SECRET, { expiresIn: '7d' });
  setAuthCookie(res, token);

  res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.globalRole } });
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.globalRole } });
});