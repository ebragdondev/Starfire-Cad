const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createCommunitySchema = z.object({
  name: z.string().min(3).max(50),
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  website: z.string().url().optional(),
  timezone: z.string().default('UTC'),
});

const updateCommunitySchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  discordWebhook: z.string().url().optional(),
  timezone: z.string().optional(),
  settings: z.object({}).optional(),
});

// Middleware to check community membership
const checkCommunityAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const { communityId } = req.params;
      const member = await prisma.communityMember.findFirst({
        where: {
          userId: req.user.userId,
          communityId,
          isActive: true,
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (requiredRole) {
        const roleHierarchy = ['civilian', 'ems', 'fire', 'officer', 'dispatcher', 'supervisor', 'admin', 'owner'];
        const memberRoleIndex = roleHierarchy.indexOf(member.role);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

        if (memberRoleIndex < requiredRoleIndex) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      req.member = member;
      next();
    } catch (error) {
      console.error('Access check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Create new community
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = createCommunitySchema.parse(req.body);

    // Check if slug is unique
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCommunity) {
      return res.status(400).json({ error: 'Community slug already exists' });
    }

    // Create community
    const community = await prisma.community.create({
      data: validatedData,
    });

    // Add creator as owner
    await prisma.communityMember.create({
      data: {
        userId: req.user.userId,
        communityId: community.id,
        role: 'owner',
        isPrimary: true,
      },
    });

    // Create default departments
    const defaultDepartments = [
      { name: 'Police Department', abbreviation: 'PD', type: 'police', color: '#1e40af' },
      { name: 'Fire Department', abbreviation: 'FD', type: 'fire', color: '#dc2626' },
      { name: 'Emergency Medical Services', abbreviation: 'EMS', type: 'ems', color: '#059669' },
      { name: 'Dispatch', abbreviation: 'DISP', type: 'dispatch', color: '#7c3aed' },
    ];

    await prisma.department.createMany({
      data: defaultDepartments.map(dept => ({
        ...dept,
        communityId: community.id,
      })),
    });

    // Create default status codes
    const defaultStatusCodes = [
      { code: '10-7', meaning: 'Off Duty', type: 'status' },
      { code: '10-8', meaning: 'Available', type: 'status', color: '#22c55e' },
      { code: '10-6', meaning: 'Busy', type: 'status', color: '#f59e0b' },
      { code: '10-97', meaning: 'En Route', type: 'status', color: '#3b82f6' },
      { code: '10-23', meaning: 'On Scene', type: 'status', color: '#8b5cf6' },
      { code: '10-11', meaning: 'Traffic Stop', type: 'status', color: '#06b6d4' },
      { code: '10-99', meaning: 'Emergency', type: 'status', color: '#ef4444', shouldPanic: true },
    ];

    await prisma.statusCode.createMany({
      data: defaultStatusCodes.map(code => ({
        ...code,
        communityId: community.id,
      })),
    });

    res.status(201).json(community);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's communities
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const memberships = await prisma.communityMember.findMany({
      where: {
        userId: req.user.userId,
        isActive: true,
      },
      include: {
        community: true,
        department: true,
      },
    });

    res.json(memberships);
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community details
router.get('/:communityId', authenticateToken, checkCommunityAccess(), async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.communityId },
      include: {
        departments: true,
        _count: {
          select: {
            members: true,
            units: true,
            calls: true,
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update community
router.patch('/:communityId', authenticateToken, checkCommunityAccess('admin'), async (req, res) => {
  try {
    const validatedData = updateCommunitySchema.parse(req.body);

    const community = await prisma.community.update({
      where: { id: req.params.communityId },
      data: validatedData,
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        communityId: req.params.communityId,
        userId: req.user.userId,
        action: 'community_updated',
        entityType: 'community',
        entityId: req.params.communityId,
        changes: validatedData,
      },
    });

    res.json(community);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community members
router.get('/:communityId/members', authenticateToken, checkCommunityAccess(), async (req, res) => {
  try {
    const { page = 1, limit = 50, role, department, search } = req.query;

    const where = {
      communityId: req.params.communityId,
      isActive: true,
    };

    if (role) where.role = role;
    if (department) where.departmentId = department;
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { callSign: { contains: search, mode: 'insensitive' } },
        { badgeNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          department: true,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.communityMember.count({ where }),
    ]);

    res.json({
      members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to community
router.post('/:communityId/members', authenticateToken, checkCommunityAccess('admin'), async (req, res) => {
  try {
    const { userId, role, departmentId, badgeNumber, callSign, rank } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findFirst({
      where: {
        userId,
        communityId: req.params.communityId,
      },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        return res.status(400).json({ error: 'User is already a member' });
      }
      
      // Reactivate member
      const member = await prisma.communityMember.update({
        where: { id: existingMember.id },
        data: {
          isActive: true,
          role,
          departmentId,
          badgeNumber,
          callSign,
          rank,
        },
        include: {
          user: true,
          department: true,
        },
      });

      return res.json(member);
    }

    // Check community limits
    const community = await prisma.community.findUnique({
      where: { id: req.params.communityId },
    });

    const memberCount = await prisma.communityMember.count({
      where: {
        communityId: req.params.communityId,
        isActive: true,
      },
    });

    if (community.maxUsers !== -1 && memberCount >= community.maxUsers) {
      return res.status(400).json({ 
        error: 'Community has reached maximum user limit. Please upgrade your subscription.' 
      });
    }

    // Create member
    const member = await prisma.communityMember.create({
      data: {
        userId,
        communityId: req.params.communityId,
        role,
        departmentId,
        badgeNumber,
        callSign,
        rank,
      },
      include: {
        user: true,
        department: true,
      },
    });

    // Send notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'system',
        title: 'Added to Community',
        content: `You have been added to ${community.name} as ${role}`,
        data: { communityId: community.id },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member
router.patch('/:communityId/members/:memberId', authenticateToken, checkCommunityAccess('admin'), async (req, res) => {
  try {
    const { role, departmentId, badgeNumber, callSign, rank, permissions } = req.body;

    const member = await prisma.communityMember.update({
      where: { id: req.params.memberId },
      data: {
        role,
        departmentId,
        badgeNumber,
        callSign,
        rank,
        permissions,
      },
      include: {
        user: true,
        department: true,
      },
    });

    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove member
router.delete('/:communityId/members/:memberId', authenticateToken, checkCommunityAccess('admin'), async (req, res) => {
  try {
    const member = await prisma.communityMember.findUnique({
      where: { id: req.params.memberId },
    });

    if (member.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove community owner' });
    }

    await prisma.communityMember.update({
      where: { id: req.params.memberId },
      data: { isActive: false },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departments
router.get('/:communityId/departments', authenticateToken, checkCommunityAccess(), async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        communityId: req.params.communityId,
        isActive: true,
      },
      include: {
        ranks: true,
        _count: {
          select: {
            members: true,
            units: true,
          },
        },
      },
    });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create department
router.post('/:communityId/departments', authenticateToken, checkCommunityAccess('admin'), async (req, res) => {
  try {
    const { name, abbreviation, type, color } = req.body;

    const department = await prisma.department.create({
      data: {
        communityId: req.params.communityId,
        name,
        abbreviation,
        type,
        color,
      },
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community statistics
router.get('/:communityId/stats', authenticateToken, checkCommunityAccess(), async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      activeUnits,
      todayCalls,
      weekCalls,
      monthCalls,
      activeCalls,
      recentActivity,
    ] = await Promise.all([
      prisma.communityMember.count({
        where: { communityId: req.params.communityId, isActive: true },
      }),
      prisma.unit.count({
        where: { communityId: req.params.communityId, isOnline: true },
      }),
      prisma.call.count({
        where: {
          communityId: req.params.communityId,
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.call.count({
        where: {
          communityId: req.params.communityId,
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.call.count({
        where: {
          communityId: req.params.communityId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.call.count({
        where: {
          communityId: req.params.communityId,
          status: { in: ['pending', 'active', 'dispatched', 'en_route', 'on_scene'] },
        },
      }),
      prisma.auditLog.findMany({
        where: { communityId: req.params.communityId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    res.json({
      members: totalMembers,
      activeUnits,
      calls: {
        today: todayCalls,
        week: weekCalls,
        month: monthCalls,
        active: activeCalls,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;