# Stripe Backend Integration Example

This file shows you how to implement the backend endpoint that creates a Stripe payment intent with the amount parameter.

## Backend Implementation (Node.js/Express example)

```javascript
// backend/routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create payment intent endpoint
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body;
    
    // Validate amount parameter
    if (!amount || amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({ 
        error: 'Amount must be at least 50 cents' 
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // This is the amount parameter in cents
      currency: currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Environment Variables (.env file)

```
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
```

## Frontend Integration (React Native)

```typescript
// In your React Native app
const createPaymentIntent = async (item: PaymentItem) => {
  const amountInCents = Math.round(item.price * 100);
  
  const response = await fetch('https://your-backend.com/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInCents, // Required amount parameter
      currency: 'usd',
      metadata: {
        item_id: item.id,
        item_name: item.name,
        item_description: item.description
      }
    }),
  });

  const { client_secret } = await response.json();
  return client_secret;
};
```

## Key Points:

1. **Amount Parameter**: Always required when creating a payment intent
2. **Currency Units**: Stripe uses the smallest currency unit (cents for USD)
3. **Minimum Amount**: Stripe requires at least 50 cents ($0.50)
4. **Security**: Never expose your secret key in client-side code
5. **Metadata**: Use metadata to track purchase details

## Current Implementation Status:

Your current code correctly calculates the amount in cents and logs it. To complete the integration:

1. Set up a backend server with the above endpoint
2. Replace your Stripe publishable key in `constants/stripe.ts`
3. Update the frontend to call your backend endpoint
4. Use the returned client_secret to confirm the payment with Stripe's SDK

The amount parameter is now properly included in your payment processing logic!