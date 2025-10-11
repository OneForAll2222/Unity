import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { specialists } from "@/constants/specialists";
import * as Haptics from "expo-haptics";
import { Lock } from "lucide-react-native";
import { useUser } from "@/providers/UserProvider";
import { PremiumGate } from "@/components/PremiumGate";
import { MAIN_GRADIENT, COLORS } from "@/constants/colors";

export default function SpecialistsScreen() {
  const { hasUnlimitedAccess } = useUser();
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");

  const handleSpecialistPress = (specialistId: string, isFree?: boolean, tier?: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!isFree && tier === "premium" && !hasUnlimitedAccess()) {
      setSelectedSpecialist(specialistId);
      setShowPremiumGate(true);
      return;
    }

    router.push(`/chat/${specialistId}`);
  };

  return (
    <LinearGradient
      colors={MAIN_GRADIENT as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Specialists</Text>
          <Text style={styles.subtitle}>Choose your expert assistant</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== "android"}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === "android"}
        >
          {specialists.map((specialist) => {
            const Icon = specialist.icon;
            const isPremium = specialist.tier === "premium";
            const isFree = specialist.isFree === true;
            const isLocked = isPremium && !hasUnlimitedAccess();

            return (
              <TouchableOpacity
                key={specialist.id}
                style={styles.specialistCard}
                onPress={() =>
                  handleSpecialistPress(specialist.id, isFree, specialist.tier)
                }
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={specialist.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Icon size={32} color="#fff" strokeWidth={2} />
                    </View>
                    <View style={styles.textContent}>
                      <View style={styles.titleRow}>
                        <Text style={styles.specialistName}>
                          {specialist.name}
                        </Text>
                        {isLocked && (
                          <Lock size={16} color="rgba(255, 255, 255, 0.9)" />
                        )}
                      </View>
                      <Text style={styles.specialistDescription}>
                        {specialist.description}
                      </Text>
                      {isFree && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                      )}
                      {isPremium && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature="Premium AI Specialists"
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
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  specialistCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  specialistName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  specialistDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 8,
  },
  freeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  premiumBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
});
