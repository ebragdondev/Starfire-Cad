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

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(cors({
    origin: env.APP_URL,
    credentials: true
  }));

  // Stripe webhook must come before body parsers that consume req.body
  app.use('/stripe', stripeRouter);

  // Only parse JSON for non-stripe routes
  app.use(express.json({ limit: '2mb' }));

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

  io.on('connection', (socket) => {
    socket.emit('welcome', { message: 'Connected to StarfireCAD' });
  });

  return { app, httpServer };
}