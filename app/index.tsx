import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, Check, Crown, Star, Zap, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_GRADIENT, COLORS } from '@/constants/colors';

type AuthMode = 'welcome' | 'signin' | 'signup' | 'forgot';

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [freeTrialEnabled, setFreeTrialEnabled] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem('savedCredentials');
      if (savedCredentials) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        console.log('Loaded saved credentials');
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem('savedCredentials', JSON.stringify({ email, password }));
      console.log('Credentials saved');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedCredentials');
      console.log('Saved credentials cleared');
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    handleHaptic();
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(async () => {
      setIsLoading(false);
      console.log('Sign in successful, navigating to specialists');
      
      // Handle Remember Me functionality
      if (rememberMe) {
        await saveCredentials(email, password);
      } else {
        await clearSavedCredentials();
      }
      
      // Direct navigation without alert for better reliability
      router.replace('/(tabs)/specialists');
    }, 1000);
  };

  const handleSignUp = async () => {
    handleHaptic();
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Email Confirmation Required',
        'We\'ve sent a confirmation email to your address. Please check your inbox and click the verification link to complete your registration.',
        [
          { text: 'OK', onPress: () => setAuthMode('signin') }
        ]
      );
    }, 1500);
  };

  const handleForgotPassword = async () => {
    handleHaptic();
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Reset Link Sent',
        'We\'ve sent a password reset link to your email address. Please check your inbox.',
        [
          { text: 'OK', onPress: () => setAuthMode('signin') }
        ]
      );
    }, 1500);
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.welcomeMainTitle}>Welcome</Text>
        <Text style={styles.poweredByText}>Powered by ChatGPT 5</Text>
      </View>

      <View style={styles.welcomeContent}>
        <Text style={styles.mainDescription}>
          Get instant access to AI specialists for personalized 1-on-1 lessons, interactive learning courses, live tutoring sessions, and professional guidance across multiple fields
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featuresList}>
            <Text style={styles.featureListItem}>💻 Software Development & Coding</Text>
            <Text style={styles.featureListItem}>🏥 Medical Consultation & Health</Text>
            <Text style={[styles.featureListItem, styles.musicStudioFeature]}>🎵 Music Studio & Production</Text>
            <Text style={styles.featureListItem}>📚 Interactive Learning Courses & Live 1-on-1 Tutoring Sessions</Text>
            <Text style={styles.featureListItem}>💼 Business & Professional Advice</Text>
            <Text style={styles.featureListItem}>🎨 Creative & Design Support</Text>
          </View>
        </View>
        
        <Text style={styles.bottomDescription}>
          Each specialist is powered by advanced ChatGPT 5 technology, providing expert-level guidance, personalized 1-on-1 tutoring sessions, live interactive lessons, and comprehensive learning experiences tailored to your specific needs and learning style.
        </Text>

        <View style={styles.trialSection}>
          <View style={styles.trialToggleContainer}>
            <TouchableOpacity
              style={styles.trialToggle}
              onPress={() => {
                handleHaptic();
                setFreeTrialEnabled(!freeTrialEnabled);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.toggleSwitch, freeTrialEnabled && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, freeTrialEnabled && styles.toggleKnobActive]} />
              </View>
              <Text style={styles.trialToggleText}>Enable Free Trial</Text>
            </TouchableOpacity>
          </View>

          {freeTrialEnabled && (
            <View style={styles.subscriptionOptions}>
              <Text style={styles.subscriptionTitle}>Choose Your Pro Access Plan</Text>
              <Text style={styles.subscriptionSubtitle}>
                Unlock unlimited ChatGPT 5 conversations, image generation, music studio, PDF uploads, and all specialists
              </Text>
              
              <View style={styles.planContainer}>
                <TouchableOpacity
                  style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionSelected]}
                  onPress={() => {
                    handleHaptic();
                    setSelectedPlan('yearly');
                  }}
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
                  onPress={() => {
                    handleHaptic();
                    setSelectedPlan('weekly');
                  }}
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

              <View style={styles.featuresGrid}>
                <View style={styles.featureRow}>
                  <View style={styles.featureItem}>
                    <Star size={16} color="#10B981" />
                    <Text style={styles.featureText}>Unlimited ChatGPT 5</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FileText size={16} color="#10B981" />
                    <Text style={styles.featureText}>PDF Upload & Analysis</Text>
                  </View>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.featureItem}>
                    <Crown size={16} color="#10B981" />
                    <Text style={styles.featureText}>All AI Specialists</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Zap size={16} color="#10B981" />
                    <Text style={styles.featureText}>Image Generation</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.continueTrialButton}
                onPress={() => {
                  handleHaptic();
                  router.push('/subscription');
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7C3AED', '#DB2777']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.continueTrialGradient}
                >
                  <Crown size={20} color="#fff" />
                  <Text style={styles.continueTrialText}>Continue with {selectedPlan === 'yearly' ? 'Yearly' : 'Weekly'} Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              handleHaptic();
              setAuthMode('signin');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              handleHaptic();
              setAuthMode('signup');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Created by AA Designs</Text>
      </View>
    </View>
  );

  const renderAuthForm = () => {
    const isSignUp = authMode === 'signup';
    const isForgot = authMode === 'forgot';
    
    return (
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            handleHaptic();
            setAuthMode('welcome');
            // Don't clear email/password if Remember Me is checked
            if (!rememberMe) {
              setEmail('');
              setPassword('');
            }
            setConfirmPassword('');
            setFullName('');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isForgot 
              ? 'Enter your email to receive a reset link'
              : isSignUp 
              ? 'Join our AI community'
              : 'Sign in to continue'
            }
          </Text>
        </View>

        <View style={styles.inputContainer}>
          {isSignUp && (
            <View style={styles.inputWrapper}>
              <User size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Mail size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {!isForgot && (
            <View style={styles.inputWrapper}>
              <Lock size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" />
                ) : (
                  <Eye size={20} color="rgba(255, 255, 255, 0.7)" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {isSignUp && (
            <View style={styles.inputWrapper}>
              <Lock size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" />
                ) : (
                  <Eye size={20} color="rgba(255, 255, 255, 0.7)" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!isForgot && !isSignUp && (
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => {
              handleHaptic();
              setRememberMe(!rememberMe);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Check size={16} color={COLORS.DARK_PURPLE} />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={isForgot ? handleForgotPassword : isSignUp ? handleSignUp : handleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Please wait...' : isForgot ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          {!isForgot && !isSignUp && (
            <TouchableOpacity
              onPress={() => {
                handleHaptic();
                setAuthMode('forgot');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
          
          {!isForgot && (
            <TouchableOpacity
              onPress={() => {
                handleHaptic();
                setAuthMode(isSignUp ? 'signin' : 'signup');
                // Don't clear email/password if Remember Me is checked and switching to signin
                if (!(rememberMe && !isSignUp)) {
                  setEmail('');
                  setPassword('');
                }
                setConfirmPassword('');
                setFullName('');
                if (isSignUp) {
                  setRememberMe(false);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={MAIN_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {authMode === 'welcome' ? renderWelcomeScreen() : renderAuthForm()}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.DARK_PURPLE,
  },
  welcomeMainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  poweredByText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  mainDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.DARK_PURPLE,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  formHeader: {
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  inputContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  linkContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textDecorationLine: 'underline',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  rememberMeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  powerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  powerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  featuresList: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureListItem: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  trialSection: {
    marginBottom: 30,
  },
  trialToggleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trialToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  trialToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subscriptionOptions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  planContainer: {
    gap: 12,
    marginBottom: 20,
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
  featuresGrid: {
    gap: 8,
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
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    flex: 1,
  },
  continueTrialButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueTrialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  continueTrialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  musicStudioFeature: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});