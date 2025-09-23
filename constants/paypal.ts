// PayPal Configuration
// You need to get these from your PayPal Developer Dashboard

export const PAYPAL_CONFIG = {
  // Get these from https://developer.paypal.com/developer/applications/
  CLIENT_ID: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret',
  
  // Use sandbox for testing, live for production
  // Set EXPO_PUBLIC_PAYPAL_MODE=live to force live mode
  MODE: process.env.EXPO_PUBLIC_PAYPAL_MODE || 'live', // Default to live for production
  
  // PayPal API URLs
  SANDBOX_URL: 'https://api.sandbox.paypal.com',
  LIVE_URL: 'https://api.paypal.com',
};

export const getPayPalApiUrl = () => {
  return PAYPAL_CONFIG.MODE === 'sandbox' 
    ? PAYPAL_CONFIG.SANDBOX_URL 
    : PAYPAL_CONFIG.LIVE_URL;
};

// PayPal payment items configuration
export const PAYPAL_ITEMS = {
  WEEKLY_PRO: {
    id: 'weekly-pro',
    name: 'Weekly Pro',
    price: 7.99,
    description: 'Weekly Pro subscription with all premium features'
  },
  YEARLY_PRO: {
    id: 'yearly-pro', 
    name: 'Yearly Pro',
    price: 39.99,
    description: 'Yearly Pro subscription - Best Value (Save 80%)'
  },
  SPECIALIST_CHAT: {
    id: 'specialist-chat',
    name: 'Specialist Chat Session',
    price: 29.99,
    description: 'One-on-one chat session with a specialist'
  }
};

// Stripe Price IDs for production
export const STRIPE_PRICE_IDS = {
  WEEKLY_PRO: 'price_1SAVRi2E9Vjhwnrc8x87h85p', // $7.99/week
  YEARLY_PRO: 'price_1SAVT22E9VjhwnrcvSLU9sbS', // $39.99/year
};

// Stripe Product IDs
export const STRIPE_PRODUCT_IDS = {
  WEEKLY_PRO: 'prod_T6itP0PKz9L2d6',
  YEARLY_PRO: 'prod_T6iu0cykdrdiuG',
};