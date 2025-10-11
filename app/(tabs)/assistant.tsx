 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app/(tabs)/assistant.tsx b/app/(tabs)/assistant.tsx
index 7434787e659376faff3b54b9bf89ebafea80470e..a8d54712b86b8c1d4da46f9553ca257b70ee9af4 100644
--- a/app/(tabs)/assistant.tsx
+++ b/app/(tabs)/assistant.tsx
@@ -12,51 +12,51 @@ import {
   ActivityIndicator,
 } from "react-native";
 import { LinearGradient } from "expo-linear-gradient";
 import { SafeAreaView } from "react-native-safe-area-context";
 import { Mic, MicOff, Send, Volume2, ArrowLeft, MessageCircle, Sparkles } from "lucide-react-native";
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
-      text: "Welcome to your General AI Assistant! I can help with quick answers, brainstorming, writing, summaries, explanations, and everyday tasks across topics. What can I help you with today?",
+      text: "Hi there! I'm your on-call General Assistant. I can tackle research, writing, planning, brainstorming, tech help, and everyday problem-solving. What would you like to work on first?",
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
@@ -106,51 +106,51 @@ export default function AssistantScreen() {
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
                 <MessageCircle size={28} color="#fff" style={styles.titleIcon} />
                 <Text style={styles.title}>General Assistant</Text>
               </View>
-              <Text style={styles.subtitle}>Ask anything. Get helpful answers.</Text>
+              <Text style={styles.subtitle}>Your on-call copilot for research, writing, planning, and more.</Text>
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
 
EOF
)