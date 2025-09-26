import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,

  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react-native';
// Note: Using web clipboard API for cross-platform compatibility

interface ConfigCheck {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  value?: string;
  required: boolean;
}

export default function ConfigurationScreen() {
  const [checks, setChecks] = useState<ConfigCheck[]>([]);

  useEffect(() => {
    runConfigurationChecks();
  }, []);

  const runConfigurationChecks = () => {
    const configChecks: ConfigCheck[] = [];

    // Check Stripe Configuration
    const stripePublishable = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    configChecks.push({
      name: 'Stripe Publishable Key',
      status: stripePublishable && !stripePublishable.includes('YOUR_ACTUAL') ? 'success' : 'error',
      message: stripePublishable && !stripePublishable.includes('YOUR_ACTUAL') 
        ? 'Configured' 
        : 'Not configured - Add your Stripe publishable key',
      value: stripePublishable?.substring(0, 20) + '...',
      required: true,
    });

    // Check API Base URL
    const apiBaseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    configChecks.push({
      name: 'API Base URL',
      status: apiBaseUrl && !apiBaseUrl.includes('your-') ? 'success' : 'warning',
      message: apiBaseUrl && !apiBaseUrl.includes('your-') 
        ? 'Configured' 
        : 'Using default - Update for production',
      value: apiBaseUrl,
      required: true,
    });

    // Check AI API Configuration (Note: These are server-side only, so we can't check them directly)
    configChecks.push({
      name: 'AI API Keys',
      status: 'warning',
      message: 'Server-side only - Check console logs when testing chat',
      value: 'OpenAI or Gemini required',
      required: true,
    });

    // Check PayPal Configuration (optional)
    const paypalClientId = process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID;
    configChecks.push({
      name: 'PayPal Client ID',
      status: paypalClientId && !paypalClientId.includes('your-paypal') ? 'success' : 'warning',
      message: paypalClientId && !paypalClientId.includes('your-paypal') 
        ? 'Configured' 
        : 'Optional - Add for PayPal payments',
      value: paypalClientId?.substring(0, 20) + '...',
      required: false,
    });

    // Environment-specific checks
    configChecks.push({
      name: 'Environment',
      status: 'success',
      message: __DEV__ ? 'Development' : 'Production',
      value: __DEV__ ? 'dev' : 'prod',
      required: true,
    });

    setChecks(configChecks);
  };

  const copyToClipboard = async (text: string) => {
    if (!text || !text.trim()) {
      console.warn('No text to copy');
      return;
    }
    
    const sanitizedText = text.trim();
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(sanitizedText);
        console.log('Configuration copied to clipboard');
      } else {
        // For mobile, we'll just log it since expo-clipboard isn't installed
        console.log('Configuration template:', sanitizedText);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStatusIcon = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
    }
  };

  const generateEnvTemplate = () => {
    return `# Copy this template to your .env file and replace with your actual keys

# Stripe Configuration (Required)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY

# AI Configuration (Required - Choose one or both)
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY
GEMINI_API_KEY=AIzaSyYOUR_GEMINI_API_KEY

# API Base URL (Update for production)
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-domain.com

# PayPal Configuration (Optional)
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
EXPO_PUBLIC_PAYPAL_MODE=live

# Admin Configuration
ADMIN_PASSWORD=MySecureAdmin2024!`;
  };

  const requiredCount = checks.filter(c => c.required).length;
  const configuredCount = checks.filter(c => c.required && c.status === 'success').length;
  const isReadyForProduction = checks.filter(c => c.required).every(c => c.status === 'success');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Configuration',
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
            <Text style={styles.title}>API Configuration</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {configuredCount}/{requiredCount} Required
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Configuration Status */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Configuration Status</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ready for Production:</Text>
                <View style={styles.summaryValue}>
                  {getStatusIcon(isReadyForProduction ? 'success' : 'error')}
                  <Text style={[styles.summaryText, { color: getStatusColor(isReadyForProduction ? 'success' : 'error') }]}>
                    {isReadyForProduction ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Configuration Checks */}
            {checks.map((check, index) => (
              <View key={`check-${index}`} style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  {getStatusIcon(check.status)}
                  <View style={styles.checkInfo}>
                    <Text style={styles.checkName}>{check.name}</Text>
                    {check.required && <Text style={styles.requiredBadge}>Required</Text>}
                  </View>
                </View>
                <Text style={[styles.checkMessage, { color: getStatusColor(check.status) }]}>
                  {check.message}
                </Text>
                {check.value && (
                  <Text style={styles.checkValue}>{check.value}</Text>
                )}
              </View>
            ))}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => copyToClipboard(generateEnvTemplate())}
              >
                <Copy size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Copy .env Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={runConfigurationChecks}
              >
                <Text style={styles.secondaryButtonText}>Refresh Checks</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Next Steps:</Text>
              <Text style={styles.instructionsText}>
                1. Copy the .env template above{'\n'}
                2. Replace placeholder values with your actual API keys{'\n'}
                3. Add at least one AI API key (OpenAI or Gemini){'\n'}
                4. Restart your development server{'\n'}
                5. Test the Assistant tab to verify AI integration{'\n'}
                6. Check API_KEYS_SETUP.md for detailed instructions
              </Text>
            </View>
          </ScrollView>
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
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  requiredBadge: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  checkMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  checkValue: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionSection: {
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});