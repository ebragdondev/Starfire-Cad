import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../env';

const prisma = new PrismaClient();

const AUTH_COOKIE = 'starfirecad_token';

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE);
}

export async function getUserFromRequest(req: Request) {
  const token = req.cookies?.[AUTH_COOKIE] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.AUTH_SECRET) as { uid: string };
    const user = await prisma.user.findUnique({ where: { id: payload.uid } });
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  // @ts-expect-error attach user
  req.user = user;
  next();
}

export function requireGlobalAdmin(req: Request, res: Response, next: NextFunction) {
  // @ts-expect-error
  const user = req.user;
  if (user?.globalRole !== 'GLOBAL_ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}