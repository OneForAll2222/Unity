# Stripe Integration Setup Guide

## 🔑 Where to Add Your Stripe API Keys

### 1. Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign in to your Stripe account
3. Copy your **Publishable Key** (pk_live_51RZeN6CAk49oQkbWNxTpS5rLknUikwy4cZiYfDIuw9UI6BkbbDj5XnKGRNqseCKXPbXR6PB1Qjx9w4ilUt43zIxs00KP745F2v
### 2. Add Your Publishable Key
Open `constants/stripe.ts` and replace:
```typescript
publishableKey:pk_live_51RZeN6CAk49oQkbWNxTpS5rLknUikwy4cZiYfDIuw9UI6BkbbDj5XnKGRNqseCKXPbXR6PB1Qjx9w4ilUt43zIxs00KP745F2v ,
```

With your actual key:
```typescript
publishableKey: 'pk_test_51ABC123...',  // Your actual publishable key
```

### 3. Secret Key (Backend Only)
⚠️ **NEVER put your secret key in the mobile app!**

Your secret key (sk_live_...) should only be used on your backend server for:
- Creating payment intents
- Processing refunds
- Webhook handling

## 🏗️ Current Implementation Status

✅ **What's Ready:**
- Stripe SDK installed (`@stripe/stripe-react-native`)
- Stripe configuration file created
- Stripe payment button component
- Updated payments screen with both PayPal and Stripe options

⚠️ **What You Need to Complete:**

### 1. Backend Integration
You'll need a backend server to:
- Create payment intents using your secret key
- Handle webhooks for payment confirmations
- Process actual payments securely

### 2. Initialize Stripe in Your App
Add this to your main app layout (`app/_layout.tsx`):

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '@/constants/stripe';

// Wrap your app with StripeProvider
<StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
  {/* Your existing app content */}
</StripeProvider>
```

### 3. Implement Real Payment Processing
Currently, the Stripe button simulates payments. To process real payments:

1. Create a backend endpoint to create payment intents
2. Update `StripeButton.tsx` to use Stripe's `confirmPayment` method
3. Handle payment results and update your app state

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use test keys** during development
3. **Validate payments** on your backend using webhooks
4. **Store sensitive data** securely on your server

## 📱 Testing

1. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`

2. Any future expiry date and any 3-digit CVC will work for test cards

## 🚀 Next Steps

1. Add your publishable key to `constants/stripe.ts`
2. Set up a backend server for payment processing
3. Initialize StripeProvider in your app
4. Test with Stripe's test cards
5. Deploy with live keys for production

Your app now supports both PayPal and Stripe payments! 🎉