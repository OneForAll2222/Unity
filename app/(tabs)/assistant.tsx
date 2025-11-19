import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { FreeMessageCounter } from "@/components/FreeMessageCounter";
import { PremiumGate } from "@/components/PremiumGate";
import {
  AI_MESSAGE_GRADIENT,
  AI_MESSAGE_LOCATIONS,
  MAIN_GRADIENT,
  PRIMARY_BUTTON_GRADIENT,
  SECONDARY_BUTTON_GRADIENT,
  USER_MESSAGE_GRADIENT,
} from "@/constants/colors";
import { useAI } from "@/providers/AIProvider";
import { useUser } from "@/providers/UserProvider";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

type Suggestion = string;

const QUICK_SUGGESTIONS: Suggestion[] = [
  "Plan my day for peak productivity",
  "Summarize this article for me",
  "Help me brainstorm marketing ideas",
  "Draft a polite follow-up email",
];

export default function AssistantScreen(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text:
        "Hi there! I'm your on-call General Assistant. I can tackle research, writing, planning, brainstorming, tech help, and everyday problem-solving. What would you like to work on first?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const insets = useSafeAreaInsets();
  const { sendMessage } = useAI();
  const { syncFreeMessagesWithStorage } = useUser();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (Platform.OS === "android") {
      const interval = setInterval(() => {
        console.log("[AssistantScreen] Syncing free messages from storage");
        void syncFreeMessagesWithStorage();
      }, 2000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [syncFreeMessagesWithStorage]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const sourceText = overrideText ?? inputText;
      const trimmed = sourceText.trim();
      if (!trimmed || isLoading) {
        return;
      }

      console.log("[AssistantScreen] Sending message", { trimmed, overrideText });

      const userMessage: Message = {
        id: `${Date.now()}-user`,
        text: trimmed,
        isUser: true,
        timestamp: new Date(),
      };

      appendMessage(userMessage);
      if (!overrideText) {
        setInputText("");
      }
      setIsLoading(true);

      try {
        const response = await sendMessage(trimmed, "general");
        console.log("[AssistantScreen] Received AI response");
        const aiMessage: Message = {
          id: `${Date.now()}-assistant`,
          text: response,
          isUser: false,
          timestamp: new Date(),
        };
        appendMessage(aiMessage);
        if (Platform.OS !== "web") {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[AssistantScreen] sendMessage failed", errorMessage);
        if (errorMessage === "NO_FREE_MESSAGES") {
          setShowPremiumGate(true);
        } else {
          const fallback: Message = {
            id: `${Date.now()}-error`,
            text: "I ran into an issue responding. Please try again in a moment.",
            isUser: false,
            timestamp: new Date(),
          };
          appendMessage(fallback);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, inputText, isLoading, sendMessage]
  );

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      if (isLoading) {
        return;
      }
      console.log("[AssistantScreen] Suggestion selected", suggestion);
      setInputText("");
      void handleSend(suggestion);
    },
    [handleSend, isLoading]
  );

  const handleMicPress = useCallback(() => {
    console.log("[AssistantScreen] Mic pressed");
    setIsRecording(true);
    Alert.alert(
      "Voice input coming soon",
      "Audio recording is temporarily disabled while we upgrade our recorder."
    );
    setTimeout(() => {
      setIsRecording(false);
    }, 500);
  }, []);

  const handleReadAloud = useCallback(() => {
    console.log("[AssistantScreen] Read aloud pressed");
    Alert.alert("Feature coming soon", "We'll soon add the option to read responses aloud.");
  }, []);

  const closePremiumGate = useCallback(() => {
    console.log("[AssistantScreen] Closing premium gate");
    setShowPremiumGate(false);
  }, []);

  return (
    <LinearGradient
      colors={[...MAIN_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="assistant-back-button"
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <MessageCircle size={26} color="#FFFFFF" style={styles.titleIcon} />
                <Text style={styles.title}>General Assistant</Text>
              </View>
              <Text style={styles.subtitle}>
                Your on-call copilot for research, writing, planning, and more.
              </Text>
            </View>
            <FreeMessageCounter style={styles.freeMessageCounter} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionList}
          >
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(suggestion)}
                disabled={isLoading}
                testID={`assistant-suggestion-${suggestion}`}
              >
                <LinearGradient
                  colors={[...SECONDARY_BUTTON_GRADIENT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.suggestionGradient}
                >
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatWrapper}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={Platform.OS !== "android"}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => {
              const isUser = message.isUser;
              return (
                <View
                  key={message.id}
                  style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}
                  testID={`assistant-message-${message.id}`}
                >
                  <LinearGradient
                    colors={[...(isUser ? USER_MESSAGE_GRADIENT : AI_MESSAGE_GRADIENT)]}
                    locations={isUser ? undefined : [...AI_MESSAGE_LOCATIONS]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}
                  >
                    {!isUser && (
                      <View style={styles.aiLabelRow}>
                        <Sparkles size={16} color="#FFFFFF" />
                        <Text style={styles.aiLabel}>Unity Assistant</Text>
                      </View>
                    )}
                    <Text style={styles.messageText}>{message.text}</Text>
                    <Text style={styles.timestamp}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </LinearGradient>
                </View>
              );
            })}
            {isLoading && (
              <View style={[styles.messageRow, styles.aiRow]} testID="assistant-loading-indicator">
                <LinearGradient
                  colors={[...AI_MESSAGE_GRADIENT]}
                  locations={[...AI_MESSAGE_LOCATIONS]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.messageBubble, styles.aiBubble]}
                >
                  <View style={styles.typingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.typingText}>Thinking...</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputBar}>
            <TouchableOpacity
              style={[styles.controlButton, isRecording && styles.controlButtonActive]}
              onPress={handleMicPress}
              testID="assistant-mic-button"
            >
              {isRecording ? <MicOff size={20} color="#FFFFFF" /> : <Mic size={20} color="#FFFFFF" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReadAloud}
              testID="assistant-readaloud-button"
            >
              <Volume2 size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={styles.input}
                multiline
                testID="assistant-input"
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => void handleSend()}
              disabled={!inputText.trim() || isLoading}
              testID="assistant-send-button"
            >
              <LinearGradient
                colors={[...PRIMARY_BUTTON_GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Send size={18} color="#000000" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <PremiumGate
        visible={showPremiumGate}
        onClose={closePremiumGate}
        feature="Unlimited AI conversations"
        isNoFreeMessages
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
  },
  freeMessageCounter: {
    marginLeft: 12,
  },
  suggestionList: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  suggestionButton: {
    marginRight: 12,
  },
  suggestionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  suggestionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  chatWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
  },
  messages: {
    flex: 1,
    marginBottom: 12,
  },
  messageContent: {
    paddingBottom: 20,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  aiRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  aiBubble: {
    borderTopLeftRadius: 4,
  },
  aiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  aiLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  inputContainer: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  sendButton: {
    borderRadius: 22,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
});
