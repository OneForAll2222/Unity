import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';
import { APP_CONFIG } from '@/constants/config';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function APITestScreen() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Check API Base URL Configuration
    testResults.push({
      name: 'API Base URL Configuration',
      status: APP_CONFIG.API_BASE_URL ? 'success' : 'error',
      message: APP_CONFIG.API_BASE_URL ? `Configured: ${APP_CONFIG.API_BASE_URL}` : 'Not configured',
      details: APP_CONFIG.API_BASE_URL || 'Set EXPO_PUBLIC_RORK_API_BASE_URL in .env file'
    });

    // Test 2: Basic API Health Check
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/`);
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'API Health Check',
          status: 'success',
          message: 'API is responding',
          details: JSON.stringify(data, null, 2)
        });
      } else {
        testResults.push({
          name: 'API Health Check',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: 'Backend server may not be running'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'API Health Check',
        status: 'error',
        message: 'Connection failed',
        details: error.message || 'Network error - check if backend is running'
      });
    }

    // Test 3: tRPC Connection
    try {
      const response = await trpcClient.example.hi.mutate({ name: 'test' });
      testResults.push({
        name: 'tRPC Connection',
        status: 'success',
        message: 'tRPC is working',
        details: response.hello
      });
    } catch (error: any) {
      testResults.push({
        name: 'tRPC Connection',
        status: 'error',
        message: 'tRPC failed',
        details: error.message || 'tRPC endpoint not responding'
      });
    }

    // Test 4: OpenAI API Configuration
    try {
      const response = await trpcClient.openai.chat.mutate({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o',
        max_tokens: 10,
        temperature: 0.7,
      });
      testResults.push({
        name: 'OpenAI API',
        status: 'success',
        message: 'OpenAI is working',
        details: response.content.substring(0, 100) + '...'
      });
    } catch (error: any) {
      if (error.message.includes('API key not configured')) {
        testResults.push({
          name: 'OpenAI API',
          status: 'warning',
          message: 'API key not configured',
          details: 'Set OPENAI_API_KEY in .env file'
        });
      } else {
        testResults.push({
          name: 'OpenAI API',
          status: 'error',
          message: 'OpenAI failed',
          details: error.message || 'Unknown error'
        });
      }
    }

    // Test 5: External AI APIs
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'External AI API',
          status: 'success',
          message: 'External AI is working',
          details: data.completion?.substring(0, 100) + '...'
        });
      } else {
        testResults.push({
          name: 'External AI API',
          status: 'error',
          message: `HTTP ${response.status}`,
          details: 'External AI service not responding'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'External AI API',
        status: 'error',
        message: 'Connection failed',
        details: error.message || 'Network error'
      });
    }

    setTests(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#F59E0B" />;
      default:
        return <ActivityIndicator size="small" color="#6B7280" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'API Diagnostics',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>API Status Check</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={runTests}
              disabled={isRunning}
            >
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {tests.map((test, index) => (
              <View key={`test-${index}-${test.name}`} style={styles.testCard}>
                <View style={styles.testHeader}>
                  {getStatusIcon(test.status)}
                  <Text style={styles.testName}>{test.name}</Text>
                </View>
                <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                  {test.message}
                </Text>
                {test.details && (
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        console.log(`${test.name}: ${test.details}`);
                      } else {
                        Alert.alert(test.name, test.details);
                      }
                    }}
                    style={styles.detailsButton}
                  >
                    <Text style={styles.detailsText}>View Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {tests.length === 0 && (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.emptyText}>Running diagnostics...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {tests.filter(t => t.status === 'success').length} of {tests.length} tests passed
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
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
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  testCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  testMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsText: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});