import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Star, Zap, FileText, Check, Calendar, Clock } from 'lucide-react-native';
import { PayPalButton } from '@/components/PayPalButton';
import { StripeButton } from '@/components/StripeButton';
import { PaymentItem } from '@/providers/PaymentProvider';
import { useUser } from '@/providers/UserProvider';
import { router } from 'expo-router';
import { MAIN_GRADIENT } from '@/constants/colors';

const subscriptionPlans: PaymentItem[] = [
  {
    id: 'yearly-pro',
    name: 'Yearly Pro',
    price: 39.99,
    description: 'Best value - Save 80% with annual billing',
    category: 'subscription'
  },
  {
    id: 'weekly-pro',
    name: 'Weekly Pro',
    price: 7.99,
    description: 'Perfect for short-term projects',
    category: 'subscription'
  }
];

export default function SubscriptionScreen() {
  const { 
    hasUnlimitedAccess, 
    isTrialActive, 
    getRemainingTrialDays, 
    subscriptionType,
    subscriptionExpiresAt,
    startFreeTrial,
    activateSubscription 
  } = useUser();
  
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
  const [isStartingTrial, setIsStartingTrial] = useState<boolean>(false);

  const handleStartFreeTrial = async () => {
    setIsStartingTrial(true);
    try {
      await startFreeTrial(selectedPlan);
      Alert.alert(
        'Free Trial Started!',
        'You now have 7 days of unlimited access to all features. Enjoy exploring everything One for All has to offer!',
        [
          { text: 'Get Started', onPress: () => router.replace('/(tabs)/specialists') }
        ]
      );
    } catch (error) {
      console.error('Error starting trial:', error);
      Alert.alert('Error', 'Failed to start free trial. Please try again.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handlePaymentSuccess = async (item: PaymentItem) => {
    console.log('Payment successful for:', item.name);
    const planType = item.id === 'yearly-pro' ? 'yearly' : 'weekly';
    await activateSubscription(planType);
    
    Alert.alert(
      'Subscription Activated!',
      `Your ${planType} subscription is now active. Enjoy unlimited access to all premium features!`,
      [
        { text: 'Continue', onPress: () => router.replace('/(tabs)/specialists') }
      ]
    );
  };

  const handlePaymentError = (error: string, item: PaymentItem) => {
    console.log('Payment failed for:', item.name, 'Error:', error);
    Alert.alert('Payment Failed', 'There was an issue processing your payment. Please try again.');
  };

  const formatExpiryDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderCurrentStatus = () => {
    if (hasUnlimitedAccess()) {
      if (isTrialActive) {
        return (
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.statusGradient}
            >
              <Clock size={24} color="#10B981" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Free Trial Active</Text>
                <Text style={styles.statusSubtitle}>
                  {getRemainingTrialDays()} days remaining
                </Text>
              </View>
            </LinearGradient>
          </View>
        );
      } else if (subscriptionType !== 'none') {
        return (
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(124, 58, 237, 0.2)', 'rgba(124, 58, 237, 0.1)']}
              style={styles.statusGradient}
            >
              <Crown size={24} color="#7C3AED" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {subscriptionType === 'yearly' ? 'Yearly' : 'Weekly'} Pro Active
                </Text>
                <Text style={styles.statusSubtitle}>
                  Expires {formatExpiryDate(subscriptionExpiresAt)}
                </Text>
              </View>
            </LinearGradient>
          </View>
        );
      }
    }
    return null;
  };

  return (
    <LinearGradient
      colors={MAIN_GRADIENT}
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
          <Text style={styles.title}>Pro Access</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStatus()}

          <Text style={styles.subtitle}>
            Unlock unlimited ChatGPT-4 conversations, image generation, music studio, PDF uploads, and all specialists
          </Text>

          {!hasUnlimitedAccess() && (
            <>
              <View style={styles.trialSection}>
                <TouchableOpacity
                  style={styles.trialButton}
                  onPress={handleStartFreeTrial}
                  disabled={isStartingTrial}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.trialGradient}
                  >
                    <Star size={20} color="#fff" />
                    <Text style={styles.trialText}>
                      {isStartingTrial ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.trialNote}>
                  No commitment • Cancel anytime • Full access to all features
                </Text>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or choose a plan</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          <View style={styles.planContainer}>
            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedPlan === 'yearly' ? ['#10B981', '#059669'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <Crown size={20} color={selectedPlan === 'yearly' ? '#fff' : 'rgba(255, 255, 255, 0.8)'} />
                  <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameSelected]}>Yearly Pro</Text>
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>BEST VALUE</Text>
                  </View>
                </View>
                <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>$39.99/year</Text>
                <Text style={[styles.planSavings, selectedPlan === 'yearly' && styles.planSavingsSelected]}>Save 80% • $3.33/month</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'weekly' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('weekly')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedPlan === 'weekly' ? ['#7C3AED', '#DB2777'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <Zap size={20} color={selectedPlan === 'weekly' ? '#fff' : 'rgba(255, 255, 255, 0.8)'} />
                  <Text style={[styles.planName, selectedPlan === 'weekly' && styles.planNameSelected]}>Weekly Pro</Text>
                </View>
                <Text style={[styles.planPrice, selectedPlan === 'weekly' && styles.planPriceSelected]}>$7.99/week</Text>
                <Text style={[styles.planDescription, selectedPlan === 'weekly' && styles.planDescriptionSelected]}>Perfect for short-term projects</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What's Included</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>Unlimited ChatGPT-4</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>PDF Upload & Analysis</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>All AI Specialists</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>Image Generation</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>Music Production Studio</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>Priority Support</Text>
                </View>
              </View>
            </View>
          </View>

          {!hasUnlimitedAccess() && (
            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>Choose Payment Method</Text>
              <View style={styles.paymentButtons}>
                <PayPalButton
                  item={subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!}
                  onSuccess={() => handlePaymentSuccess(subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!)}
                  onError={(error) => handlePaymentError(error, subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!)}
                  style={styles.paymentButton}
                />
                <StripeButton
                  item={subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!}
                  onSuccess={() => handlePaymentSuccess(subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!)}
                  onError={(error) => handlePaymentError(error, subscriptionPlans.find(plan => plan.id === `${selectedPlan}-pro`)!)}
                  style={styles.paymentButton}
                />
              </View>
            </View>
          )}

          <View style={styles.securityInfo}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.securityCard}
            >
              <Text style={styles.securityTitle}>Secure & Trusted</Text>
              <Text style={styles.securityText}>
                All payments are processed securely through PayPal and Stripe. Cancel anytime with no hidden fees.
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  trialSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trialButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  trialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  trialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  trialNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  planContainer: {
    gap: 12,
    marginBottom: 32,
  },
  planOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  planOptionSelected: {
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  planGradient: {
    padding: 16,
    position: 'relative',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  planNameSelected: {
    color: '#fff',
  },
  popularBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  planPriceSelected: {
    color: '#fff',
  },
  planSavings: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  planSavingsSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  planDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  planDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 16,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  paymentSection: {
    marginBottom: 32,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentButtons: {
    gap: 12,
  },
  paymentButton: {
    marginTop: 0,
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
    textAlign: 'center',
  },
  securityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    textAlign: 'center',
  },
});