import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env';
import { authRouter } from './tabs/auth/router';
import { adminRouter } from './tabs/admin/router';
import { communityRouter } from './tabs/community/router';
import { stripeRouter } from './tabs/stripe/router';
import compression from 'compression';
import pino from 'pino';
import client from 'prom-client';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient as createRedisClient } from 'redis';
export function createServer() {
    const app = express();
    const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(compression());
    app.use(cookieParser());
    app.use(cors({
        origin: env.APP_URL,
        credentials: true
    }));
    // Stripe webhook must come before body parsers that consume req.body
    app.use('/stripe', stripeRouter);
    // Only parse JSON for non-stripe routes
    app.use(express.json({ limit: '2mb' }));
    // Metrics
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();
    app.get('/metrics', async (_req, res) => {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    });
    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/communities', communityRouter);
    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: env.APP_URL,
            credentials: true
        }
    });
    // Redis adapter for scaling websockets
    (async () => {
        try {
            const pubClient = createRedisClient({ url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}` });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            logger.info('Socket.IO using Redis adapter');
        }
        catch (e) {
            logger.warn({ err: e }, 'Redis adapter not enabled');
        }
    })();
    io.on('connection', (socket) => {
        socket.emit('welcome', { message: 'Connected to StarfireCAD' });
    });
    return { app, httpServer };
}
