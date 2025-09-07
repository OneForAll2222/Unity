import React, { ReactNode, createContext, useContext } from 'react';
import { Platform } from 'react-native';

// Web-safe Stripe wrapper - no imports on web
let StripeProvider: any = null;
let stripeHooks: any = null;
let stripeModule: any = null;

// Only import Stripe on native platforms
if (Platform.OS !== 'web') {
  try {
    // Use eval to prevent Metro from trying to resolve this on web
    const stripePath = '@stripe/stripe-react-native';
    const stripe = eval('require')(stripePath);
    StripeProvider = stripe.StripeProvider;
    stripeModule = stripe;
    stripeHooks = {
      useConfirmPayment: stripe.useConfirmPayment,
      useStripe: stripe.useStripe,
      usePaymentSheet: stripe.usePaymentSheet,
    };
  } catch (error) {
    console.warn('Stripe not available:', error);
  }
}

interface StripeWrapperProps {
  children: ReactNode;
  publishableKey?: string;
}

export function StripeWrapper({ children, publishableKey }: StripeWrapperProps) {
  const isAvailable = Platform.OS !== 'web' && !!StripeProvider && !!publishableKey;
  
  // Only wrap with StripeProvider on native platforms
  if (isAvailable && StripeProvider) {
    return (
      <StripeContext.Provider value={{ isAvailable: true }}>
        <StripeProvider 
          publishableKey={publishableKey}
          merchantIdentifier="merchant.com.1forall" // Update this with your merchant ID
        >
          {children}
        </StripeProvider>
      </StripeContext.Provider>
    );
  }
  
  // On web or when Stripe is not available, just return children
  return (
    <StripeContext.Provider value={{ isAvailable: false }}>
      {children}
    </StripeContext.Provider>
  );
}

// Create a context for Stripe availability
const StripeContext = createContext<{ isAvailable: boolean }>({
  isAvailable: false,
});

// Export a hook that safely uses Stripe functions
export function useStripePayment() {
  const context = useContext(StripeContext);
  
  if (Platform.OS === 'web') {
    return {
      confirmPayment: async () => ({ error: { message: 'Stripe not available on web' } }),
      initPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
      presentPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
      isStripeAvailable: false,
    };
  }
  
  if (stripeHooks && stripeModule) {
    // Use the actual hooks if available
    try {
      const { confirmPayment } = stripeHooks.useConfirmPayment();
      const { initPaymentSheet, presentPaymentSheet } = stripeHooks.usePaymentSheet();
      
      return {
        confirmPayment,
        initPaymentSheet,
        presentPaymentSheet,
        isStripeAvailable: true,
      };
    } catch {
      // Fallback if hooks fail
      return {
        confirmPayment: async () => ({ error: { message: 'Stripe hooks not initialized' } }),
        initPaymentSheet: async () => ({ error: { message: 'Stripe hooks not initialized' } }),
        presentPaymentSheet: async () => ({ error: { message: 'Stripe hooks not initialized' } }),
        isStripeAvailable: false,
      };
    }
  }
  
  return {
    confirmPayment: async () => ({ error: { message: 'Stripe not available' } }),
    initPaymentSheet: async () => ({ error: { message: 'Stripe not available' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe not available' } }),
    isStripeAvailable: false,
  };
}