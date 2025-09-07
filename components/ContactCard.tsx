import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, MessageCircle, ExternalLink, X, Send, User } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/providers/UserProvider';

interface ContactCardProps {
  email?: string;
  onPress?: () => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactCard({ 
  email = 'support@yourapp.com', 
  onPress 
}: ContactCardProps) {
  const { username } = useUser();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: username || '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitContactMutation = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data.message);
      setShowModal(false);
      setFormData({
        name: username || '',
        email: '',
        subject: '',
        message: '',
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to submit contact form');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleEmailPress = async () => {
    try {
      const emailUrl = `mailto:${email}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Contact Info', `Please email us at: ${email}`);
      }
    } catch {
      Alert.alert('Contact Info', `Please email us at: ${email}`);
    }
  };

  const handleSupportPress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const handleSubmitForm = async () => {
    if (isSubmitting) return;
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    submitContactMutation.mutate({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      userAgent: Platform.OS,
    });
  };

  const updateFormData = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient
      colors={['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.1)']}
      style={styles.container}
    >
      <View style={styles.header}>
        <MessageCircle size={24} color="#10B981" />
        <Text style={styles.title}>Need Help?</Text>
      </View>
      
      <Text style={styles.description}>
        Get support or contact us directly for assistance.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSupportPress}
          accessibilityLabel="Get support"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
          >
            <MessageCircle size={18} color="#fff" />
            <Text style={styles.buttonText}>Get Support</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emailButton} 
          onPress={handleEmailPress}
          accessibilityLabel="Email us"
          accessibilityRole="button"
        >
          <Mail size={18} color="#10B981" />
          <Text style={styles.emailText}>Email Us</Text>
          <ExternalLink size={14} color="#10B981" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.emailAddress}>{email}</Text>
      
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <LinearGradient
          colors={['#7C3AED', '#2563EB', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={Platform.OS !== 'android'}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.formContainer}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    placeholder="Your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    maxLength={50}
                    returnKeyType="next"
                    accessibilityLabel="Name input field"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail size={18} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="your.email@example.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={100}
                    returnKeyType="next"
                    accessibilityLabel="Email input field"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <View style={styles.inputContainer}>
                  <MessageCircle size={18} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.subject}
                    onChangeText={(value) => updateFormData('subject', value)}
                    placeholder="What can we help you with?"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    maxLength={100}
                    returnKeyType="next"
                    accessibilityLabel="Subject input field"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  value={formData.message}
                  onChangeText={(value) => updateFormData('message', value)}
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={1000}
                  returnKeyType="send"
                  accessibilityLabel="Message input field"
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitForm}
                disabled={isSubmitting}
                accessibilityLabel={isSubmitting ? "Submitting message" : "Send message"}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={isSubmitting ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
                  style={styles.submitButtonGradient}
                >
                  <Send size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Send Message'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    flex: 1,
    textAlign: 'center',
  },
  emailAddress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  messageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});