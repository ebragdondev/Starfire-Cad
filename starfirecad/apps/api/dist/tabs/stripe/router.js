import express, { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../../env';
import { prisma } from '../../lib/prisma';
export const stripeRouter = Router();
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;
stripeRouter.post('/create-checkout', express.json(), async (req, res) => {
    if (!stripe)
        return res.status(501).json({ error: 'Stripe not configured' });
    const { communityId, priceId, successUrl, cancelUrl } = req.body;
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community)
        return res.status(404).json({ error: 'Community not found' });
    let customerId;
    const sub = await prisma.communitySubscription.findUnique({ where: { communityId } });
    if (sub?.stripeCustomerId)
        customerId = sub.stripeCustomerId;
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { communityId }
    });
    return res.json({ url: session.url });
});
stripeRouter.post('/create-portal', express.json(), async (req, res) => {
    if (!stripe)
        return res.status(501).json({ error: 'Stripe not configured' });
    const { communityId, returnUrl } = req.body;
    const sub = await prisma.communitySubscription.findUnique({ where: { communityId } });
    if (!sub?.stripeCustomerId)
        return res.status(400).json({ error: 'No customer for community' });
    const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: returnUrl
    });
    return res.json({ url: session.url });
});
stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!env.STRIPE_WEBHOOK_SECRET || !stripe)
        return res.status(501).send('Stripe not configured');
    const sig = req.headers['stripe-signature'];
    if (!sig)
        return res.status(400).send('Missing signature');
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const communityId = session.metadata?.communityId;
                if (!communityId)
                    break;
                const customerId = session.customer;
                await prisma.communitySubscription.upsert({
                    where: { communityId },
                    create: { communityId, plan: 'custom', status: 'active', stripeCustomerId: customerId, stripeSubscriptionId: session.subscription },
                    update: { status: 'active', stripeCustomerId: customerId, stripeSubscriptionId: session.subscription }
                });
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                const customerId = sub.customer;
                await prisma.communitySubscription.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: { status: 'canceled' }
                });
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                await prisma.communitySubscription.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: { status: sub.status }
                });
                break;
            }
            default:
                break;
        }
    }
    catch (e) {
        return res.status(500).send('Webhook handling error');
    }
    res.json({ received: true });
});
