const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const next = require('next');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');
require('dotenv').config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'starfirecad' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

// Initialize Next.js
const nextApp = next({ dev, hostname, port: 3000 });
const handle = nextApp.getRequestHandler();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
});

nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);
  
  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api/', limiter);

  // API Routes
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/communities', require('./api/communities'));
  app.use('/api/dispatch', require('./api/dispatch'));
  app.use('/api/mdt', require('./api/mdt'));
  app.use('/api/admin', require('./api/admin'));
  app.use('/api/stripe', require('./api/stripe'));
  app.use('/api/webhooks', require('./api/webhooks'));

  // Socket.io namespace for real-time communication
  const dispatchNamespace = io.of('/dispatch');
  const mdtNamespace = io.of('/mdt');

  // Socket authentication middleware
  const socketAuth = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      // Verify token and attach user to socket
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { communityMembers: true },
      });
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };

  // Dispatch namespace handlers
  dispatchNamespace.use(socketAuth);
  dispatchNamespace.on('connection', (socket) => {
    logger.info(`Dispatcher connected: ${socket.userId}`);
    
    // Join community rooms
    socket.user.communityMembers.forEach(member => {
      socket.join(`community:${member.communityId}`);
      socket.join(`dispatch:${member.communityId}`);
    });

    // Handle dispatch events
    socket.on('call:create', async (data) => {
      try {
        // Create call in database
        const call = await prisma.call.create({
          data: {
            ...data,
            dispatcherId: socket.userId,
            callNumber: `CALL-${Date.now()}`,
          },
          include: {
            units: true,
            notes: true,
          },
        });
        
        // Broadcast to community
        dispatchNamespace.to(`community:${data.communityId}`).emit('call:created', call);
        
        // Log event
        await prisma.callEvent.create({
          data: {
            callId: call.id,
            type: 'created',
            data: { createdBy: socket.userId },
          },
        });
      } catch (error) {
        logger.error('Error creating call:', error);
        socket.emit('error', { message: 'Failed to create call' });
      }
    });

    socket.on('call:update', async (data) => {
      try {
        const { callId, ...updateData } = data;
        const call = await prisma.call.update({
          where: { id: callId },
          data: updateData,
          include: {
            units: true,
            notes: true,
          },
        });
        
        dispatchNamespace.to(`community:${call.communityId}`).emit('call:updated', call);
      } catch (error) {
        logger.error('Error updating call:', error);
        socket.emit('error', { message: 'Failed to update call' });
      }
    });

    socket.on('unit:assign', async (data) => {
      try {
        const { callId, unitId } = data;
        const callUnit = await prisma.callUnit.create({
          data: {
            callId,
            unitId,
            isPrimary: data.isPrimary || false,
          },
        });
        
        // Update unit status
        await prisma.unit.update({
          where: { id: unitId },
          data: { status: '10-97' }, // En route
        });
        
        // Get updated call
        const call = await prisma.call.findUnique({
          where: { id: callId },
          include: { units: true },
        });
        
        dispatchNamespace.to(`community:${call.communityId}`).emit('call:updated', call);
        
        // Log event
        await prisma.callEvent.create({
          data: {
            callId,
            type: 'unit_assigned',
            data: { unitId, assignedBy: socket.userId },
          },
        });
      } catch (error) {
        logger.error('Error assigning unit:', error);
        socket.emit('error', { message: 'Failed to assign unit' });
      }
    });

    socket.on('unit:status', async (data) => {
      try {
        const { unitId, status, location } = data;
        const unit = await prisma.unit.update({
          where: { id: unitId },
          data: {
            status,
            location: location || undefined,
            lastStatusChange: new Date(),
          },
        });
        
        dispatchNamespace.to(`community:${unit.communityId}`).emit('unit:statusChanged', unit);
      } catch (error) {
        logger.error('Error updating unit status:', error);
        socket.emit('error', { message: 'Failed to update unit status' });
      }
    });

    socket.on('panic', async (data) => {
      try {
        const { unitId } = data;
        const unit = await prisma.unit.update({
          where: { id: unitId },
          data: {
            isPanic: true,
            status: '10-99', // Emergency
          },
        });
        
        // Create high priority call
        const panicCall = await prisma.call.create({
          data: {
            communityId: unit.communityId,
            callNumber: `PANIC-${Date.now()}`,
            type: 'panic',
            priority: 'critical',
            status: 'active',
            nature: 'Officer Panic Button',
            location: 'See unit location',
            description: `Panic button activated by ${unit.callSign}`,
            dispatcherId: socket.userId,
          },
        });
        
        // Broadcast panic to all units
        dispatchNamespace.to(`community:${unit.communityId}`).emit('panic:activated', {
          unit,
          call: panicCall,
        });
        
        // Send notifications
        const members = await prisma.communityMember.findMany({
          where: { communityId: unit.communityId },
        });
        
        for (const member of members) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              type: 'panic',
              title: 'PANIC BUTTON ACTIVATED',
              content: `${unit.callSign} has activated their panic button`,
              data: { unitId, callId: panicCall.id },
            },
          });
        }
      } catch (error) {
        logger.error('Error handling panic:', error);
        socket.emit('error', { message: 'Failed to activate panic' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Dispatcher disconnected: ${socket.userId}`);
    });
  });

  // MDT namespace handlers
  mdtNamespace.use(socketAuth);
  mdtNamespace.on('connection', (socket) => {
    logger.info(`MDT user connected: ${socket.userId}`);
    
    // Join community rooms
    socket.user.communityMembers.forEach(member => {
      socket.join(`community:${member.communityId}`);
      socket.join(`mdt:${member.communityId}`);
    });

    socket.on('unit:online', async (data) => {
      try {
        const { unitId } = data;
        const unit = await prisma.unit.update({
          where: { id: unitId },
          data: {
            isOnline: true,
            status: '10-8', // Available
          },
        });
        
        mdtNamespace.to(`community:${unit.communityId}`).emit('unit:online', unit);
        dispatchNamespace.to(`community:${unit.communityId}`).emit('unit:online', unit);
      } catch (error) {
        logger.error('Error setting unit online:', error);
        socket.emit('error', { message: 'Failed to set unit online' });
      }
    });

    socket.on('unit:offline', async (data) => {
      try {
        const { unitId } = data;
        const unit = await prisma.unit.update({
          where: { id: unitId },
          data: {
            isOnline: false,
            status: '10-7', // Off duty
          },
        });
        
        mdtNamespace.to(`community:${unit.communityId}`).emit('unit:offline', unit);
        dispatchNamespace.to(`community:${unit.communityId}`).emit('unit:offline', unit);
      } catch (error) {
        logger.error('Error setting unit offline:', error);
        socket.emit('error', { message: 'Failed to set unit offline' });
      }
    });

    socket.on('location:update', async (data) => {
      try {
        const { unitId, location } = data;
        const unit = await prisma.unit.update({
          where: { id: unitId },
          data: { location },
        });
        
        // Broadcast location to dispatch
        dispatchNamespace.to(`community:${unit.communityId}`).emit('unit:locationUpdate', {
          unitId,
          location,
        });
      } catch (error) {
        logger.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('trafficStop:start', async (data) => {
      try {
        const trafficStop = await prisma.trafficStop.create({
          data,
        });
        
        // Update unit status
        await prisma.unit.update({
          where: { id: data.unitId },
          data: { status: '10-11' }, // Traffic stop
        });
        
        mdtNamespace.to(`community:${data.communityId}`).emit('trafficStop:started', trafficStop);
        dispatchNamespace.to(`community:${data.communityId}`).emit('trafficStop:started', trafficStop);
      } catch (error) {
        logger.error('Error starting traffic stop:', error);
        socket.emit('error', { message: 'Failed to start traffic stop' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`MDT user disconnected: ${socket.userId}`);
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Next.js request handler
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  server.listen(port, () => {
    logger.info(`> Server ready on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
});

module.exports = { prisma };