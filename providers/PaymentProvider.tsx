import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { useUser } from './UserProvider';
import { trpcClient } from '@/lib/trpc';

export interface PaymentItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface PaymentContextType {
  isProcessing: boolean;
  processPayment: (item: PaymentItem) => Promise<boolean>;
  paymentHistory: PaymentItem[];
  addToHistory: (item: PaymentItem) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentItem[]>([]);
  const { addPurchasedItem } = useUser();

  const addToHistory = useCallback((item: PaymentItem) => {
    setPaymentHistory(prev => [item, ...prev]);
  }, []);

  const processPayment = useCallback(async (item: PaymentItem): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      console.log('Creating PayPal payment for:', {
        amount: item.price,
        currency: 'USD',
        item: item.name
      });
      
      // Check if tRPC client is available
      if (!trpcClient) {
        console.warn('tRPC client not available, simulating payment');
        // Simulate payment for development
        await new Promise(resolve => setTimeout(resolve, 2000));
        addToHistory(item);
        addPurchasedItem(item.id);
        return true;
      }
      
      // Call your backend to create PayPal payment
      const paymentResult = await trpcClient.paypal.createPayment.mutate({
        amount: item.price.toFixed(2),
        currency: 'USD',
        description: item.description || item.name,
        item_id: item.id,
        item_name: item.name
      });
      
      if (!paymentResult || !paymentResult.payment_id) {
        throw new Error('Invalid payment response');
      }
      
      const { payment_id } = paymentResult;
      
      // In a real app, you would redirect to approval_url or open PayPal SDK
      // For now, simulate successful payment after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify payment completion
      const verificationResult = await trpcClient.paypal.verifyPayment.mutate({ payment_id });
      
      if (!verificationResult || !verificationResult.verified) {
        throw new Error('Payment verification failed');
      }
      
      console.log('PayPal payment processed successfully for $' + item.price);
      
      // Add to payment history and user purchases
      addToHistory(item);
      addPurchasedItem(item.id);
      
      return true;
    } catch (error) {
      console.error('PayPal payment failed:', error);
      
      // For development, still allow the purchase to go through
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: allowing payment to proceed');
        addToHistory(item);
        addPurchasedItem(item.id);
        return true;
      }
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [addToHistory, addPurchasedItem]);

  const value = useMemo(() => ({
    isProcessing,
    processPayment,
    paymentHistory,
    addToHistory
  }), [isProcessing, paymentHistory, processPayment, addToHistory]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}