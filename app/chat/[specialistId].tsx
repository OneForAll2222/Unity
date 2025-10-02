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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Code, Copy, Check, Music, Image as ImageIcon, Download, ArrowLeft } from "lucide-react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { specialists } from "@/constants/specialists";
import { useAI } from "@/providers/AIProvider";
import { useUser } from "@/providers/UserProvider";
import { PremiumGate } from "@/components/PremiumGate";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  code?: string;
  image?: {
    base64Data: string;
    mimeType: string;
    prompt?: string;
  };
}
import { COLORS, MAIN_GRADIENT, AI_MESSAGE_GRADIENT, AI_MESSAGE_LOCATIONS } from "@/constants/colors";

export default function ChatScreen() {
  const params = useLocalSearchParams<{ specialistId?: string | string[] }>();
  const specialistIdParam = params.specialistId;
  const resolvedSpecialistId = Array.isArray(specialistIdParam) ? specialistIdParam[0] : (specialistIdParam ?? "");
  const specialist = specialists.find((s) => s.id === resolvedSpecialistId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [showCodeAnalyzer, setShowCodeAnalyzer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, analyzeCode, generateImage } = useAI();
  const { username } = useUser();

  useEffect(() => {
    if (specialist) {
      setMessages([
        {
          id: "1",
          text: specialist.welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [specialist]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !specialist) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // For image generator, check if user is requesting an image
      if (specialist.id === "image-generator" && isImageRequest(currentInput)) {
        setIsGeneratingImage(true);
        
        // First send a text response acknowledging the request
        const acknowledgment = await sendMessage(currentInput, specialist.id);
        const ackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: acknowledgment,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, ackMessage]);
        
        // Then generate the image
        try {
          const generatedImage = await generateImage(currentInput);
          const imageMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Here's your generated image! 🎨✨",
            isUser: false,
            timestamp: new Date(),
            image: {
              ...generatedImage,
              prompt: currentInput,
            },
          };
          setMessages((prev) => [...prev, imageMessage]);
        } catch (error: any) {
          if (error.message === "NO_FREE_MESSAGES") {
            setShowPremiumGate(true);
            return;
          }
          // Handle other image generation errors
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "I apologize, but I encountered an issue generating your image. Please try again with a different description or check your connection.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsGeneratingImage(false);
        }
      } else {
        // Regular text response
        const response = await sendMessage(currentInput, specialist.id);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
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

  const isImageRequest = (text: string): boolean => {
    const imageKeywords = [
      'create', 'generate', 'make', 'draw', 'design', 'paint', 'sketch',
      'image', 'picture', 'photo', 'artwork', 'illustration', 'logo',
      'portrait', 'landscape', 'abstract', 'realistic', 'cartoon',
      'show me', 'can you create', 'i want', 'i need'
    ];
    
    const lowerText = text.toLowerCase();
    return imageKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleCodeAnalysis = async () => {
    if (!codeInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: "Please analyze this code:",
      isUser: true,
      timestamp: new Date(),
      code: codeInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCodeInput("");
    setShowCodeAnalyzer(false);
    setIsLoading(true);

    try {
      const analysis = await analyzeCode(codeInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: analysis,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      if (error.message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
        return;
      }
      Alert.alert("Error", "Failed to analyze code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadImage = (imageData: string, mimeType: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (Platform.OS === 'web') {
      // Web download
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${imageData}`;
      link.download = `generated-image-${Date.now()}.${mimeType.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Mobile - show alert for now (could implement file saving later)
      Alert.alert("Image Ready", "Your generated image is displayed above. You can take a screenshot to save it.");
    }
  };

  if (!specialist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Specialist not found</Text>
      </View>
    );
  }

  const Icon = specialist.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: specialist.name,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: COLORS.TEXT_PRIMARY,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              testID="chat-back-button"
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <ArrowLeft size={20} color={COLORS.TEXT_PRIMARY} />
              <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 16, marginLeft: 6 }}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => null,
        }}
      />
      <LinearGradient
        colors={MAIN_GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.chatContainer,
              specialist.id === "coding" && styles.codingChatContainer
            ]}
            keyboardVerticalOffset={100}
          >
            <LinearGradient
              colors={[COLORS.DEEP_BLACK + '99', COLORS.CHARCOAL + '99', COLORS.DEEP_BLACK + 'CC'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chatBackground}
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
                <View key={message.id}>
                  {message.isUser ? (
                    <LinearGradient
                      colors={[COLORS.CHARCOAL, COLORS.DARK_GRAY] as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.messageBubble, styles.userMessage]}
                    >
                      <View style={styles.messageHeader}>
                        <Text style={[styles.senderName, styles.userSenderName]}>
                          {username}
                        </Text>
                      </View>
                      <Text style={[styles.messageText, styles.userMessageText]}>
                        {message.text}
                      </Text>
                      {message.code && (
                        <View style={styles.codeBlock}>
                          <View style={styles.codeHeader}>
                            <Text style={styles.codeLabel}>Code</Text>
                            <TouchableOpacity
                              onPress={() => copyCode(message.code!)}
                              style={styles.copyButton}
                            >
                              {copiedCode === message.code ? (
                                <Check size={16} color="#10B981" />
                              ) : (
                                <Copy size={16} color="#6B7280" />
                              )}
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.codeText}>{message.code}</Text>
                        </View>
                      )}
                      <Text style={[styles.timestamp, styles.userTimestamp]}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={AI_MESSAGE_GRADIENT as any}
                      locations={AI_MESSAGE_LOCATIONS as any}
                      start={{ x: 0.5, y: 0.5 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.messageBubble,
                        styles.aiMessage,
                        styles.aiGradientMessage
                      ]}
                    >
                      <View style={styles.messageHeader}>
                        <View style={styles.specialistIcon}>
                          <Icon size={16} color="#FFFFFF" />
                        </View>
                        <Text style={[
                          styles.senderName,
                          styles.aiSenderName,
                          styles.gradientSenderName,
                          specialist.id === "therapist" && styles.therapistSenderName
                        ]}>
                          {specialist.name}
                        </Text>
                      </View>
                      <Text style={[
                        styles.messageText,
                        styles.aiMessageText,
                        styles.gradientMessageText,
                        specialist.id === "therapist" && styles.therapistMessageText
                      ]}>
                        {message.text}
                      </Text>
                      {message.image && message.image.base64Data ? (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: `data:${message.image.mimeType};base64,${message.image.base64Data}` }}
                            style={styles.generatedImage}
                            resizeMode="contain"
                          />
                          <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => downloadImage(message.image!.base64Data, message.image!.mimeType)}
                          >
                            <Download size={16} color="#fff" />
                            <Text style={styles.downloadButtonText}>Save</Text>
                          </TouchableOpacity>
                          {message.image.prompt && (
                            <Text style={styles.imagePrompt}>
                              Prompt: {message.image.prompt}
                            </Text>
                          )}
                        </View>
                      ) : null}
                      {message.code && (
                        <View style={styles.codeBlock}>
                          <View style={styles.codeHeader}>
                            <Text style={styles.codeLabel}>Code</Text>
                            <TouchableOpacity
                              onPress={() => copyCode(message.code!)}
                              style={styles.copyButton}
                            >
                              {copiedCode === message.code ? (
                                <Check size={16} color="#10B981" />
                              ) : (
                                <Copy size={16} color="#6B7280" />
                              )}
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.codeText}>{message.code}</Text>
                        </View>
                      )}
                      <Text style={[
                        styles.timestamp,
                        styles.gradientTimestamp,
                        specialist.id === "therapist" && styles.therapistTimestamp
                      ]}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </LinearGradient>
                  )}
                </View>

              ))}
              {(isLoading || isGeneratingImage) && (
                <LinearGradient
                  colors={AI_MESSAGE_GRADIENT as any}
                  locations={AI_MESSAGE_LOCATIONS as any}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.loadingContainer,
                    styles.loadingGradientContainer
                  ]}
                >
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={[
                    styles.loadingText,
                    styles.loadingGradientText,
                    specialist.id === "therapist" && styles.therapistLoadingText
                  ]}>
                    {isGeneratingImage ? "Creating your image..." : `${specialist.name} is thinking...`}
                  </Text>
                </LinearGradient>
              )}
              </ScrollView>
            </LinearGradient>

            {showCodeAnalyzer && specialist.id === "coding" ? (
              <View style={[
                styles.codeAnalyzerContainer,
                specialist.id === "coding" && styles.codingAnalyzerContainer
              ]}>
                <View style={styles.codeAnalyzerHeader}>
                  <Text style={[
                    styles.codeAnalyzerTitle,
                    specialist.id === "coding" && styles.codingAnalyzerTitle
                  ]}>Code Analyzer</Text>
                  <TouchableOpacity
                    onPress={() => setShowCodeAnalyzer(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.codeInput,
                    specialist.id === "coding" && styles.codingCodeInput
                  ]}
                  value={codeInput}
                  onChangeText={setCodeInput}
                  placeholder="Paste your code here..."
                  placeholderTextColor={specialist.id === "coding" ? "#999" : "#999"}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={handleCodeAnalysis}
                  disabled={!codeInput.trim() || isLoading}
                >
                  <Text style={styles.analyzeButtonText}>Analyze Code</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[
                styles.inputContainer,
                specialist.id === "coding" && styles.codingInputContainer
              ]}>
                <TextInput
                  style={[
                    styles.textInput,
                    { maxHeight: 100 },
                    specialist.id === "coding" && styles.codingTextInput
                  ]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={`Ask ${specialist.name}...`}
                  placeholderTextColor={specialist.id === "coding" ? "#999" : "#999"}
                  multiline
                  onSubmitEditing={handleSend}
                />
                
                {specialist.id === "coding" && (
                  <TouchableOpacity
                    style={styles.codeButton}
                    onPress={() => setShowCodeAnalyzer(true)}
                    disabled={isLoading}
                  >
                    <Code size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                {specialist.id === "music" && (
                  <TouchableOpacity
                    style={styles.musicButton}
                    onPress={() => router.push('/music/production')}
                    disabled={isLoading}
                  >
                    <Music size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                {specialist.id === "image-generator" && (
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={() => setInputText("Create a beautiful ")}
                    disabled={isLoading || isGeneratingImage}
                  >
                    <ImageIcon size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isLoading || isGeneratingImage}
                >
                  <Send size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
        
        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature="AI Messages"
          isNoFreeMessages={true}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    overflow: "hidden",
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 10,
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
    shadowColor: "rgba(124, 58, 237, 0.5)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
    borderColor: "transparent",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  specialistIcon: {
    marginRight: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  userSenderName: {
    color: "#FFFFFF",
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    fontWeight: "700",
  },
  aiSenderName: {
    color: "#FFFFFF",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.2)',
  },
  aiMessageText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  codingChatContainer: {
    backgroundColor: "#000",
  },

  codeBlock: {
    marginTop: 8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  copyButton: {
    padding: 4,
  },
  codeText: {
    fontSize: 14,
    color: "#E5E7EB",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
    color: "#6B7280",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "transparent",
    borderRadius: 18,
    alignSelf: "flex-start",
    borderWidth: 0,
    borderColor: "transparent",
  },
  loadingText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 215, 0, 0.3)",
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  codeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  musicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B8860B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B8860B",
    justifyContent: "center",
    alignItems: "center",
  },
  codeAnalyzerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  codeAnalyzerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  codeAnalyzerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#6B7280",
  },
  codeInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    height: 150,
    marginBottom: 12,
    color: "#1F2937",
  },
  analyzeButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  codingTextInput: {
    backgroundColor: "#1F2937",
    color: "#fff",
  },
  codingInputContainer: {
    backgroundColor: "#000",
    borderTopColor: "#374151",
  },
  codingAnalyzerContainer: {
    backgroundColor: "#000",
    borderTopColor: "#374151",
  },
  codingAnalyzerTitle: {
    color: "#fff",
  },
  codingCodeInput: {
    backgroundColor: "#1F2937",
    color: "#fff",
  },

  aiGradientMessage: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientSenderName: {
    color: "#FFFFFF",
    fontWeight: "800",
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
    fontSize: 13,
  },
  gradientMessageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textShadow: '0.5px 0.5px 2px rgba(0, 0, 0, 0.3)',
    lineHeight: 24,
  },
  gradientTimestamp: {
    color: "rgba(255, 255, 255, 0.85)",
    opacity: 1,
    textShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.4)',
    fontWeight: "500",
  },
  loadingGradientContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  loadingGradientText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  chatBackground: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
    textShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.4)',
    fontWeight: "500",
  },
  therapistSenderName: {
    color: "#FFFFFF",
    fontWeight: "900",
    textShadow: '1.5px 1.5px 4px rgba(0, 0, 0, 0.7)',
    fontSize: 14,
  },
  therapistMessageText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)',
    lineHeight: 26,
  },
  therapistTimestamp: {
    color: "rgba(255, 255, 255, 0.95)",
    opacity: 1,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
    fontWeight: "600",
  },
  therapistLoadingText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textShadow: '1.5px 1.5px 3px rgba(0, 0, 0, 0.6)',
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  generatedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  downloadButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  imagePrompt: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    padding: 8,
    textShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.5)',
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B8860B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});