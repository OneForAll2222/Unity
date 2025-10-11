import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { learningCategories } from "@/constants/learning";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Lock } from "lucide-react-native";
import { useUser } from "@/providers/UserProvider";
import { PremiumGate } from "@/components/PremiumGate";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2; // Account for padding and margin

export default function LearningScreen() {
  const { hasUnlimitedAccess } = useUser();
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);
  // Trial and subscription users also have unlimited access, so reuse the helper.
  const userHasUnlimitedAccess = hasUnlimitedAccess();

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!userHasUnlimitedAccess) {
      setShowPremiumGate(true);
      return;
    }

    router.push(`/learning/${categoryId}`);
  };

  return (
    <LinearGradient
      colors={["#7C3AED", "#2563EB", "#DB2777"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Hub</Text>
          <Text style={styles.subtitle}>Explore Professional Fields</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <View style={styles.grid}>
            {learningCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={category.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.iconContainer}>
                        <Icon size={28} color="#fff" />
                      </View>
                      <View style={styles.textContent}>
                        <View style={styles.categoryTitleContainer}>
                          <Text style={styles.categoryTitle}>{category.title}</Text>
                          {!userHasUnlimitedAccess && (
                            <Lock size={16} color="rgba(255, 255, 255, 0.8)" />
                          )}
                        </View>
                        <Text style={styles.categoryDescription}>
                          {category.description}
                          {!userHasUnlimitedAccess && ' (Premium)'}
                        </Text>
                        <View style={styles.statsContainer}>
                          <Text style={styles.lessonCount}>
                            {category.lessonCount} Lessons
                          </Text>
                          <Text style={styles.duration}>{category.duration}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        
        <PremiumGate
          visible={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
          feature="Learning Courses"
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
    paddingBottom: 120, // Account for tab bar
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryCard: {
    width: cardWidth,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 16,
    height: 180,
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  textContent: {
    flex: 1,
    alignItems: "center",
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginRight: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
    lineHeight: 16,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  lessonCount: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  duration: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});