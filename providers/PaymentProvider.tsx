import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { useUser } from './UserProvider';

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
      console.log('Processing payment for:', {
        amount: item.price,
        currency: 'USD',
        item: item.name
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Payment processed successfully for $' + item.price);
      
      addToHistory(item);
      addPurchasedItem(item.id);
      
      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      
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
