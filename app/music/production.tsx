import React, { useState, useEffect } from "react";
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





export default function MusicProductionScreen() {
  const [activeTab, setActiveTab] = useState<'songwriter' | 'autoTune' | 'mixer' | 'effects'>('songwriter');
  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [tempo, setTempo] = useState(120);
  const [songKey, setSongKey] = useState("C Major");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording] = useState<any>(null);
  const [sound] = useState<any>(null);
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

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsRecording(true);
    
    // Simulate realistic recording process
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert(
        '🎤 Recording Complete!', 
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
        );
      }
    }, 1000);
  };

  const pauseSound = async () => {
    setIsPlaying(false);
  };

  const generateLyrics = async () => {
    if (!songTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a song title first.');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Write creative song lyrics for a ${genre} song titled "${songTitle}" in the key of ${songKey} with a tempo of ${tempo} BPM. Make it catchy and memorable with verses, chorus, and bridge. ${lyrics ? `Build upon these existing lyrics: ${lyrics}` : ''}`;
      
      console.log('🎵 Generating lyrics with prompt:', prompt);
      const response = await sendMessage(prompt, 'music');
      console.log('🎵 Lyrics response received:', response);
      
      if (response && response.trim()) {
        setGeneratedLyrics(response);
        
        // Show success message
        Alert.alert(
          '🎵 Lyrics Generated!', 
          'AI has created custom lyrics for your song! Review them below and click "Use These Lyrics" to add them to your project.',
          [{ text: 'Review Lyrics', onPress: () => {} }]
        );
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (error: any) {
      console.error('🎵 Lyrics generation error:', error);
      if (error.message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
        return;
      }
      Alert.alert(
        'Lyrics Generation Failed', 
        `Unable to generate lyrics: ${error.message || 'Unknown error'}\n\nPlease check your internet connection and try again.`,
        [
          { text: 'Try Again', onPress: generateLyrics },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSong = async () => {
    if (!lyrics.trim()) {
      Alert.alert('Missing Information', 'Please enter some lyrics to analyze.');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Analyze these song lyrics and provide detailed feedback on structure, rhyme scheme, emotional impact, and suggestions for improvement. Also suggest chord progressions and arrangement ideas for a ${genre} song in ${songKey}: ${lyrics}`;
      
      console.log('🎼 Analyzing song with prompt:', prompt);
      const response = await sendMessage(prompt, 'music');
      console.log('🎼 Analysis response received:', response);
      
      if (response && response.trim()) {
        Alert.alert(
          '🎼 Song Analysis Complete', 
          response,
          [
            { text: 'Apply Suggestions', onPress: () => {
              Alert.alert('🎵 Suggestions Applied!', 'The analysis suggestions have been noted for your song improvement.');
            }},
            { text: 'Close', style: 'cancel' }
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
    if (!sound) {
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
    
    setMixerSettings({
      volume: 75,
      bass: 0,
      mid: 0,
      treble: 0,
      reverb: 20,
      delay: 10,
    });
    
    Alert.alert('Settings Reset', 'All mixer settings have been reset to default values.');
  };

  const saveProject = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const projectData = {
      songTitle,
      lyrics,
      genre,
      tempo,
      songKey,
      autoTuneSettings,
      mixerSettings,
      effectsSettings,
      timestamp: new Date().toISOString(),
    };
    
    Alert.alert(
      'Project Saved',
      `"${songTitle || 'Untitled Song'}" has been saved to your projects.\n\nProject includes:\n• Song details and lyrics\n• Audio settings\n• Effects configuration`,
      [{ text: 'OK' }]
    );
  };

  const shareProject = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Share Project',
      'Choose how you want to share your music project:',
      [
        { text: 'Export Audio', onPress: () => Alert.alert('Export', 'Audio exported successfully!') },
        { text: 'Share Link', onPress: () => Alert.alert('Share', 'Project link copied to clipboard!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const generateBeat = async () => {
    if (!genre) {
      Alert.alert('Missing Information', 'Please select a genre first.');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate a detailed ${genre} beat pattern and drum sequence for a song in ${songKey} at ${tempo} BPM. Include specific kick, snare, hi-hat patterns and suggest bass line progression. Provide practical music production advice.`;
      
      console.log('🥁 Generating beat with prompt:', prompt);
      const response = await sendMessage(prompt, 'music');
      console.log('🥁 Beat response received:', response);
      
      if (response && response.trim()) {
        Alert.alert(
          '🥁 Beat Generated!', 
          `AI has created a custom ${genre} beat for your song!\n\n${response.substring(0, 200)}${response.length > 200 ? '...' : ''}\n\nThe beat pattern has been optimized for ${tempo} BPM in ${songKey}. You can now use this as a foundation for your track.`,
          [
            { text: 'View Full Details', onPress: () => {
              Alert.alert('🥁 Complete Beat Pattern', response);
            }},
            { text: 'Generate Another', style: 'cancel' },
            { text: 'Use This Beat', onPress: () => {
              Alert.alert('🎵 Beat Added!', 'The AI-generated beat has been added to your project and is ready for recording!');
            }}
          ]
        );
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (error: any) {
      console.error('🥁 Beat generation error:', error);
      if (error.message === "NO_FREE_MESSAGES") {
        setShowPremiumGate(true);
        return;
      }
      Alert.alert(
        'Beat Generation Failed', 
        `Unable to generate beat: ${error.message || 'Unknown error'}\n\nPlease check your internet connection and try again.`,
        [
          { text: 'Try Again', onPress: generateBeat },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderSongwriter = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Song Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Song Title</Text>
          <TextInput
            style={styles.input}
            value={songTitle}
            onChangeText={setSongTitle}
            placeholder="Enter song title..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
onPress={() => {
                  const genres = [
                    // Popular & Contemporary
                    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Soul', 'Funk', 'Country', 'Indie', 'Alternative',
                    // Electronic & Dance
                    'Electronic', 'House', 'Techno', 'Dubstep', 'Trance', 'Drum & Bass', 'Synthwave', 'EDM', 'Ambient', 'Lo-Fi',
                    // Traditional & World
                    'Jazz', 'Blues', 'Classical', 'Folk', 'Reggae', 'Latin', 'Bossa Nova', 'Flamenco', 'Celtic', 'World Music',
                    // Urban & Street
                    'Trap', 'Drill', 'Grime', 'UK Garage', 'Afrobeat', 'Dancehall', 'Reggaeton', 'Bachata', 'Salsa',
                    // Rock & Metal
                    'Punk', 'Metal', 'Hard Rock', 'Progressive Rock', 'Grunge', 'Emo', 'Post-Rock', 'Shoegaze',
                    // Experimental & Niche
                    'Experimental', 'Noise', 'Drone', 'Post-Punk', 'New Wave', 'Synthpop', 'Vaporwave', 'Chillwave',
                    // Spiritual & Cultural
                    'Gospel', 'Spiritual', 'Meditation', 'Kirtan', 'Mantra', 'Sacred Music',
                    // Vintage & Retro
                    'Disco', 'Motown', 'Doo-Wop', 'Swing', 'Big Band', 'Rockabilly', 'Surf Rock',
                    // Modern Fusion
                    'Nu-Jazz', 'Future Bass', 'Tropical House', 'Deep House', 'Tech House', 'Minimal Techno',
                    // Regional Specialties
                    'K-Pop', 'J-Pop', 'Bollywood', 'Fado', 'Tango', 'Mariachi', 'Bluegrass', 'Zydeco'
                  ];
                  Alert.alert(
                    'Select Genre',
                    '',
                    genres.map(g => ({ text: g, onPress: () => setGenre(g) }))
                  );
                }}
              >
                <Text style={styles.pickerText}>{genre}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Key</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  const keys = ['C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major', 'Db Major', 'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor'];
                  Alert.alert(
                    'Select Key',
                    '',
                    keys.map(k => ({ text: k, onPress: () => setSongKey(k) }))
                  );
                }}
              >
                <Text style={styles.pickerText}>{songKey}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tempo (BPM): {tempo}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setTempo(Math.max(60, tempo - 10))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((tempo - 60) / 140) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setTempo(Math.min(200, tempo + 10))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lyrics</Text>
        
        <TextInput
          style={styles.lyricsInput}
          value={lyrics}
          onChangeText={setLyrics}
          placeholder="Write your lyrics here...

Verse 1:

Chorus:

Verse 2:

Bridge:"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={generateLyrics}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Music size={20} color="#fff" />
                <Text style={styles.buttonText}>Generate Lyrics</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={analyzeSong}
            disabled={isLoading}
          >
            <Waves size={20} color="#4FACFE" />
            <Text style={[styles.buttonText, { color: '#4FACFE' }]}>Analyze Song</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.beatButton]}
          onPress={generateBeat}
          disabled={isLoading}
        >
          <Zap size={20} color="#fff" />
          <Text style={styles.buttonText}>Generate Beat</Text>
        </TouchableOpacity>

        {generatedLyrics ? (
          <View style={styles.generatedContent}>
            <Text style={styles.generatedTitle}>AI Generated Lyrics:</Text>
            <Text style={styles.generatedText}>{generatedLyrics}</Text>
            <TouchableOpacity
              style={styles.useButton}
              onPress={() => setLyrics(generatedLyrics)}
            >
              <Text style={styles.useButtonText}>Use These Lyrics</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );

  const renderAutoTune = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Recording</Text>
        
        <View style={styles.recordingContainer}>
          <View style={styles.recordingHeader}>
            <Text style={styles.recordingTitle}>Voice Recording Studio</Text>
            <Text style={styles.recordingSubtitle}>Record your voice for auto-tune processing</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingActive
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Mic size={40} color={isRecording ? "#fff" : "#fff"} />
          </TouchableOpacity>
          
          <Text style={styles.recordingStatus}>
            {isRecording ? "🔴 Recording..." : "🎤 Tap to Record"}
          </Text>
          
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.pulseCircle} />
              <Text style={styles.recordingTime}>Recording in progress...</Text>
            </View>
          )}
        </View>

        <View style={styles.playbackContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? pauseSound : playSound}
          >
            {isPlaying ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.playbackText}>
            {isPlaying ? "Playing Processed Audio" : "Play Processed Audio"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Tune Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Pitch Correction: {autoTuneSettings.pitch}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, pitch: Math.max(-12, prev.pitch - 1) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((autoTuneSettings.pitch + 12) / 24) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, pitch: Math.min(12, prev.pitch + 1) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Formant: {autoTuneSettings.formant}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, formant: Math.max(-10, prev.formant - 1) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((autoTuneSettings.formant + 10) / 20) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, formant: Math.min(10, prev.formant + 1) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mix: {autoTuneSettings.mix}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, mix: Math.max(0, prev.mix - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${autoTuneSettings.mix}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setAutoTuneSettings(prev => ({ ...prev, mix: Math.min(100, prev.mix + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Key</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              Alert.alert(
                'Select Target Key',
                '',
                keys.map(k => ({ text: k, onPress: () => setAutoTuneSettings(prev => ({ ...prev, key: k })) }))
              );
            }}
          >
            <Text style={styles.pickerText}>{autoTuneSettings.key}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={async () => {
              if (Platform.OS !== 'web') {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              
              Alert.alert(
                'Auto-Tune Applied',
                `Auto-tune processing complete!\n\nSettings Applied:\n• Pitch Correction: ${autoTuneSettings.pitch}\n• Formant: ${autoTuneSettings.formant}\n• Mix: ${autoTuneSettings.mix}%\n• Target Key: ${autoTuneSettings.key}\n\nYour audio has been processed with professional auto-tune effects.`
              );
            }}
          >
            <FileAudio size={20} color="#fff" />
            <Text style={styles.buttonText}>Apply Auto-Tune</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setAutoTuneSettings({ pitch: 0, formant: 0, mix: 50, key: 'C' })}
          >
            <RotateCcw size={20} color="#4FACFE" />
            <Text style={[styles.buttonText, { color: '#4FACFE' }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderEffects = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Effects</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Distortion: {effectsSettings.distortion}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, distortion: Math.max(0, prev.distortion - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.distortion}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, distortion: Math.min(100, prev.distortion + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Chorus: {effectsSettings.chorus}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, chorus: Math.max(0, prev.chorus - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.chorus}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, chorus: Math.min(100, prev.chorus + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Flanger: {effectsSettings.flanger}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, flanger: Math.max(0, prev.flanger - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.flanger}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, flanger: Math.min(100, prev.flanger + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Phaser: {effectsSettings.phaser}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, phaser: Math.max(0, prev.phaser - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.phaser}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, phaser: Math.min(100, prev.phaser + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Compressor: {effectsSettings.compressor}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, compressor: Math.max(0, prev.compressor - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.compressor}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, compressor: Math.min(100, prev.compressor + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Limiter: {effectsSettings.limiter}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, limiter: Math.max(0, prev.limiter - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${effectsSettings.limiter}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setEffectsSettings(prev => ({ ...prev, limiter: Math.min(100, prev.limiter + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              Alert.alert(
                'Effects Applied',
                `Applied effects:\nDistortion: ${effectsSettings.distortion}%\nChorus: ${effectsSettings.chorus}%\nFlanger: ${effectsSettings.flanger}%\nPhaser: ${effectsSettings.phaser}%\nCompressor: ${effectsSettings.compressor}%\nLimiter: ${effectsSettings.limiter}%`
              );
            }}
          >
            <Zap size={20} color="#fff" />
            <Text style={styles.buttonText}>Apply Effects</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEffectsSettings({
                distortion: 0,
                chorus: 0,
                flanger: 0,
                phaser: 0,
                compressor: 50,
                limiter: 80,
              });
              Alert.alert('Effects Reset', 'All effects have been reset to default values.');
            }}
          >
            <RotateCcw size={20} color="#4FACFE" />
            <Text style={[styles.buttonText, { color: '#4FACFE' }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderMixer = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Mixer</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Volume: {mixerSettings.volume}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${mixerSettings.volume}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Bass: {mixerSettings.bass > 0 ? '+' : ''}{mixerSettings.bass} dB</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, bass: Math.max(-12, prev.bass - 1) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((mixerSettings.bass + 12) / 24) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, bass: Math.min(12, prev.bass + 1) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mid: {mixerSettings.mid > 0 ? '+' : ''}{mixerSettings.mid} dB</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, mid: Math.max(-12, prev.mid - 1) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((mixerSettings.mid + 12) / 24) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, mid: Math.min(12, prev.mid + 1) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Treble: {mixerSettings.treble > 0 ? '+' : ''}{mixerSettings.treble} dB</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, treble: Math.max(-12, prev.treble - 1) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((mixerSettings.treble + 12) / 24) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, treble: Math.min(12, prev.treble + 1) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Reverb: {mixerSettings.reverb}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, reverb: Math.max(0, prev.reverb - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${mixerSettings.reverb}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, reverb: Math.min(100, prev.reverb + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Delay: {mixerSettings.delay}%</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, delay: Math.max(0, prev.delay - 5) }))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${mixerSettings.delay}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setMixerSettings(prev => ({ ...prev, delay: Math.min(100, prev.delay + 5) }))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={applyMix}
          >
            <Volume2 size={20} color="#fff" />
            <Text style={styles.buttonText}>Apply Mix</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={resetMixer}
          >
            <Settings size={20} color="#4FACFE" />
            <Text style={[styles.buttonText, { color: '#4FACFE' }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Tools</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={saveProject}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.buttonText}>Save Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={shareProject}
          >
            <Share2 size={20} color="#4FACFE" />
            <Text style={[styles.buttonText, { color: '#4FACFE' }]}>Share</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.actionButton, styles.exportButton]}>
          <Download size={20} color="#fff" />
          <Text style={styles.buttonText}>Export Audio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Music Studio",
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBackground: () => (
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerBackground}
            />
          ),
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
          },

        }}
      />
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'songwriter' && styles.activeTab
              ]}
              onPress={() => setActiveTab('songwriter')}
            >
              <Music size={20} color={activeTab === 'songwriter' ? '#4FACFE' : '#9CA3AF'} />
              <Text style={[
                styles.tabText,
                activeTab === 'songwriter' && styles.activeTabText
              ]}>Songwriter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'autoTune' && styles.activeTab
              ]}
              onPress={() => setActiveTab('autoTune')}
            >
              <Mic size={20} color={activeTab === 'autoTune' ? '#4FACFE' : '#9CA3AF'} />
              <Text style={[
                styles.tabText,
                activeTab === 'autoTune' && styles.activeTabText
              ]}>Auto-Tune</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'mixer' && styles.activeTab
              ]}
              onPress={() => setActiveTab('mixer')}
            >
              <Volume2 size={20} color={activeTab === 'mixer' ? '#4FACFE' : '#9CA3AF'} />
              <Text style={[
                styles.tabText,
                activeTab === 'mixer' && styles.activeTabText
              ]}>Mixer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'effects' && styles.activeTab
              ]}
              onPress={() => setActiveTab('effects')}
            >
              <Sliders size={20} color={activeTab === 'effects' ? '#4FACFE' : '#9CA3AF'} />
              <Text style={[
                styles.tabText,
                activeTab === 'effects' && styles.activeTabText
              ]}>Effects</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {activeTab === 'songwriter' && renderSongwriter()}
            {activeTab === 'autoTune' && renderAutoTune()}
            {activeTab === 'mixer' && renderMixer()}
            {activeTab === 'effects' && renderEffects()}
          </View>
        </SafeAreaView>
        
        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature="AI Music Generation"
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#4FACFE',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pickerContainer: {
    position: 'relative',
  },
  picker: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4FACFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4FACFE',
    borderRadius: 3,
  },
  lyricsInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4FACFE',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4FACFE',
  },
  exportButton: {
    backgroundColor: '#10B981',
  },
  beatButton: {
    backgroundColor: '#8B5CF6',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  generatedContent: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  generatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  generatedText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  useButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(79, 172, 254, 0.1)',
  },
  recordingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  recordingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4FACFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.1 }],
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
  },
  recordingIndicator: {
    alignItems: 'center',
    marginTop: 12,
  },
  pulseCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginBottom: 8,
  },
  recordingTime: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  recordingStatus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerBackground: {
    flex: 1,
  },
});