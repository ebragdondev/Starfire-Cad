import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
async function main() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const username = process.env.SEED_ADMIN_USERNAME;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !username || !password) {
        console.log('Seed skipped: provide SEED_ADMIN_EMAIL/USERNAME/PASSWORD');
        return;
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
        console.log('Admin already exists, skipping');
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, username, passwordHash, globalRole: 'GLOBAL_ADMIN' } });
    console.log('Admin user created');
}
main().finally(async () => prisma.$disconnect());
