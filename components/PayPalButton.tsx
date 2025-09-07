import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, X, CheckCircle } from 'lucide-react-native';
import { usePayment, PaymentItem } from '@/providers/PaymentProvider';

interface PayPalButtonProps {
  item: PaymentItem;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
}

export function PayPalButton({ item, onSuccess, onError, style }: PayPalButtonProps) {
  const { processPayment, isProcessing } = usePayment();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handlePayment = async () => {
    try {
      setShowModal(true);
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
        onError?.('Payment failed. Please try again.');
        Alert.alert('Payment Failed', 'Please try again later.');
      }
    } catch {
      setShowModal(false);
      onError?.('Payment error occurred.');
      Alert.alert('Error', 'An error occurred during payment.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.paypalButton, style]}
        onPress={handlePayment}
        disabled={isProcessing}
        accessibilityLabel={`Pay ${item.price.toFixed(2)} dollars with PayPal for ${item.name}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#0070BA', '#003087']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <CreditCard size={20} color="#fff" />
              <Text style={styles.paypalText}>Pay with PayPal</Text>
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
            ) : (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingTitle}>Processing Payment</Text>
                <Text style={styles.processingMessage}>
                  Please wait while we process your payment...
                </Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  paypalButton: {
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
  paypalText: {
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
});