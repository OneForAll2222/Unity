import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Crown, X, CreditCard } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/providers/UserProvider';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  requiredItem?: string;
  isNoFreeMessages?: boolean;
}

export function PremiumGate({ visible, onClose, feature, requiredItem, isNoFreeMessages = false }: PremiumGateProps) {
  const { isPremium, purchasedItems } = useUser();

  const hasAccess = () => {
    if (isPremium) return true;
    if (requiredItem && purchasedItems.includes(requiredItem)) return true;
    return false;
  };

  const handleUpgrade = () => {
    onClose();
    router.push('/payments');
  };

  if (hasAccess()) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#7C3AED', '#2563EB', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Lock size={48} color="#fff" />
            </View>

            <Text style={styles.title}>
              {isNoFreeMessages ? "Free Messages Used" : "Premium Feature"}
            </Text>
            <Text style={styles.subtitle}>
              {isNoFreeMessages 
                ? `You've used all 5 free messages. Upgrade to premium for unlimited AI conversations and access to all specialists.`
                : `${feature} requires a premium subscription`
              }
            </Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefit}>
                <Crown size={20} color="#10B981" />
                <Text style={styles.benefitText}>Unlimited AI Messages</Text>
              </View>
              <View style={styles.benefit}>
                <Crown size={20} color="#10B981" />
                <Text style={styles.benefitText}>All AI Specialists</Text>
              </View>
              <View style={styles.benefit}>
                <Crown size={20} color="#10B981" />
                <Text style={styles.benefitText}>Advanced Learning Courses</Text>
              </View>
              <View style={styles.benefit}>
                <Crown size={20} color="#10B981" />
                <Text style={styles.benefitText}>Music Production Studio</Text>
              </View>
              <View style={styles.benefit}>
                <Crown size={20} color="#10B981" />
                <Text style={styles.benefitText}>Priority Support</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upgradeGradient}
              >
                <CreditCard size={20} color="#fff" />
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
            >
              <Text style={styles.laterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '500',
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  laterText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});