import express, { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../../env';
export const stripeRouter = Router();
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;
stripeRouter.post('/create-portal', async (_req, res) => {
    if (!stripe)
        return res.status(501).json({ error: 'Stripe not configured' });
    // Placeholder: Implement creating a billing portal session
    return res.json({ url: 'https://billing.stripe.com/session/test_placeholder' });
});
stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    if (!env.STRIPE_WEBHOOK_SECRET || !stripe)
        return res.status(501).send('Stripe not configured');
    const sig = req.headers['stripe-signature'];
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
        // TODO: handle event types and update subscription records
        // eslint-disable-next-line no-console
        console.log('Stripe event', event.type);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.json({ received: true });
});
