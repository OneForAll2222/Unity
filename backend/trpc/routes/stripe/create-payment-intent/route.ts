import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import Stripe from 'stripe';

// Validate Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  throw new Error('Invalid Stripe secret key format. Must start with sk_test_ or sk_live_');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export const createPaymentIntentProcedure = publicProcedure
  .input(
    z.object({
      amount: z.number().positive(), // Amount in cents
      currency: z.string().default('usd'),
      description: z.string().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        metadata: input.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  });

export const confirmPaymentProcedure = publicProcedure
  .input(
    z.object({
      paymentIntentId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        input.paymentIntentId
      );
      
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error('Failed to confirm payment');
    }
  });