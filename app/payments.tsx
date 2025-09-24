import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShoppingCart, Star, Clock, BookOpen, History, Crown } from 'lucide-react-native';
import { PayPalButton } from '@/components/PayPalButton';
import { StripeButton } from '@/components/StripeButton';
import { PaymentItem } from '@/providers/PaymentProvider';
import { useUser } from '@/providers/UserProvider';
import { router } from 'expo-router';

const premiumItems: PaymentItem[] = [
  {
    id: 'yearly-pro',
    name: 'Yearly Pro Subscription',
    price: 39.99,
    description: 'Best value - Save 80% with annual billing. Unlock all specialists, unlimited ChatGPT-5, music studio, and advanced features',
    category: 'subscription'
  },
  {
    id: 'weekly-pro',
    name: 'Weekly Pro Subscription',
    price: 7.99,
    description: 'Perfect for short-term projects. Full access to all premium features',
    category: 'subscription'
  },
  {
    id: 'ai-tutor-session',
    name: '1-on-1 AI Tutoring Session',
    price: 4.99,
    description: 'Single personalized tutoring session with AI specialist (1 hour)',
    category: 'service'
  },
  {
    id: 'music-studio-access',
    name: 'Music Studio Day Pass',
    price: 2.99,
    description: '24-hour access to full music production studio features',
    category: 'service'
  }
];

export default function PaymentsScreen() {
  const { isPremium, setIsPremium } = useUser();

  const handlePaymentSuccess = (item: PaymentItem) => {
    console.log('Payment successful for:', item.name);
  };

  const handlePaymentError = (error: string, item: PaymentItem) => {
    console.log('Payment failed for:', item.name, 'Error:', error);
  };

  const handleDemoAccess = () => {
    setIsPremium(true);
    router.back();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subscription':
        return <Star size={24} color="#fff" />;
      case 'service':
        return <Clock size={24} color="#fff" />;
      case 'course':
        return <BookOpen size={24} color="#fff" />;
      default:
        return <ShoppingCart size={24} color="#fff" />;
    }
  };

  const getCategoryColor = (category: string): [string, string] => {
    switch (category) {
      case 'subscription':
        return ['#7C3AED', '#DB2777'];
      case 'service':
        return ['#2563EB', '#0891B2'];
      case 'course':
        return ['#059669', '#047857'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#2563EB', '#DB2777']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Pro Access & Services</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => router.push('/payment-test')}
              accessibilityLabel="Go to payment test page"
              accessibilityRole="button"
            >
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => router.push('/payment-history')}
              accessibilityLabel="View payment history"
              accessibilityRole="button"
            >
              <History size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Choose your plan or get individual services with secure payments
          </Text>

          {!isPremium && (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoAccess}
              accessibilityLabel="Try premium for free demo"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.demoGradient}
              >
                <Crown size={20} color="#fff" />
                <Text style={styles.demoText}>Try Premium for Free (Demo)</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isPremium && (
            <View style={styles.premiumNotice}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.premiumNoticeGradient}
              >
                <Crown size={20} color="#10B981" />
                <Text style={styles.premiumNoticeText}>
                  You already have premium access!
                </Text>
              </LinearGradient>
            </View>
          )}

          {premiumItems.map((item) => (
            <LinearGradient
              key={item.id}
              colors={getCategoryColor(item.category || 'default')}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.itemCard}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemIcon}>
                  {getCategoryIcon(item.category || 'default')}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
              </View>
              
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}

              <View style={styles.paymentButtons}>
                <PayPalButton
                  item={item}
                  onSuccess={() => handlePaymentSuccess(item)}
                  onError={(error) => handlePaymentError(error, item)}
                  style={styles.paymentButton}
                />
                <StripeButton
                  item={item}
                  onSuccess={() => handlePaymentSuccess(item)}
                  onError={(error) => handlePaymentError(error, item)}
                  style={styles.paymentButton}
                />
              </View>
            </LinearGradient>
          ))}

          <View style={styles.securityInfo}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.securityCard}
            >
              <Text style={styles.securityTitle}>Secure Payments</Text>
              <Text style={styles.securityText}>
                All payments are processed securely through PayPal and Stripe. Your financial information is protected with industry-standard encryption.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  itemCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  itemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  paymentButtons: {
    gap: 12,
  },
  paymentButton: {
    marginTop: 8,
  },
  securityInfo: {
    marginTop: 20,
  },
  securityCard: {
    borderRadius: 12,
    padding: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  demoButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  demoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumNotice: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  premiumNoticeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  premiumNoticeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});