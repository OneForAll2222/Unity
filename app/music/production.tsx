 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app/music/production.tsx b/app/music/production.tsx
index c03ad2a04196e08a87ea3e54e9d4e54c3deb88c9..f4b7d36edd2afdf9dcca4213e31d0071d12bba78 100644
--- a/app/music/production.tsx
+++ b/app/music/production.tsx
@@ -1,137 +1,130 @@
-import React, { useState, useEffect } from "react";
+import React, { useState } from "react";
 import {
   StyleSheet,
   Text,
   View,
   TextInput,
   TouchableOpacity,
   ScrollView,
   Alert,
   ActivityIndicator,
   Platform,
 } from "react-native";
 import { LinearGradient } from "expo-linear-gradient";
 import { SafeAreaView } from "react-native-safe-area-context";
 import {
   Music,
   Mic,
   Play,
   Pause,
   Volume2,
   Settings,
   Waves,
   FileAudio,
   Zap,
   Download,
   Share2,
   Save,
   RotateCcw,
   Sliders,
 } from "lucide-react-native";
 import { Stack } from "expo-router";
 import { useAI } from "@/providers/AIProvider";
 import { PremiumGate } from "@/components/PremiumGate";
 // Audio recording temporarily disabled due to expo-av deprecation
 import * as Haptics from "expo-haptics";
 import { MAIN_GRADIENT, COLORS } from "@/constants/colors";
 
 
 
 
 export default function MusicProductionScreen() {
   const [activeTab, setActiveTab] = useState<'songwriter' | 'autoTune' | 'mixer' | 'effects'>('songwriter');
   const [songTitle, setSongTitle] = useState("");
   const [lyrics, setLyrics] = useState("");
   const [genre, setGenre] = useState("Pop");
   const [tempo, setTempo] = useState(120);
   const [songKey, setSongKey] = useState("C Major");
   const [isRecording, setIsRecording] = useState(false);
   const [isPlaying, setIsPlaying] = useState(false);
-  const [recording] = useState<any>(null);
-  const [sound] = useState<any>(null);
+  const [hasRecording, setHasRecording] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [generatedLyrics, setGeneratedLyrics] = useState("");
   const [autoTuneSettings, setAutoTuneSettings] = useState({
     pitch: 0,
     formant: 0,
     mix: 50,
     key: "C",
   });
   const [mixerSettings, setMixerSettings] = useState({
     volume: 75,
     bass: 0,
     mid: 0,
     treble: 0,
     reverb: 20,
     delay: 10,
   });
   const [effectsSettings, setEffectsSettings] = useState({
     distortion: 0,
     chorus: 0,
     flanger: 0,
     phaser: 0,
     compressor: 50,
     limiter: 80,
   });
   const [showPremiumGate, setShowPremiumGate] = useState(false);
   
   const { sendMessage } = useAI();
 
-  useEffect(() => {
-    return sound
-      ? () => {
-          sound.unloadAsync();
-        }
-      : undefined;
-  }, [sound]);
-
   const startRecording = async () => {
     if (Platform.OS !== 'web') {
       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     }
     
     setIsRecording(true);
     
     // Simulate realistic recording process
     setTimeout(() => {
       setIsRecording(false);
+      setHasRecording(true);
       Alert.alert(
-        '🎤 Recording Complete!', 
+        '🎤 Recording Complete!',
         'Your voice recording has been captured successfully!\n\n🎵 Audio Quality: Professional\n⏱️ Duration: 3.2 seconds\n🎛️ Format: WAV 44.1kHz\n\nYour audio is now ready for auto-tune processing and mixing.',
         [
           { text: 'Save Recording', style: 'cancel' },
           { text: 'Process with Auto-Tune', onPress: () => {
             Alert.alert('🎵 Auto-Tune Applied!', 'Your audio has been processed with professional auto-tune effects and is ready for mixing and export!');
           }}
         ]
       );
     }, 3000);
   };
 
   const stopRecording = async () => {
     setIsRecording(false);
+    setHasRecording(true);
   };
 
   const playSound = async () => {
     if (Platform.OS !== 'web') {
       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     }
     
     setIsPlaying(true);
     
     // Simulate realistic audio playback with progress
     let progress = 0;
     const interval = setInterval(() => {
       progress += 20;
       if (progress >= 100) {
         clearInterval(interval);
         setIsPlaying(false);
         Alert.alert(
           '🎵 Playback Complete', 
           'Your processed audio with auto-tune effects has finished playing.\n\n🎧 Audio Analysis:\n• Pitch correction applied\n• Professional mixing quality\n• Ready for export\n\nWould you like to export or continue editing?',
           [
             { text: 'Continue Editing', style: 'cancel' },
             { text: 'Export Audio', onPress: () => {
               Alert.alert('📁 Export Complete!', 'Your music has been exported successfully! Check your downloads folder.');
             }}
           ]
@@ -215,51 +208,51 @@ export default function MusicProductionScreen() {
           ]
         );
       } else {
         throw new Error('Empty response from AI');
       }
     } catch (error: any) {
       console.error('🎼 Song analysis error:', error);
       if (error.message === "NO_FREE_MESSAGES") {
         setShowPremiumGate(true);
         return;
       }
       Alert.alert(
         'Song Analysis Failed', 
         `Unable to analyze song: ${error.message || 'Unknown error'}\n\nPlease check your internet connection and try again.`,
         [
           { text: 'Try Again', onPress: analyzeSong },
           { text: 'Cancel', style: 'cancel' }
         ]
       );
     } finally {
       setIsLoading(false);
     }
   };
 
   const applyMix = async () => {
-    if (!sound) {
+    if (!hasRecording) {
       Alert.alert('No Audio', 'Please record some audio first to apply mixer settings.');
       return;
     }
 
     try {
       if (Platform.OS !== 'web') {
         await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       }
       
       // In a real app, you would apply the mixer settings to the audio
       // For now, we'll just show a success message
       Alert.alert(
         'Mix Applied',
         `Applied settings:\nVolume: ${mixerSettings.volume}%\nBass: ${mixerSettings.bass > 0 ? '+' : ''}${mixerSettings.bass} dB\nMid: ${mixerSettings.mid > 0 ? '+' : ''}${mixerSettings.mid} dB\nTreble: ${mixerSettings.treble > 0 ? '+' : ''}${mixerSettings.treble} dB\nReverb: ${mixerSettings.reverb}%\nDelay: ${mixerSettings.delay}%`
       );
     } catch (err) {
       console.error('Failed to apply mix', err);
       Alert.alert('Error', 'Failed to apply mixer settings');
     }
   };
 
   const resetMixer = () => {
     if (Platform.OS !== 'web') {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     } 
EOF
)
        