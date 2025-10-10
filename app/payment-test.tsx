import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 

  Smartphone,
  Globe,
  AlertTriangle,
  Info
} from 'lucide-react-native';
import { StripeButton } from '@/components/StripeButton';
import { PaymentItem } from '@/providers/PaymentProvider';
import { useUser } from '@/providers/UserProvider';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

const testItems: PaymentItem[] = [
  {
    id: 'test-small',
    name: 'Test Payment - Small',
    price: 0.50,
    description: 'Small test payment to verify basic functionality',
    category: 'test'
  },
  {
    id: 'test-medium',
    name: 'Test Payment - Medium',
    price: 5.00,
    description: 'Medium test payment for standard flow testing',
    category: 'test'
  },
  {
    id: 'test-large',
    name: 'Test Payment - Large',
    price: 25.00,
    description: 'Large test payment for high-value transaction testing',
    category: 'test'
  },
];

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'failed';
  method: 'stripe';
  timestamp: Date;
  error?: string;
  amount?: number;
}

export default function PaymentTestScreen() {
  const { isPremium } = useUser();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingMode] = useState<boolean>(true);
  
  const createPaymentIntent = trpc.stripe.createPaymentIntent.useMutation();

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const updateTestResult = (id: string, updates: Partial<TestResult>) => {
    setTestResults(prev => 
      prev.map(result => 
        result.id === id ? { ...result, ...updates } : result
      )
    );
  };

  const handlePaymentSuccess = (item: PaymentItem, method: 'stripe') => {
    const resultId = `${method}-${item.id}-${Date.now()}`;
    updateTestResult(resultId, {
      status: 'success',
      timestamp: new Date(),
      amount: item.price
    });
    
    Alert.alert(
      'Payment Test Successful! ✅',
      `${method.toUpperCase()} payment of $${item.price.toFixed(2)} completed successfully.\n\nItem: ${item.name}`,
      [{ text: 'OK' }]
    );
    
    console.log(`✅ ${method.toUpperCase()} Payment Success:`, {
      item: item.name,
      amount: item.price,
      method,
      timestamp: new Date().toISOString()
    });
  };

  const handlePaymentError = (error: string, item: PaymentItem, method: 'stripe') => {
    const resultId = `${method}-${item.id}-${Date.now()}`;
    updateTestResult(resultId, {
      status: 'failed',
      timestamp: new Date(),
      error,
      amount: item.price
    });
    
    Alert.alert(
      'Payment Test Failed ❌',
      `${method.toUpperCase()} payment failed.\n\nError: ${error}\nItem: ${item.name}\nAmount: $${item.price.toFixed(2)}`,
      [{ text: 'OK' }]
    );
    
    console.error(`❌ ${method.toUpperCase()} Payment Error:`, {
      item: item.name,
      amount: item.price,
      method,
      error,
      timestamp: new Date().toISOString()
    });
  };



  const testStripeConnection = async () => {
    try {
      console.log('🔍 Testing Stripe connection...');
      const result = await createPaymentIntent.mutateAsync({
        amount: 100, // $1.00 in cents
        currency: 'usd',
        description: 'Stripe Connection Test',
      });
      
      if (result.clientSecret) {
        Alert.alert(
          'Stripe Connection Test ✅',
          'Stripe backend connection is working correctly!\n\nClient secret received successfully.',
          [{ text: 'OK' }]
        );
        console.log('✅ Stripe connection test successful:', result);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error: any) {
      Alert.alert(
        'Stripe Connection Test ❌',
        `Stripe backend connection failed.\n\nError: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      console.error('❌ Stripe connection test failed:', error);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    console.log('🧹 Test results cleared');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color="#10B981" />;
      case 'failed':
        return <XCircle size={16} color="#EF4444" />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
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
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Testing</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearTestResults}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
              style={styles.infoGradient}
            >
              <Info size={20} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Payment Testing Environment</Text>
                <Text style={styles.infoText}>
                  Test Stripe payment flows. All transactions are in test mode.
                </Text>
                <View style={styles.platformInfo}>
                  <View style={styles.platformItem}>
                    {Platform.OS === 'web' ? <Globe size={16} color="#fff" /> : <Smartphone size={16} color="#fff" />}
                    <Text style={styles.platformText}>
                      Platform: {Platform.OS === 'web' ? 'Web' : 'Mobile'}
                    </Text>
                  </View>
                  {Platform.OS === 'web' && (
                    <View style={styles.warningItem}>
                      <AlertTriangle size={16} color="#F59E0B" />
                      <Text style={styles.warningText}>
                        Stripe only works on mobile
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.testControls}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testStripeConnection}
            >
              <LinearGradient
                colors={['#635BFF', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.testButtonGradient}
              >
                <TestTube size={20} color="#fff" />
                <Text style={styles.testButtonText}>Test Stripe Connection</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Test Payment Items</Text>
          
          {testItems.map((item) => (
            <LinearGradient
              key={item.id}
              colors={['#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.itemCard}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemIcon}>
                  <TestTube size={24} color="#fff" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </View>
              
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}

              <View style={styles.paymentButtons}>
                <StripeButton
                  item={item}
                  onSuccess={() => handlePaymentSuccess(item, 'stripe')}
                  onError={(error) => handlePaymentError(error, item, 'stripe')}
                  style={styles.paymentButton}
                />
              </View>
            </LinearGradient>
          ))}

          {testResults.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {testResults.map((result) => (
                <View key={result.id} style={styles.resultCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.resultGradient}
                  >
                    <View style={styles.resultHeader}>
                      <View style={styles.resultStatus}>
                        {getStatusIcon(result.status)}
                        <Text style={[styles.resultStatusText, { color: getStatusColor(result.status) }]}>
                          {result.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.resultMethod}>
                        {result.method.toUpperCase()}
                      </Text>
                    </View>
                    
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultAmount}>${result.amount?.toFixed(2)}</Text>
                    <Text style={styles.resultTime}>
                      {result.timestamp.toLocaleTimeString()}
                    </Text>
                    
                    {result.error && (
                      <Text style={styles.resultError}>
                        Error: {result.error}
                      </Text>
                    )}
                  </LinearGradient>
                </View>
              ))}
            </>
          )}

          <View style={styles.debugInfo}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.debugCard}
            >
              <Text style={styles.debugTitle}>Debug Information</Text>
              <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
              <Text style={styles.debugText}>Premium Status: {isPremium ? 'Active' : 'Inactive'}</Text>
              <Text style={styles.debugText}>Test Mode: {isTestingMode ? 'Enabled' : 'Disabled'}</Text>
              <Text style={styles.debugText}>Total Tests: {testResults.length}</Text>
              <Text style={styles.debugText}>
                Success Rate: {testResults.length > 0 
                  ? `${Math.round((testResults.filter(r => r.status === 'success').length / testResults.length) * 100)}%`
                  : 'N/A'
                }
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 12,
  },
  platformInfo: {
    gap: 8,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
  },
  testControls: {
    marginBottom: 24,
  },
  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
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
  resultCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  resultGradient: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultMethod: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  resultTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  resultError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  debugInfo: {
    marginTop: 20,
  },
  debugCard: {
    borderRadius: 12,
    padding: 16,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
});