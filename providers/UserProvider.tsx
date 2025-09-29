import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';

interface UserContextType {
  username: string;
  setUsername: (name: string) => Promise<void>;
  isLoading: boolean;
  isPremium: boolean;
  setIsPremium: (premium: boolean) => Promise<void>;
  purchasedItems: string[];
  addPurchasedItem: (itemId: string) => Promise<void>;
  freeMessagesRemaining: number;
  useFreeMessage: () => Promise<boolean>;
  resetFreeMessages: () => Promise<void>;
  syncFreeMessagesWithStorage: () => Promise<void>;
  clearAllData: () => Promise<void>;
  // Trial and subscription management
  isTrialActive: boolean;
  trialExpiresAt: Date | null;
  subscriptionType: 'none' | 'weekly' | 'yearly';
  subscriptionExpiresAt: Date | null;
  startFreeTrial: (planType: 'weekly' | 'yearly') => Promise<void>;
  activateSubscription: (planType: 'weekly' | 'yearly') => Promise<void>;
  hasUnlimitedAccess: () => boolean;
  canUploadPDF: () => boolean;
  canGenerateImages: () => boolean;
  canAccessMusicStudio: () => boolean;
  getRemainingTrialDays: () => number;
}

const [UserContextProvider, useUserContext] = createContextHook<UserContextType>(() => {
  const [username, setUsernameState] = useState<string>('User');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState<number>(5);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'none' | 'weekly' | 'yearly'>('none');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log(`Loading user data on ${Platform.OS}...`);
      
      // Load data sequentially on Android to avoid potential race conditions
      let storedUsername, storedPremium, storedPurchases, storedFreeMessages;
      let storedTrialActive, storedTrialExpires, storedSubType, storedSubExpires;
      
      if (Platform.OS === 'android') {
        // Sequential loading for Android
        storedUsername = await AsyncStorage.getItem('username');
        storedPremium = await AsyncStorage.getItem('isPremium');
        storedPurchases = await AsyncStorage.getItem('purchasedItems');
        storedFreeMessages = await AsyncStorage.getItem('freeMessagesRemaining');
        storedTrialActive = await AsyncStorage.getItem('isTrialActive');
        storedTrialExpires = await AsyncStorage.getItem('trialExpiresAt');
        storedSubType = await AsyncStorage.getItem('subscriptionType');
        storedSubExpires = await AsyncStorage.getItem('subscriptionExpiresAt');
      } else {
        // Parallel loading for other platforms
        [storedUsername, storedPremium, storedPurchases, storedFreeMessages, 
         storedTrialActive, storedTrialExpires, storedSubType, storedSubExpires] = await Promise.all([
          AsyncStorage.getItem('username'),
          AsyncStorage.getItem('isPremium'),
          AsyncStorage.getItem('purchasedItems'),
          AsyncStorage.getItem('freeMessagesRemaining'),
          AsyncStorage.getItem('isTrialActive'),
          AsyncStorage.getItem('trialExpiresAt'),
          AsyncStorage.getItem('subscriptionType'),
          AsyncStorage.getItem('subscriptionExpiresAt')
        ]);
      }
      
      console.log('Stored data:', {
        username: storedUsername,
        premium: storedPremium,
        purchases: storedPurchases,
        freeMessages: storedFreeMessages,
        trialActive: storedTrialActive,
        platform: Platform.OS
      });
      
      if (storedUsername) {
        setUsernameState(storedUsername);
      }
      
      if (storedPremium) {
        try {
          setIsPremiumState(JSON.parse(storedPremium));
        } catch (parseError) {
          console.error('Error parsing premium status:', parseError);
          setIsPremiumState(false);
        }
      }
      
      if (storedPurchases) {
        try {
          setPurchasedItems(JSON.parse(storedPurchases));
        } catch (parseError) {
          console.error('Error parsing purchased items:', parseError);
          setPurchasedItems([]);
        }
      }
      
      // Handle free messages initialization with extra validation
      if (storedFreeMessages !== null && storedFreeMessages !== undefined && storedFreeMessages !== '') {
        const parsedMessages = parseInt(storedFreeMessages, 10);
        console.log('Parsed free messages:', parsedMessages, 'from string:', storedFreeMessages);
        if (!isNaN(parsedMessages) && parsedMessages >= 0 && parsedMessages <= 100) {
          setFreeMessagesRemaining(parsedMessages);
          console.log('Set free messages to:', parsedMessages);
        } else {
          console.log('Invalid stored free messages, setting to 5');
          setFreeMessagesRemaining(5);
          await AsyncStorage.setItem('freeMessagesRemaining', '5');
        }
      } else {
        console.log('No stored free messages found, initializing to 5');
        setFreeMessagesRemaining(5);
        await AsyncStorage.setItem('freeMessagesRemaining', '5');
      }
      
      // Load trial and subscription data
      if (storedTrialActive) {
        try {
          setIsTrialActive(JSON.parse(storedTrialActive));
        } catch (error) {
          console.error('Error parsing trial active status:', error);
        }
      }
      
      if (storedTrialExpires) {
        try {
          const expiryDate = new Date(storedTrialExpires);
          if (!isNaN(expiryDate.getTime())) {
            setTrialExpiresAt(expiryDate);
            // Check if trial has expired
            if (expiryDate < new Date()) {
              setIsTrialActive(false);
              await AsyncStorage.setItem('isTrialActive', 'false');
            }
          }
        } catch (error) {
          console.error('Error parsing trial expiry date:', error);
        }
      }
      
      if (storedSubType && ['weekly', 'yearly'].includes(storedSubType)) {
        setSubscriptionType(storedSubType as 'weekly' | 'yearly');
      }
      
      if (storedSubExpires) {
        try {
          const expiryDate = new Date(storedSubExpires);
          if (!isNaN(expiryDate.getTime())) {
            setSubscriptionExpiresAt(expiryDate);
            // Check if subscription has expired
            if (expiryDate < new Date()) {
              setSubscriptionType('none');
              await AsyncStorage.setItem('subscriptionType', 'none');
            }
          }
        } catch (error) {
          console.error('Error parsing subscription expiry date:', error);
        }
      }
      
      // Additional Android-specific validation
      if (Platform.OS === 'android') {
        // Wait a bit and re-verify the value was properly stored
        setTimeout(async () => {
          try {
            const reVerifyValue = await AsyncStorage.getItem('freeMessagesRemaining');
            console.log('Android: Re-verification after initialization:', reVerifyValue);
            if (reVerifyValue) {
              const reVerifyParsed = parseInt(reVerifyValue, 10);
              if (!isNaN(reVerifyParsed) && reVerifyParsed !== freeMessagesRemaining) {
                console.log('Android: Syncing state with re-verified storage value:', reVerifyParsed);
                setFreeMessagesRemaining(reVerifyParsed);
              }
            }
          } catch (error) {
            console.error('Android: Error in re-verification:', error);
          }
        }, 100);
      }
      
      // Double-check the value was set correctly
      const verifyValue = await AsyncStorage.getItem('freeMessagesRemaining');
      console.log('Verification - stored value after initialization:', verifyValue);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to default values on error
      setFreeMessagesRemaining(5);
      try {
        await AsyncStorage.setItem('freeMessagesRemaining', '5');
        console.log('Set fallback free messages to 5');
      } catch (storageError) {
        console.error('Error setting fallback free messages:', storageError);
      }
    } finally {
      setIsLoading(false);
      console.log('User data loading completed');
    }
  };

  const setUsername = useCallback(async (name: string) => {
    try {
      setUsernameState(name);
      await AsyncStorage.setItem('username', name);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  }, []);

  const setIsPremium = useCallback(async (premium: boolean) => {
    try {
      setIsPremiumState(premium);
      await AsyncStorage.setItem('isPremium', JSON.stringify(premium));
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  }, []);

  const hasUnlimitedAccess = useCallback((): boolean => {
    // Development mode: unlimited access for testing
    if (APP_CONFIG.DEVELOPMENT.UNLIMITED_ACCESS) {
      console.log('Development mode: granting unlimited access');
      return true;
    }
    
    // Check if user has premium, active trial, or active subscription
    if (isPremium) return true;
    if (isTrialActive && trialExpiresAt && trialExpiresAt > new Date()) return true;
    if (subscriptionType !== 'none' && subscriptionExpiresAt && subscriptionExpiresAt > new Date()) return true;
    return false;
  }, [isPremium, isTrialActive, trialExpiresAt, subscriptionType, subscriptionExpiresAt]);
  
  const canUploadPDF = useCallback((): boolean => {
    return hasUnlimitedAccess();
  }, [hasUnlimitedAccess]);
  
  const canGenerateImages = useCallback((): boolean => {
    return hasUnlimitedAccess();
  }, [hasUnlimitedAccess]);
  
  const canAccessMusicStudio = useCallback((): boolean => {
    return hasUnlimitedAccess();
  }, [hasUnlimitedAccess]);
  
  const getRemainingTrialDays = useCallback((): number => {
    if (!isTrialActive || !trialExpiresAt) return 0;
    const now = new Date();
    const diffTime = trialExpiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [isTrialActive, trialExpiresAt]);
  
  const startFreeTrial = useCallback(async (planType: 'weekly' | 'yearly') => {
    try {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days trial
      
      setIsTrialActive(true);
      setTrialExpiresAt(expiryDate);
      
      await AsyncStorage.multiSet([
        ['isTrialActive', 'true'],
        ['trialExpiresAt', expiryDate.toISOString()]
      ]);
      
      console.log('Free trial started:', { planType, expiryDate });
    } catch (error) {
      console.error('Error starting free trial:', error);
    }
  }, []);
  
  const activateSubscription = useCallback(async (planType: 'weekly' | 'yearly') => {
    try {
      const now = new Date();
      const duration = planType === 'weekly' ? 7 : 365; // days
      const expiryDate = new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000));
      
      // End trial if active
      setIsTrialActive(false);
      setTrialExpiresAt(null);
      
      // Activate subscription
      setSubscriptionType(planType);
      setSubscriptionExpiresAt(expiryDate);
      
      await AsyncStorage.multiSet([
        ['isTrialActive', 'false'],
        ['trialExpiresAt', ''],
        ['subscriptionType', planType],
        ['subscriptionExpiresAt', expiryDate.toISOString()]
      ]);
      
      console.log('Subscription activated:', { planType, expiryDate });
    } catch (error) {
      console.error('Error activating subscription:', error);
    }
  }, []);

  const useFreeMessage = useCallback(async (): Promise<boolean> => {
    console.log(`useFreeMessage called on ${Platform.OS} - isPremium:`, isPremium, 'freeMessagesRemaining:', freeMessagesRemaining);
    
    // Development mode: always allow messages
    if (APP_CONFIG.DEVELOPMENT.UNLIMITED_ACCESS) {
      console.log('Development mode: allowing unlimited messages');
      return true;
    }
    
    if (hasUnlimitedAccess()) {
      console.log('User has unlimited access, allowing message');
      return true;
    }
    
    // Double-check current state from storage for Android reliability
    if (Platform.OS === 'android') {
      try {
        const currentStoredValue = await AsyncStorage.getItem('freeMessagesRemaining');
        const currentCount = currentStoredValue ? parseInt(currentStoredValue, 10) : 5;
        console.log('Android: Current stored free messages:', currentCount);
        
        if (currentCount !== freeMessagesRemaining) {
          console.log('Android: State mismatch detected, syncing state with storage');
          setFreeMessagesRemaining(currentCount);
        }
        
        if (currentCount <= 0) {
          console.log('Android: No free messages remaining in storage');
          return false;
        }
        
        const newCount = currentCount - 1;
        console.log('Android: Using free message, new count:', newCount);
        
        // Update storage first on Android
        await AsyncStorage.setItem('freeMessagesRemaining', newCount.toString());
        
        // Verify the save worked
        const verifyValue = await AsyncStorage.getItem('freeMessagesRemaining');
        console.log('Android: Verification - value in storage after save:', verifyValue);
        
        if (verifyValue === newCount.toString()) {
          setFreeMessagesRemaining(newCount);
          console.log('Android: Successfully updated free message count');
          return true;
        } else {
          console.error('Android: Storage verification failed! Expected:', newCount, 'Got:', verifyValue);
          return false;
        }
        
      } catch (error) {
        console.error('Android: Error in useFreeMessage:', error);
        return false;
      }
    }
    
    // Original logic for other platforms
    if (freeMessagesRemaining > 0) {
      const newCount = freeMessagesRemaining - 1;
      console.log('Using free message, new count:', newCount);
      
      // Update state first
      setFreeMessagesRemaining(newCount);
      
      try {
        await AsyncStorage.setItem('freeMessagesRemaining', newCount.toString());
        console.log('Successfully saved new free message count to storage:', newCount);
        
        // Verify the save worked
        const verifyValue = await AsyncStorage.getItem('freeMessagesRemaining');
        console.log('Verification - value in storage after save:', verifyValue);
        
        if (verifyValue !== newCount.toString()) {
          console.error('Storage verification failed! Expected:', newCount, 'Got:', verifyValue);
          // Revert state if storage failed
          setFreeMessagesRemaining(freeMessagesRemaining);
          return false;
        }
        
      } catch (error) {
        console.error('Error saving free messages count:', error);
        // Revert the state change if storage fails
        setFreeMessagesRemaining(freeMessagesRemaining);
        return false;
      }
      return true;
    }
    
    console.log('No free messages remaining');
    return false; // No free messages remaining
  }, [hasUnlimitedAccess, freeMessagesRemaining]);

  const resetFreeMessages = useCallback(async () => {
    console.log('Resetting free messages to 5');
    setFreeMessagesRemaining(5);
    try {
      await AsyncStorage.setItem('freeMessagesRemaining', '5');
      console.log('Successfully reset free messages in storage');
    } catch (error) {
      console.error('Error resetting free messages:', error);
    }
  }, []);

  const syncFreeMessagesWithStorage = useCallback(async () => {
    try {
      const storedValue = await AsyncStorage.getItem('freeMessagesRemaining');
      if (storedValue !== null) {
        const storedCount = parseInt(storedValue, 10);
        if (!isNaN(storedCount) && storedCount !== freeMessagesRemaining) {
          console.log('Syncing free messages with storage:', storedCount);
          setFreeMessagesRemaining(storedCount);
        }
      }
    } catch (error) {
      console.error('Error syncing free messages with storage:', error);
    }
  }, [freeMessagesRemaining]);

  const clearAllData = useCallback(async () => {
    console.log('Clearing all user data');
    try {
      await AsyncStorage.multiRemove([
        'username',
        'isPremium', 
        'purchasedItems',
        'freeMessagesRemaining',
        'isTrialActive',
        'trialExpiresAt',
        'subscriptionType',
        'subscriptionExpiresAt'
      ]);
      
      // Reset to default values
      setUsernameState('User');
      setIsPremiumState(false);
      setPurchasedItems([]);
      setFreeMessagesRemaining(5);
      setIsTrialActive(false);
      setTrialExpiresAt(null);
      setSubscriptionType('none');
      setSubscriptionExpiresAt(null);
      
      // Re-initialize with defaults
      await AsyncStorage.setItem('freeMessagesRemaining', '5');
      
      console.log('Successfully cleared all data and reset to defaults');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }, []);

  const addPurchasedItem = useCallback(async (itemId: string) => {
    try {
      const newPurchases = [...purchasedItems, itemId];
      setPurchasedItems(newPurchases);
      await AsyncStorage.setItem('purchasedItems', JSON.stringify(newPurchases));
      
      // If they bought premium plan, set premium status
      if (itemId === 'premium-plan') {
        await setIsPremium(true);
      }
    } catch (error) {
      console.error('Error saving purchased item:', error);
    }
  }, [purchasedItems, setIsPremium]);

  return useMemo(() => ({
    username,
    setUsername,
    isLoading,
    isPremium,
    setIsPremium,
    purchasedItems,
    addPurchasedItem,
    freeMessagesRemaining,
    useFreeMessage,
    resetFreeMessages,
    syncFreeMessagesWithStorage,
    clearAllData,
    isTrialActive,
    trialExpiresAt,
    subscriptionType,
    subscriptionExpiresAt,
    startFreeTrial,
    activateSubscription,
    hasUnlimitedAccess,
    canUploadPDF,
    canGenerateImages,
    canAccessMusicStudio,
    getRemainingTrialDays,
  }), [username, setUsername, isLoading, isPremium, setIsPremium, purchasedItems, addPurchasedItem, freeMessagesRemaining, useFreeMessage, resetFreeMessages, syncFreeMessagesWithStorage, clearAllData, isTrialActive, trialExpiresAt, subscriptionType, subscriptionExpiresAt, startFreeTrial, activateSubscription, hasUnlimitedAccess, canUploadPDF, canGenerateImages, canAccessMusicStudio, getRemainingTrialDays]);
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <UserContextProvider>{children}</UserContextProvider>;
};

export const useUser = () => useUserContext();