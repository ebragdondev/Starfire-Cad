const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription plans
const PLANS = {
  basic: {
    name: 'Basic',
    price: 1999, // $19.99 in cents
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: {
      maxUsers: 10,
      maxUnits: 20,
      maxCalls: 500,
      customFields: false,
      webhooks: false,
      apiAccess: false,
      support: 'community',
    },
  },
  professional: {
    name: 'Professional',
    price: 4999, // $49.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxUsers: 50,
      maxUnits: 100,
      maxCalls: 5000,
      customFields: true,
      webhooks: true,
      apiAccess: false,
      support: 'email',
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 14999, // $149.99 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxUsers: -1, // unlimited
      maxUnits: -1, // unlimited
      maxCalls: -1, // unlimited
      customFields: true,
      webhooks: true,
      apiAccess: true,
      support: 'priority',
    },
  },
};

// Middleware to check if user is community owner
const isCommunityOwner = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: req.user.userId,
        communityId,
        role: 'owner',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Only community owners can manage subscriptions' });
    }

    req.communityId = communityId;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { communityId, plan } = req.body;

    // Verify user is community owner
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: req.user.userId,
        communityId,
        role: 'owner',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Only community owners can manage subscriptions' });
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Create or get Stripe customer
    let customerId = community.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          communityId: community.id,
          userId: req.user.userId,
        },
      });
      customerId = customer.id;

      await prisma.community.update({
        where: { id: communityId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/community/${communityId}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/community/${communityId}/settings/billing?canceled=true`,
      metadata: {
        communityId,
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const { communityId } = req.body;

    // Verify user is community owner
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: req.user.userId,
        communityId,
        role: 'owner',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Only community owners can manage subscriptions' });
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || !community.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: community.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/community/${communityId}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/subscription/:communityId', authenticateToken, isCommunityOwner, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.communityId },
    });

    if (!community.stripeSubscriptionId) {
      return res.json({ 
        status: 'inactive',
        plan: 'basic',
        features: PLANS.basic.features,
      });
    }

    const subscription = await stripe.subscriptions.retrieve(community.stripeSubscriptionId);

    res.json({
      status: subscription.status,
      plan: community.subscriptionPlan,
      features: PLANS[community.subscriptionPlan].features,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { communityId } = req.body;

    // Verify user is community owner
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: req.user.userId,
        communityId,
        role: 'owner',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Only community owners can manage subscriptions' });
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    const subscription = await stripe.subscriptions.update(
      community.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await prisma.community.update({
      where: { id: communityId },
      data: {
        subscriptionStatus: 'cancelled',
        subscriptionExpiry: new Date(subscription.current_period_end * 1000),
      },
    });

    res.json({ 
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { communityId, plan } = session.metadata;

        // Update community subscription
        await prisma.community.update({
          where: { id: communityId },
          data: {
            stripeSubscriptionId: session.subscription,
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
            maxUsers: PLANS[plan].features.maxUsers,
            maxUnits: PLANS[plan].features.maxUnits,
            features: PLANS[plan].features,
          },
        });

        // Log the upgrade
        await prisma.auditLog.create({
          data: {
            communityId,
            userId: session.metadata.userId || 'system',
            action: 'subscription_upgraded',
            entityType: 'community',
            entityId: communityId,
            changes: { plan },
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const community = await prisma.community.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (community) {
          await prisma.community.update({
            where: { id: community.id },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionExpiry: subscription.cancel_at 
                ? new Date(subscription.cancel_at * 1000)
                : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const community = await prisma.community.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (community) {
          // Downgrade to basic plan
          await prisma.community.update({
            where: { id: community.id },
            data: {
              subscriptionPlan: 'basic',
              subscriptionStatus: 'cancelled',
              stripeSubscriptionId: null,
              maxUsers: PLANS.basic.features.maxUsers,
              maxUnits: PLANS.basic.features.maxUnits,
              features: PLANS.basic.features,
            },
          });

          // Log the downgrade
          await prisma.auditLog.create({
            data: {
              communityId: community.id,
              userId: 'system',
              action: 'subscription_cancelled',
              entityType: 'community',
              entityId: community.id,
              changes: { plan: 'basic' },
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const community = await prisma.community.findFirst({
          where: { stripeCustomerId: invoice.customer },
        });

        if (community) {
          await prisma.community.update({
            where: { id: community.id },
            data: {
              subscriptionStatus: 'payment_failed',
            },
          });

          // Send notification to community owner
          const owner = await prisma.communityMember.findFirst({
            where: {
              communityId: community.id,
              role: 'owner',
            },
          });

          if (owner) {
            await prisma.notification.create({
              data: {
                userId: owner.userId,
                type: 'system',
                title: 'Payment Failed',
                content: 'Your subscription payment failed. Please update your payment method.',
                data: { communityId: community.id },
              },
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get usage statistics
router.get('/usage/:communityId', authenticateToken, isCommunityOwner, async (req, res) => {
  try {
    const [userCount, unitCount, callCount] = await Promise.all([
      prisma.communityMember.count({
        where: { communityId: req.communityId, isActive: true },
      }),
      prisma.unit.count({
        where: { communityId: req.communityId },
      }),
      prisma.call.count({
        where: {
          communityId: req.communityId,
          createdAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
      }),
    ]);

    const community = await prisma.community.findUnique({
      where: { id: req.communityId },
    });

    const limits = PLANS[community.subscriptionPlan].features;

    res.json({
      usage: {
        users: userCount,
        units: unitCount,
        calls: callCount,
      },
      limits: {
        maxUsers: limits.maxUsers,
        maxUnits: limits.maxUnits,
        maxCalls: limits.maxCalls,
      },
      percentages: {
        users: limits.maxUsers === -1 ? 0 : (userCount / limits.maxUsers) * 100,
        units: limits.maxUnits === -1 ? 0 : (unitCount / limits.maxUnits) * 100,
        calls: limits.maxCalls === -1 ? 0 : (callCount / limits.maxCalls) * 100,
      },
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

module.exports = router;