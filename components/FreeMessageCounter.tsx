import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Crown } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';
import { PRIMARY_BUTTON_GRADIENT, COLORS } from '@/constants/colors';

interface FreeMessageCounterProps {
  style?: any;
}

export function FreeMessageCounter({ style }: FreeMessageCounterProps) {
  const { isPremium, freeMessagesRemaining, syncFreeMessagesWithStorage } = useUser();
  
  // Sync with storage when component mounts, especially important for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Small delay to ensure storage is ready
      const timer = setTimeout(() => {
        syncFreeMessagesWithStorage();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [syncFreeMessagesWithStorage]);

  if (isPremium) {
    return (
      <LinearGradient
        colors={PRIMARY_BUTTON_GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        <Crown size={16} color={COLORS.TEXT_ON_GOLD} />
        <Text style={styles.premiumText}>Premium</Text>
      </LinearGradient>
    );
  }

  const getCounterColor = (): [string, string] => {
    return [COLORS.RICH_GOLD, COLORS.DARK_GOLD];
  };

  return (
    <LinearGradient
      colors={getCounterColor()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <MessageCircle size={16} color={COLORS.TEXT_ON_GOLD} />
      <Text style={styles.counterText}>
        {freeMessagesRemaining} free message{freeMessagesRemaining !== 1 ? 's' : ''} left
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_ON_GOLD,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_ON_GOLD,
  },
});