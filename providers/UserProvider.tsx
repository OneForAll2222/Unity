import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const [UserContextProvider, useUserContext] = createContextHook<UserContextType>(() => {
  const [username, setUsernameState] = useState<string>('User');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState<number>(5);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log(`Loading user data on ${Platform.OS}...`);
      
      // Load data sequentially on Android to avoid potential race conditions
      let storedUsername, storedPremium, storedPurchases, storedFreeMessages;
      
      if (Platform.OS === 'android') {
        // Sequential loading for Android
        storedUsername = await AsyncStorage.getItem('username');
        storedPremium = await AsyncStorage.getItem('isPremium');
        storedPurchases = await AsyncStorage.getItem('purchasedItems');
        storedFreeMessages = await AsyncStorage.getItem('freeMessagesRemaining');
      } else {
        // Parallel loading for other platforms
        [storedUsername, storedPremium, storedPurchases, storedFreeMessages] = await Promise.all([
          AsyncStorage.getItem('username'),
          AsyncStorage.getItem('isPremium'),
          AsyncStorage.getItem('purchasedItems'),
          AsyncStorage.getItem('freeMessagesRemaining')
        ]);
      }
      
      console.log('Stored data:', {
        username: storedUsername,
        premium: storedPremium,
        purchases: storedPurchases,
        freeMessages: storedFreeMessages,
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

  const useFreeMessage = useCallback(async (): Promise<boolean> => {
    console.log(`useFreeMessage called on ${Platform.OS} - isPremium:`, isPremium, 'freeMessagesRemaining:', freeMessagesRemaining);
    
    if (isPremium) {
      console.log('User is premium, allowing message');
      return true; // Premium users have unlimited messages
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
  }, [isPremium, freeMessagesRemaining]);

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
        'freeMessagesRemaining'
      ]);
      
      // Reset to default values
      setUsernameState('User');
      setIsPremiumState(false);
      setPurchasedItems([]);
      setFreeMessagesRemaining(5);
      
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
  }), [username, setUsername, isLoading, isPremium, setIsPremium, purchasedItems, addPurchasedItem, freeMessagesRemaining, useFreeMessage, resetFreeMessages, syncFreeMessagesWithStorage, clearAllData]);
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <UserContextProvider>{children}</UserContextProvider>;
};

export const useUser = () => useUserContext();