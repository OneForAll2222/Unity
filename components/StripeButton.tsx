import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { usePayment, PaymentItem } from '@/providers/PaymentProvider';
import { useStripePayment } from '@/components/StripeWrapper';
import { trpc } from '@/lib/trpc';


interface StripeButtonProps {
  item: PaymentItem;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
}

export function StripeButton({ item, onSuccess, onError, style }: StripeButtonProps) {
  const { processPayment, isProcessing } = usePayment();
  const { isStripeAvailable, initPaymentSheet, presentPaymentSheet } = useStripePayment();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const createPaymentIntent = trpc.stripe.createPaymentIntent.useMutation();

  const handleStripePayment = async () => {
    try {
      // Check if we're on web platform or Stripe is not available
      if (Platform.OS === 'web') {
        Alert.alert(
          'Mobile Only',
          'Stripe payments are only available on mobile devices. Please open this project in Expo Go on iOS or Android to complete payment.'
        );
        return;
      }

      if (!isStripeAvailable) {
        Alert.alert(
          'Stripe Not Available',
          'Stripe is not properly configured. Please contact support.'
        );
        return;
      }

      setIsLoading(true);
      setShowModal(true);
      
      // Step 1: Create payment intent on backend
      const amountInCents = Math.round(item.price * 100);
      
      const paymentIntentResult = await createPaymentIntent.mutateAsync({
        amount: amountInCents,
        currency: 'usd',
        description: item.name,
        metadata: {
          itemId: item.id,
          itemName: item.name,
        },
      });

      if (!paymentIntentResult.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: '1-For-All',
        paymentIntentClientSecret: paymentIntentResult.clientSecret,
        defaultBillingDetails: {
          name: 'Customer',
        },
        style: 'automatic',
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: false, // Set to true for testing
          currencyCode: 'USD',
        },
        applePay: {
          merchantCountryCode: 'US',
        },
        returnURL: 'your-app://stripe-redirect', // Update with your app scheme
      });

      if (initError) {
        throw new Error(initError.message || 'Failed to initialize payment sheet');
      }

      // Step 3: Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      setIsLoading(false);

      if (presentError) {
        // User cancelled or error occurred
        setShowModal(false);
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', presentError.message || 'Payment could not be processed');
          onError?.(presentError.message || 'Payment failed');
        }
        return;
      }

      // Step 4: Payment successful
      const success = await processPayment(item);
      
      if (success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setPaymentSuccess(false);
          onSuccess?.();
        }, 2000);
      } else {
        setShowModal(false);
        Alert.alert('Payment Failed', 'Payment was processed but could not be recorded.');
      }
    } catch (error: any) {
      setIsLoading(false);
      setShowModal(false);
      console.error('Stripe payment error:', error);
      const errorMessage = error?.message || 'Payment error occurred';
      onError?.(errorMessage);
      Alert.alert('Payment Error', errorMessage);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.stripeButton, style, Platform.OS === 'web' && styles.disabledButton]}
        onPress={handleStripePayment}
        disabled={isProcessing || isLoading || Platform.OS === 'web'}
        accessibilityLabel={Platform.OS === 'web' ? 'Card payments only available on mobile' : `Pay ${item.price.toFixed(2)} dollars with card for ${item.name}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={Platform.OS === 'web' ? ['#9CA3AF', '#6B7280'] : ['#635BFF', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {isProcessing || isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {Platform.OS === 'web' ? (
                <AlertCircle size={20} color="#fff" />
              ) : (
                <CreditCard size={20} color="#fff" />
              )}
              <Text style={styles.stripeText}>
                {Platform.OS === 'web' ? 'Card (Mobile Only)' : `Pay ${item.price.toFixed(2)}`}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#7C3AED', '#2563EB', '#DB2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
              accessibilityLabel="Close payment modal"
              accessibilityRole="button"
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>

            {paymentSuccess ? (
              <View style={styles.successContainer}>
                <CheckCircle size={64} color="#10B981" />
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successMessage}>
                  Thank you for your purchase of {item.name}
                </Text>
              </View>
            ) : isLoading ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingTitle}>Initializing Payment</Text>
                <Text style={styles.processingMessage}>
                  Setting up secure payment...
                </Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.processingContainer}>
                <Text style={styles.processingTitle}>Complete Payment</Text>
                <Text style={styles.processingMessage}>
                  Follow the prompts to complete your payment
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  stripeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  stripeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  processingMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  itemDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
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
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});