import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { specialists } from "@/constants/specialists";
import * as Haptics from "expo-haptics";
import { Music, Lock } from "lucide-react-native";
import { useUser } from "@/providers/UserProvider";
import { PremiumGate } from "@/components/PremiumGate";
import { FreeMessageCounter } from "@/components/FreeMessageCounter";
import { MAIN_GRADIENT, PRIMARY_BUTTON_GRADIENT } from "@/constants/colors";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function SpecialistsScreen() {
  const { isPremium } = useUser();
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);
  const [blockedFeature, setBlockedFeature] = useState<string>('');
  const insets = useSafeAreaInsets();
  const tabBarHeight = 65 + insets.bottom;

  const handleSpecialistPress = (specialistId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const specialist = specialists.find(s => s.id === specialistId);
    const isFreeSpecialist = specialist?.isFree || specialist?.tier !== 'premium';
    
    if (!isPremium && !isFreeSpecialist) {
      setBlockedFeature('AI Specialists Chat');
      setShowPremiumGate(true);
      return;
    }
    
    router.push(`/chat/${specialistId}`);
  };

  const handleMusicStudioPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Specialists] Navigating to Music Studio');
    router.push('/music/production');
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
            <View style={styles.headerContent}>
              <Text style={styles.title}>One for All</Text>
              <Text style={styles.subtitle}>Powered by ChatGPT-5</Text>
              <Text style={styles.description}>Choose Your AI Specialist</Text>
            </View>
            <FreeMessageCounter />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          {/* Music Studio Feature Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleMusicStudioPress}
            activeOpacity={0.8}
            testID="music-studio-button"
          >
            <LinearGradient
              colors={PRIMARY_BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureContent}>
                <View style={styles.featureIconContainer}>
                  <Music size={28} color="#fff" />
                </View>
                <View style={styles.featureTextContainer}>
                  <View style={styles.featureTitleContainer}>
                    <Text style={styles.featureTitle}>🎵 Music Studio</Text>
                    {!isPremium && <Lock size={16} color="#fff" />}
                  </View>
                  <Text style={styles.featureDescription}>
                    Create, record, and produce music with AI-powered tools
                    {!isPremium && ' (Premium)'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>AI Specialists</Text>
          
          <View style={styles.grid}>
            {specialists.map((specialist) => {
              const Icon = specialist.icon;
              const isFreeSpecialist = specialist.isFree || specialist.tier !== 'premium';
              const showLock = !isPremium && !isFreeSpecialist;
              
              return (
                <TouchableOpacity
                  key={specialist.id}
                  style={styles.card}
                  onPress={() => handleSpecialistPress(specialist.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={specialist.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.iconContainer}>
                      <Icon size={32} color="#fff" />
                    </View>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>{specialist.name}</Text>
                      {showLock && <Lock size={14} color="rgba(255, 255, 255, 0.8)" />}
                      {isFreeSpecialist && (
                        <View style={styles.freeTag}>
                          <Text style={styles.freeText}>FREE</Text>
                        </View>
                      )}
                      {specialist.tier === 'premium' && isPremium && (
                        <View style={styles.premiumTag}>
                          <Text style={styles.premiumText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDescription}>
                      {specialist.description}
                      {showLock && ' (Premium)'}
                    </Text>
                    <View style={styles.colorIndicator} />
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        
        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature={blockedFeature}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Increased to account for tab bar
  },
  featureCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    boxShadow: "0px 4px 8px rgba(79, 172, 254, 0.3)",
  },
  featureGradient: {
    padding: 20,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    height: cardWidth,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    boxShadow: "0px 4px 8px rgba(139, 92, 246, 0.3)",
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 16,
  },
  colorIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  freeTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  freeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumTag: {
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});