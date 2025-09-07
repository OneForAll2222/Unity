// App Configuration
export const APP_CONFIG = {
  // API Base URL - fallback to default if not set
  API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rork.com',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RZeN6CAk49oQkbWNxTpS5rLknUikwy4cZiYfDIuw9UI6BkbbDj5XnKGRNqseCKXPbXR6PB1Qjx9w4ilUt43zIxs00KP745F2v',
  
  // PayPal Configuration
  PAYPAL_CLIENT_ID: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your-paypal-client-id-here',
  
  // Feature flags
  FEATURES: {
    STRIPE_ENABLED: true,
    PAYPAL_ENABLED: true,
    TRPC_ENABLED: true,
  },
};

// Validate configuration
export function validateConfig() {
  const warnings: string[] = [];
  
  if (APP_CONFIG.STRIPE_PUBLISHABLE_KEY.includes('your-stripe')) {
    warnings.push('Stripe publishable key not configured');
  }
  
  if (APP_CONFIG.FEATURES.PAYPAL_ENABLED && (APP_CONFIG.PAYPAL_CLIENT_ID.includes('your-paypal') || !APP_CONFIG.PAYPAL_CLIENT_ID)) {
    warnings.push('PayPal client ID not configured');
  }
  
  if (warnings.length > 0) {
    console.warn('Configuration warnings:', warnings);
  }
  
  return warnings.length === 0;
}