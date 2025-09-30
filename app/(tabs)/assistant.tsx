import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, MicOff, Send, Volume2, ArrowLeft, Flower2, MapPin, Thermometer } from "lucide-react-native";
// Audio recording temporarily disabled due to expo-av deprecation
import * as Haptics from "expo-haptics";
import { useAI } from "@/providers/AIProvider";
import { useUser } from "@/providers/UserProvider";
import { router } from "expo-router";
import { PremiumGate } from "@/components/PremiumGate";
import { FreeMessageCounter } from "@/components/FreeMessageCounter";
import { MAIN_GRADIENT, USER_MESSAGE_GRADIENT, AI_MESSAGE_GRADIENT, PRIMARY_BUTTON_GRADIENT, SECONDARY_BUTTON_GRADIENT, AI_MESSAGE_LOCATIONS } from "@/constants/colors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to your personal gardening assistant! 🌱 I'm here to help you grow beautiful plants and maintain a thriving garden. I can provide personalized advice based on your location, climate, soil type, and specific gardening goals. Whether you're a beginner or experienced gardener, I can help with plant identification, care schedules, pest management, seasonal planning, and much more. What gardening challenge can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, transcribeAudio } = useAI();
  const { syncFreeMessagesWithStorage } = useUser();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  
  // Sync free messages with storage periodically on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        syncFreeMessagesWithStorage();
      }, 2000); // Check every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [syncFreeMessagesWithStorage]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendMessage(inputText, "gardening");
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      if (error.message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
        return;
      }
      Alert.alert("Error", "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    Alert.alert("Feature Temporarily Unavailable", "Voice recording is temporarily disabled while we update to the latest audio API. Please type your message instead.");
  };

  const stopRecording = async () => {
    setIsRecording(false);
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
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Flower2 size={28} color="#fff" style={styles.titleIcon} />
                <Text style={styles.title}>Gardening Expert</Text>
              </View>
              <Text style={styles.subtitle}>Plant Care & Garden Planning</Text>
            </View>
            <FreeMessageCounter style={{ marginTop: 8 }} />
          </View>
        </View>

        <LinearGradient
          colors={MAIN_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
            keyboardVerticalOffset={0}
          >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={Platform.OS !== 'android'}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            removeClippedSubviews={Platform.OS === 'android'}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <LinearGradient
                key={message.id}
                colors={message.isUser 
                  ? USER_MESSAGE_GRADIENT 
                  : AI_MESSAGE_GRADIENT
                }
                locations={message.isUser ? undefined : AI_MESSAGE_LOCATIONS}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 0.8, y: 0.8 }}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText,
                ]}>
                  {message.text}
                </Text>
                <Text style={[styles.timestamp, { color: "rgba(255, 255, 255, 0.8)" }]}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </LinearGradient>
            ))}
            {isLoading && (
              <LinearGradient
                colors={AI_MESSAGE_GRADIENT}
                locations={AI_MESSAGE_LOCATIONS}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 0.8, y: 0.8 }}
                style={styles.loadingContainer}
              >
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.loadingText, { color: "rgba(255, 255, 255, 0.9)" }]}>Thinking...</Text>
              </LinearGradient>
            )}
          </ScrollView>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <MapPin size={16} color="#43e97b" />
              <Text style={styles.quickActionText}>My Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Thermometer size={16} color="#43e97b" />
              <Text style={styles.quickActionText}>Climate Info</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { maxHeight: 100 }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about plants, pests, soil, seasons..."
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={handleSend}
            />
            
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isRecording ? ["#EF4444", "#F97316"] : PRIMARY_BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                {isRecording ? (
                  <MicOff size={24} color="#fff" />
                ) : (
                  <Mic size={24} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={SECONDARY_BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                <Send size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </LinearGradient>
        
        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature="AI Messages"
          isNoFreeMessages={true}
        />
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  chatContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 120, // Account for tab bar and input area
  },
  messageBubble: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "transparent",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
    fontWeight: "600",
  },
  aiMessageText: {
    color: "#fff",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "transparent",
    borderRadius: 18,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#6B7280",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    paddingBottom: 20, // Extra padding for tab bar
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: "#1F2937",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    overflow: "hidden",
  },
  recordingButton: {
    backgroundColor: "#EF4444",
  },
  sendButton: {
    backgroundColor: "#3B82F6",
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#43e97b',
    fontWeight: '600',
  },
});