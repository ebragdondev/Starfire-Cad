import jwt from 'jsonwebtoken';
import { env } from '../../env';
import { prisma } from '../../lib/prisma';
const AUTH_COOKIE = 'starfirecad_token';
export function setAuthCookie(res, token) {
    res.cookie(AUTH_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
}
export function clearAuthCookie(res) {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
}
export async function getUserFromRequest(req) {
    const token = req.cookies?.[AUTH_COOKIE] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
    if (!token)
        return null;
    try {
        const payload = jwt.verify(token, env.AUTH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: payload.uid } });
        return user;
    }
    catch {
        return null;
    }
}
export async function requireAuth(req, res, next) {
    const user = await getUserFromRequest(req);
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    // @ts-expect-error attach user
    req.user = user;
    next();
}
export function requireGlobalAdmin(req, res, next) {
    // @ts-expect-error
    const user = req.user;
    if (user?.globalRole !== 'GLOBAL_ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    next();
}
