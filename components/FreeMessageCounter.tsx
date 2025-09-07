import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Crown } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

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
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        <Crown size={16} color="#fff" />
        <Text style={styles.premiumText}>Premium</Text>
      </LinearGradient>
    );
  }

  const getCounterColor = (): [string, string] => {
    if (freeMessagesRemaining <= 1) return ['#EF4444', '#DC2626'];
    if (freeMessagesRemaining <= 2) return ['#F59E0B', '#D97706'];
    return ['#3B82F6', '#2563EB'];
  };

  return (
    <LinearGradient
      colors={getCounterColor()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <MessageCircle size={16} color="#fff" />
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
    color: '#fff',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});