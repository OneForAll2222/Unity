// PayPal Configuration
// You need to get these from your PayPal Developer Dashboard

export const PAYPAL_CONFIG = {
  // Get these from https://developer.paypal.com/developer/applications/
  CLIENT_ID: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret',
  
  // Use sandbox for testing, live for production
  // Set EXPO_PUBLIC_PAYPAL_MODE=live to force live mode
  MODE: process.env.EXPO_PUBLIC_PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'),
  
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
  PREMIUM_ACCESS: {
    id: 'premium-access',
    name: 'Premium Access',
    price: 9.99,
    description: 'Unlock all premium features and content'
  },
  SPECIALIST_CHAT: {
    id: 'specialist-chat',
    name: 'Specialist Chat Session',
    price: 29.99,
    description: 'One-on-one chat session with a specialist'
  },
  LEARNING_COURSE: {
    id: 'learning-course',
    name: 'Learning Course Access',
    price: 19.99,
    description: 'Access to premium learning courses'
  }
};