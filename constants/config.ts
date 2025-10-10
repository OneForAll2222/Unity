// App Configuration
export const APP_CONFIG = {
  // API Base URL - fallback to default if not set
  API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rork.com',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_ACTUAL_TEST_PUBLISHABLE_KEY_HERE',
  
  
  // Development settings
  DEVELOPMENT: {
    // Set to true to enable unlimited access for testing
    UNLIMITED_ACCESS: __DEV__ || process.env.NODE_ENV === 'development',
    // Set to true to bypass payment gates
    BYPASS_PAYMENTS: __DEV__ || process.env.NODE_ENV === 'development',
  },
  
  // Feature flags
  FEATURES: {
    STRIPE_ENABLED: true,

    TRPC_ENABLED: true,
  },
};

// Validate configuration
export function validateConfig() {
  const warnings: string[] = [];
  
  if (APP_CONFIG.STRIPE_PUBLISHABLE_KEY.includes('your-stripe')) {
    warnings.push('Stripe publishable key not configured');
  }
  
  
  if (warnings.length > 0) {
    console.warn('Configuration warnings:', warnings);
  }
  
  return warnings.length === 0;
}