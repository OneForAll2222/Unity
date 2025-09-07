import { APP_CONFIG } from './config';

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Your Stripe publishable key (safe to expose in client-side code)
  publishableKey: APP_CONFIG.STRIPE_PUBLISHABLE_KEY,
  
  // For server-side operations, you'll need your secret key
  // NEVER expose the secret key in client-side code!
  // This should be stored securely on your backend
  // secretKey: 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE' // DO NOT PUT THIS HERE!
};

// Merchant identifier for Apple Pay (if you plan to use it)
export const APPLE_PAY_MERCHANT_ID = 'merchant.your.app.identifier';

// Instructions:
// 1. Go to https://dashboard.stripe.com/apikeys
// 2. Copy your publishable key from Stripe Dashboard
// 3. Replace the publishableKey above with your actual key
// 4. You're now using live keys (pk_live_...)
// 5. Keep your secret key secure on your backend server only