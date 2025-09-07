import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Linking,
  TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Send, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/providers/UserProvider';
import { trpc } from '@/lib/trpc';

interface InputFieldProps extends Omit<TextInputProps, 'onChange'> {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isTextArea?: boolean;
}

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  isTextArea = false,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            isTextArea && styles.messageInput,
            icon && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          multiline={isTextArea}
          numberOfLines={isTextArea ? 6 : 1}
          textAlignVertical={isTextArea ? 'top' : 'center'}
          {...props}
        />
      </View>
    </View>
  );
}

export default function SupportScreen() {
  const { username } = useUser();
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const supportEmail = 'one.for.all.apps.01@gmail.com';

  const submitContactMutation = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data.message);
      setSubject('');
      setMessage('');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to submit your message. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSendEmail = async () => {
    if (isSubmitting) return;
    
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    if (!username) {
      Alert.alert('Error', 'Please set your username in the profile section first.');
      return;
    }

    setIsSubmitting(true);
    
    // Try backend submission first
    try {
      submitContactMutation.mutate({
        name: username,
        email: '', // We don't have user email in this context
        subject: subject,
        message: message,
        userAgent: Platform.OS,
      });
    } catch (error) {
      // Fallback to email client
      console.log('Backend submission failed, falling back to email client');
      try {
        const emailBody = `From: ${username}\n\nMessage:\n${message}`;
        const emailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        const canOpen = await Linking.canOpenURL(emailUrl);
        if (canOpen) {
          await Linking.openURL(emailUrl);
          Alert.alert('Success', 'Email client opened. Please send your message.');
          setSubject('');
          setMessage('');
        } else {
          Alert.alert('Error', 'No email client found. Please contact us at ' + supportEmail);
        }
      } catch (emailError) {
        console.error('Error opening email:', emailError);
        Alert.alert('Error', 'Failed to open email client. Please contact us at ' + supportEmail);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDirectEmail = async () => {
    try {
      const emailUrl = `mailto:${supportEmail}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Contact Info', `Please email us at: ${supportEmail}`);
      }
    } catch {
      Alert.alert('Contact Info', `Please email us at: ${supportEmail}`);
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
          <Text style={styles.title}>Support</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.contactCard}
          >
            <View style={styles.contactHeader}>
              <Mail size={32} color="#fff" />
              <Text style={styles.contactTitle}>Get in Touch</Text>
            </View>
            <Text style={styles.contactDescription}>
              Need help? We&apos;re here to assist you. Send us a message and we&apos;ll get back to you as soon as possible.
            </Text>
            
            <TouchableOpacity 
              style={styles.quickContactButton}
              onPress={handleDirectEmail}
              accessibilityLabel="Email us directly"
              accessibilityRole="button"
            >
              <Mail size={20} color="#fff" />
              <Text style={styles.quickContactText}>Email Us Directly</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.formCard}
          >
            <Text style={styles.formTitle}>Send a Message</Text>
            
            <InputField
              label="Subject"
              value={subject}
              onChange={setSubject}
              placeholder="What can we help you with?"
              maxLength={100}
              returnKeyType="next"
              accessibilityLabel="Subject input field"
            />

            <InputField
              label="Message"
              value={message}
              onChange={setMessage}
              placeholder="Describe your issue or question in detail..."
              isTextArea
              maxLength={1000}
              returnKeyType="send"
              accessibilityLabel="Message input field"
            />

            <TouchableOpacity 
              style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
              onPress={handleSendEmail}
              disabled={isSubmitting}
              accessibilityLabel={isSubmitting ? "Sending message" : "Send message"}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={isSubmitting ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color="#fff" />
                <Text style={styles.sendButtonText}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.infoCard}
          >
            <Text style={styles.infoTitle}>Contact Information</Text>
            <View style={styles.infoItem}>
              <Mail size={18} color="#fff" />
              <Text style={styles.infoText}>{supportEmail}</Text>
            </View>
            <Text style={styles.responseTime}>
              We typically respond within 24 hours during business days.
            </Text>
          </LinearGradient>
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
    paddingHorizontal: 24,
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
    paddingBottom: 20,
  },
  contactCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  contactHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  contactDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  quickContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  quickContactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  messageInput: {
    height: 120,
    paddingTop: 12,
  },
  sendButton: {
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
  },
  responseTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
});