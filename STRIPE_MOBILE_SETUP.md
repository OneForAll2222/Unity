# Stripe Mobile Payment Setup Guide

## Current Implementation Status ✅

Your Stripe integration for mobile is now properly configured with the following components:

### Frontend Components
1. **StripeWrapper** (`/components/StripeWrapper.tsx`)
   - Safely wraps the app with StripeProvider on mobile
   - Handles web compatibility (disables on web)
   - Provides hooks for payment operations

2. **StripeButton** (`/components/StripeButton.tsx`)
   - Fully functional payment button for mobile
   - Creates payment intent via backend
   - Uses native Stripe Payment Sheet
   - Shows proper loading states and error handling
   - Displays "Mobile Only" message on web

### Backend Components
3. **Stripe API Routes** (`/backend/trpc/routes/stripe/`)
   - `createPaymentIntent` - Creates payment intents with proper amount handling
   - `confirmPayment` - Confirms payment status
   - Currently using mock responses for testing

## Setup Instructions

### Step 1: Install Stripe on Backend
```bash
npm install stripe
```

### Step 2: Set Environment Variables
Add to your `.env` file:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

### Step 3: Enable Stripe in Backend
Uncomment the Stripe code in `/backend/trpc/routes/stripe/create-payment-intent/route.ts`:

```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});
```

Then uncomment the actual Stripe API calls in the procedures.

### Step 4: Configure App Scheme (for return URLs)
In your `app.json`, add:
```json
{
  "expo": {
    "scheme": "your-app-scheme"
  }
}
```

Then update the `returnURL` in StripeButton.tsx:
```typescript
returnURL: 'your-app-scheme://stripe-redirect'
```

### Step 5: Configure Apple Pay (iOS)
1. Add merchant identifier to Apple Developer account
2. Update `merchantIdentifier` in StripeWrapper.tsx
3. Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "usesNonExemptEncryption": false
      },
      "entitlements": {
        "com.apple.developer.in-app-payments": ["merchant.com.yourapp"]
      }
    }
  }
}
```

### Step 6: Configure Google Pay (Android)
Already configured in the code with:
- merchantCountryCode: 'US'
- currencyCode: 'USD'
- testEnv: false (set to true for testing)

## How It Works

### Payment Flow
1. User taps "Pay with Card" button
2. App creates payment intent on backend with amount in cents
3. Backend returns client secret
4. App initializes Stripe Payment Sheet with client secret
5. User enters card details in native Stripe UI
6. Payment is processed securely
7. App confirms payment and updates user's premium status

### Key Features
- ✅ Native payment UI (Apple Pay, Google Pay, Card input)
- ✅ Secure payment processing
- ✅ Amount properly passed to Stripe (in cents)
- ✅ Web compatibility (shows "Mobile Only" message)
- ✅ Error handling and loading states
- ✅ Payment confirmation modal

## Testing

### Test Mode
To test payments without real charges:
1. Use Stripe test keys (pk_test_... and sk_test_...)
2. Set `testEnv: true` in Google Pay config
3. Use test card numbers:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - Requires auth: 4000 0025 0000 3155

### Production Mode
Currently configured with your live publishable key. To go fully live:
1. Add your secret key to environment variables
2. Enable Stripe code in backend
3. Test thoroughly before releasing

## Troubleshooting

### "Stripe not available" error
- Ensure @stripe/stripe-react-native is installed
- Check that you're testing on a real device or simulator (not web)
- Verify publishable key is correct

### Payment fails immediately
- Check backend is running and accessible
- Verify secret key is configured
- Check Stripe Dashboard for error logs

### Apple Pay not showing
- Verify merchant identifier is configured
- Check entitlements in app.json
- Ensure testing on real device with Apple Pay configured

## Security Notes
- ✅ Secret key is only on backend (never exposed to client)
- ✅ Publishable key is safe to expose in client code
- ✅ All payment processing happens through Stripe's secure servers
- ✅ No card details are stored in your app

## Support
For issues with Stripe integration:
1. Check Stripe Dashboard logs
2. Review error messages in console
3. Contact Stripe support for API issues