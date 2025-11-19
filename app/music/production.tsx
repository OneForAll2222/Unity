import React, { useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Music,
  Mic,
  Play,
  Pause,
  Volume2,
  Settings,
  Waves,
  Zap,
  Download,
  Share2,
  Save,
  RotateCcw,
  Sliders,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAI } from "@/providers/AIProvider";
import { PremiumGate } from "@/components/PremiumGate";
import { MAIN_GRADIENT, COLORS } from "@/constants/colors";

interface AutoTuneSettings {
  pitch: number;
  formant: number;
  mix: number;
  key: string;
}

interface MixerSettings {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  reverb: number;
  delay: number;
}

interface EffectsSettings {
  distortion: number;
  chorus: number;
  flanger: number;
  phaser: number;
  compressor: number;
  limiter: number;
}

type StudioTab = "songwriter" | "autoTune" | "mixer" | "effects";

const DEFAULT_AUTOTUNE: AutoTuneSettings = {
  pitch: 0,
  formant: 0,
  mix: 50,
  key: "C",
};

const DEFAULT_MIXER: MixerSettings = {
  volume: 75,
  bass: 0,
  mid: 0,
  treble: 0,
  reverb: 20,
  delay: 10,
};

const DEFAULT_EFFECTS: EffectsSettings = {
  distortion: 0,
  chorus: 0,
  flanger: 0,
  phaser: 0,
  compressor: 50,
  limiter: 80,
};

