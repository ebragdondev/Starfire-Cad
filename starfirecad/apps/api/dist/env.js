import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().default('4000'),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(16),
    AUTH_EMAIL_FROM: z.string().email().optional(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    REDIS_PASSWORD: z.string().optional().nullable(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    APP_URL: z.string().url().default('http://localhost:3000')
});
export const env = envSchema.parse(process.env);