export default function MusicProductionScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<StudioTab>("songwriter");
  const [songTitle, setSongTitle] = useState<string>("");
  const [lyricsPrompt, setLyricsPrompt] = useState<string>("");
  const [genre, setGenre] = useState<string>("Alt Pop");
  const [tempo, setTempo] = useState<number>(118);
  const [songKey, setSongKey] = useState<string>("C Minor");
  const [hasRecording, setHasRecording] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<string>("");
  const [songAnalysis, setSongAnalysis] = useState<string>("");
  const [autoTuneSettings, setAutoTuneSettings] = useState<AutoTuneSettings>(DEFAULT_AUTOTUNE);
  const [mixerSettings, setMixerSettings] = useState<MixerSettings>(DEFAULT_MIXER);
  const [effectsSettings, setEffectsSettings] = useState<EffectsSettings>(DEFAULT_EFFECTS);
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const { sendMessage, canSendMessage } = useAI();

  const tabOptions = useMemo(
    () => [
      { key: "songwriter" as const, label: "Songwriter", icon: Music },
      { key: "autoTune" as const, label: "Auto-Tune", icon: Waves },
      { key: "mixer" as const, label: "Mixer", icon: Sliders },
      { key: "effects" as const, label: "FX Lab", icon: Zap },
    ],
    []
  );

  const handleTabChange = useCallback((tab: StudioTab) => {
    console.log("[MusicProduction] Tab change", tab);
    setActiveTab(tab);
  }, []);

  const playHaptic = useCallback(async (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(style);
    }
  }, []);

  const ensureAccess = useCallback(async () => {
    const allowed = await canSendMessage();
    if (!allowed) {
      setShowPremiumGate(true);
      return false;
    }
    return true;
  }, [canSendMessage]);

  const handleGenerateLyrics = useCallback(async () => {
    if (isLoading) {
      return;
    }
    const hasAccess = await ensureAccess();
    if (!hasAccess) {
      return;
    }
    const prompt = lyricsPrompt.trim();
    if (!prompt) {
      Alert.alert("Add an idea", "Give the assistant a creative direction to start with.");
      return;
    }

    console.log("[MusicProduction] Generating lyrics", { prompt, genre, tempo, songKey });
    setIsLoading(true);
    try {
      const message = `Write lyrics for a song titled "${songTitle || "Untitled"}". Genre: ${genre}. Tempo: ${tempo} BPM. Key: ${songKey}. Vibe prompt: ${prompt}. Format with verses, pre-chorus, chorus, and bridge.`;
      const response = await sendMessage(message, "music");
      setGeneratedLyrics(response);
      await playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[MusicProduction] Lyrics generation failed", message);
      if (message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
      } else {
        Alert.alert("Could not generate lyrics", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccess, genre, isLoading, lyricsPrompt, playHaptic, sendMessage, songKey, songTitle, tempo]);

  const handleAnalyzeSong = useCallback(async () => {
    if (isLoading) {
      return;
    }
    const hasAccess = await ensureAccess();
    if (!hasAccess) {
      return;
    }
    console.log("[MusicProduction] Analyzing song");
    setIsLoading(true);
    try {
      const message = `Analyze this track concept. Title: ${songTitle || "Untitled"}. Genre: ${genre}. Tempo: ${tempo}. Key: ${songKey}. Lyrics: ${generatedLyrics || "No lyrics yet"}. Provide arrangement ideas, production notes, and emotional storytelling suggestions.`;
      const response = await sendMessage(message, "music");
      setSongAnalysis(response);
      await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[MusicProduction] Analysis failed", message);
      if (message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
      } else {
        Alert.alert("Could not analyze song", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccess, genre, generatedLyrics, isLoading, playHaptic, sendMessage, songKey, songTitle, tempo]);

  const startRecording = useCallback(async () => {
    console.log("[MusicProduction] Start recording");
    await playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecording(true);
      Alert.alert(
        "Recording captured",
        "Your vocal take is locked in and ready for processing."
      );
    }, 3000);
  }, [playHaptic]);

  const stopRecording = useCallback(async () => {
    console.log("[MusicProduction] Stop recording");
    if (!isRecording) {
      return;
    }
    await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(false);
    setHasRecording(true);
  }, [isRecording, playHaptic]);

  const handlePlayback = useCallback(async () => {
    if (isPlaying) {
      console.log("[MusicProduction] Pause playback");
      setIsPlaying(false);
      return;
    }
    if (!hasRecording) {
      Alert.alert("No audio", "Record vocals before previewing playback.");
      return;
    }
    await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(true);
    console.log("[MusicProduction] Begin simulated playback");
    setTimeout(() => {
      setIsPlaying(false);
      Alert.alert("Playback complete", "Your mix is ready for the next tweak.");
    }, 4000);
  }, [hasRecording, isPlaying, playHaptic]);

  const applyAutoTune = useCallback(async () => {
    if (!hasRecording) {
      Alert.alert("Add vocals", "Capture a vocal take before applying auto-tune.");
      return;
    }
    await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    console.log("[MusicProduction] Applying auto-tune", autoTuneSettings);
    Alert.alert("Auto-Tune applied", "Pitch correction settings locked in.");
  }, [autoTuneSettings, hasRecording, playHaptic]);

  const applyMix = useCallback(async () => {
    if (!hasRecording) {
      Alert.alert("No audio", "Record vocals before mixing.");
      return;
    }
    await playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    console.log("[MusicProduction] Applying mix", mixerSettings);
    Alert.alert("Mix updated", "Levels and ambiance refreshed.");
  }, [hasRecording, mixerSettings, playHaptic]);

  const applyEffects = useCallback(async () => {
    if (!hasRecording) {
      Alert.alert("No audio", "Record vocals before experimenting with effects.");
      return;
    }
    await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    console.log("[MusicProduction] Applying effects", effectsSettings);
    Alert.alert("FX stacked", "Creative effects layered on your track.");
  }, [effectsSettings, hasRecording, playHaptic]);

  const resetMixer = useCallback(async () => {
    await playHaptic(Haptics.ImpactFeedbackStyle.Light);
    console.log("[MusicProduction] Reset mix to defaults");
    setMixerSettings(DEFAULT_MIXER);
    Alert.alert("Mixer reset", "All channels snapped back to neutral.");
  }, [playHaptic]);

  const handleShare = useCallback(async () => {
    await playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    console.log("[MusicProduction] Share project");
    Alert.alert("Shared", "Your session file link is ready to send.");
  }, [playHaptic]);

  const handleExport = useCallback(async () => {
    await playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    console.log("[MusicProduction] Export project");
    Alert.alert("Export complete", "Rendered mix available in your downloads.");
  }, [playHaptic]);

  const renderSliderRow = (label: string, value: number, onChange: (next: number) => void, testId: string) => {
    return (
      <View style={styles.sliderRow} key={label}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <View style={styles.sliderControls}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => onChange(Math.max(value - 5, -50))}
            testID={`${testId}-decrease`}
          >
            <Text style={styles.sliderButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.sliderValue}>{value}</Text>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => onChange(Math.min(value + 5, 100))}
            testID={`${testId}-increase`}
          >
            <Text style={styles.sliderButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "songwriter":
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Creative Brief</Text>
            <TextInput
              style={styles.input}
              placeholder="Song title"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={songTitle}
              onChangeText={setSongTitle}
              testID="music-title-input"
            />
            <View style={styles.inlineInputs}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Genre"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={genre}
                onChangeText={setGenre}
                testID="music-genre-input"
              />
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Key"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={songKey}
                onChangeText={setSongKey}
                testID="music-key-input"
              />
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Tempo"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="numeric"
                value={String(tempo)}
                onChangeText={(text) => setTempo(Number(text.replace(/[^0-9]/g, "")) || 0)}
                testID="music-tempo-input"
              />
            </View>
            <TextInput
              style={[styles.input, styles.promptInput]}
              placeholder="Describe the mood, imagery, or storyline you want"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={lyricsPrompt}
              onChangeText={setLyricsPrompt}
              multiline
              testID="music-prompt-input"
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGenerateLyrics}
              testID="music-generate-lyrics"
              disabled={isLoading}
            >
              <LinearGradient
                colors={[COLORS.RICH_GOLD, COLORS.AMBER]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Sparkles size={18} color="#000" />
                )}
                <Text style={styles.primaryButtonText}>Compose Lyrics</Text>
              </LinearGradient>
            </TouchableOpacity>
            {!!generatedLyrics && (
              <View style={styles.outputCard}>
                <Text style={styles.outputTitle}>Lyric Draft</Text>
                <ScrollView style={styles.outputScroll} testID="music-lyrics-output">
                  <Text style={styles.outputText}>{generatedLyrics}</Text>
                </ScrollView>
              </View>
            )}
            {!!songAnalysis && (
              <View style={styles.outputCard}>
                <Text style={styles.outputTitle}>Production Notes</Text>
                <ScrollView style={styles.outputScroll} testID="music-analysis-output">
                  <Text style={styles.outputText}>{songAnalysis}</Text>
                </ScrollView>
              </View>
            )}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAnalyzeSong}
              testID="music-analyze-song"
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Analyze Arrangement</Text>
            </TouchableOpacity>
          </View>
        );
      case "autoTune":
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Auto-Tune Engine</Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>Scale Key</Text>
              <Text style={styles.tagValue}>{autoTuneSettings.key}</Text>
            </View>
            {renderSliderRow("Pitch", autoTuneSettings.pitch, (value) =>
              setAutoTuneSettings((prev) => ({ ...prev, pitch: value })), "autotune-pitch")}
            {renderSliderRow("Formant", autoTuneSettings.formant, (value) =>
              setAutoTuneSettings((prev) => ({ ...prev, formant: value })), "autotune-formant")}
            {renderSliderRow("Mix", autoTuneSettings.mix, (value) =>
              setAutoTuneSettings((prev) => ({ ...prev, mix: value })), "autotune-mix")}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={applyAutoTune}
              testID="music-apply-autotune"
            >
              <LinearGradient
                colors={[COLORS.RICH_GOLD, COLORS.AMBER]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Waves size={18} color="#000" />
                <Text style={styles.primaryButtonText}>Apply Auto-Tune</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      case "mixer":
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Mix Console</Text>
            {renderSliderRow("Volume", mixerSettings.volume, (value) =>
              setMixerSettings((prev) => ({ ...prev, volume: value })), "mixer-volume")}
            {renderSliderRow("Bass", mixerSettings.bass, (value) =>
              setMixerSettings((prev) => ({ ...prev, bass: value })), "mixer-bass")}
            {renderSliderRow("Mid", mixerSettings.mid, (value) =>
              setMixerSettings((prev) => ({ ...prev, mid: value })), "mixer-mid")}
            {renderSliderRow("Treble", mixerSettings.treble, (value) =>
              setMixerSettings((prev) => ({ ...prev, treble: value })), "mixer-treble")}
            {renderSliderRow("Reverb", mixerSettings.reverb, (value) =>
              setMixerSettings((prev) => ({ ...prev, reverb: value })), "mixer-reverb")}
            {renderSliderRow("Delay", mixerSettings.delay, (value) =>
              setMixerSettings((prev) => ({ ...prev, delay: value })), "mixer-delay")}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.rowButton]}
                onPress={resetMixer}
                testID="music-reset-mixer"
              >
                <RotateCcw size={18} color="#fff" />
                <Text style={styles.secondaryButtonText}>Reset Mix</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.rowButton]}
                onPress={applyMix}
                testID="music-apply-mix"
              >
                <LinearGradient
                  colors={[COLORS.RICH_GOLD, COLORS.AMBER]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <Settings size={18} color="#000" />
                  <Text style={styles.primaryButtonText}>Commit Mix</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );
      case "effects":
      default:
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>FX Playground</Text>
            {renderSliderRow("Distortion", effectsSettings.distortion, (value) =>
              setEffectsSettings((prev) => ({ ...prev, distortion: value })), "effects-distortion")}
            {renderSliderRow("Chorus", effectsSettings.chorus, (value) =>
              setEffectsSettings((prev) => ({ ...prev, chorus: value })), "effects-chorus")}
            {renderSliderRow("Flanger", effectsSettings.flanger, (value) =>
              setEffectsSettings((prev) => ({ ...prev, flanger: value })), "effects-flanger")}
            {renderSliderRow("Phaser", effectsSettings.phaser, (value) =>
              setEffectsSettings((prev) => ({ ...prev, phaser: value })), "effects-phaser")}
            {renderSliderRow("Compressor", effectsSettings.compressor, (value) =>
              setEffectsSettings((prev) => ({ ...prev, compressor: value })), "effects-compressor")}
            {renderSliderRow("Limiter", effectsSettings.limiter, (value) =>
              setEffectsSettings((prev) => ({ ...prev, limiter: value })), "effects-limiter")}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={applyEffects}
              testID="music-apply-effects"
            >
              <LinearGradient
                colors={[COLORS.RICH_GOLD, COLORS.AMBER]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Zap size={18} color="#000" />
                <Text style={styles.primaryButtonText}>Print FX Chain</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <LinearGradient
      colors={[...MAIN_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
      <Stack.Screen
        options={{
          title: "Music Studio",
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: COLORS.TEXT_PRIMARY,
          headerTransparent: true,
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      />
      <View style={styles.overlay} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: 120 + insets.top,
            paddingBottom: 48 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Producer Mode</Text>
            <Text style={styles.heroSubtitle}>
              Shape vocals, craft lyrics, and print mixes with a studio-grade AI companion.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={isRecording ? stopRecording : startRecording}
                testID="music-record-button"
              >
                {isRecording ? <Mic color="#000" size={20} /> : <Mic color="#000" size={20} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handlePlayback}
                testID="music-playback-button"
              >
                {isPlaying ? <Pause color="#000" size={20} /> : <Play color="#000" size={20} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleExport}
                testID="music-export-button"
              >
                <Download color="#000" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroStatus}>
              {isRecording
                ? "Recording in progress..."
                : isPlaying
                ? "Previewing mix"
                : hasRecording
                ? "Last take saved"
                : "Ready to capture magic"}
            </Text>
          </View>
          <View style={styles.heroMeters}>
            <View style={styles.meterColumn}>
              <Text style={styles.meterLabel}>Input</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { height: hasRecording ? "85%" : "30%" }]} />
              </View>
            </View>
            <View style={styles.meterColumn}>
              <Text style={styles.meterLabel}>Output</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { height: isPlaying ? "90%" : "45%" }]} />
              </View>
            </View>
            <View style={styles.meterColumn}>
              <Text style={styles.meterLabel}>FX</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { height: effectsSettings.chorus }]} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tabOptions.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabChange(tab.key)}
                testID={`music-tab-${tab.key}`}
              >
                <IconComponent color={isActive ? "#000" : "#fff"} size={18} />
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {renderTabContent()}

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            testID="music-share-button"
          >
            <Share2 size={18} color="#fff" />
            <Text style={styles.secondaryButtonText}>Share Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert("Saved", "Project snapshot saved to your library.")}
            testID="music-save-button"
          >
            <Save size={18} color="#fff" />
            <Text style={styles.secondaryButtonText}>Save Snapshot</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert("Monitor", "Headphone mix toggled.")}
            testID="music-monitor-button"
          >
            <Volume2 size={18} color="#fff" />
            <Text style={styles.secondaryButtonText}>Monitor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        feature="Music Production Studio"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 24,
  },
  heroCard: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    gap: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroInfo: {
    flex: 1,
    gap: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.TEXT_SECONDARY,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
  },
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.RICH_GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatus: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  heroMeters: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
  },
  meterColumn: {
    alignItems: "center",
    gap: 8,
  },
  meterLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  meterTrack: {
    width: 18,
    height: 110,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  meterFill: {
    width: "100%",
    backgroundColor: COLORS.RICH_GOLD,
    borderRadius: 10,
  },
  tabBar: {
    gap: 12,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.RICH_GOLD,
    borderColor: COLORS.RICH_GOLD,
  },
  tabButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: COLORS.TEXT_ON_GOLD,
  },
  panel: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  promptInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inlineInput: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_ON_GOLD,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  secondaryButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "600",
  },
  outputCard: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  outputScroll: {
    maxHeight: 220,
  },
  outputText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  rowButton: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  tag: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  tagValue: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sliderLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    flex: 1,
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "700",
  },
  sliderValue: {
    width: 40,
    textAlign: "center",
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "600",
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
});
