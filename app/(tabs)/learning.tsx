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

export default function LearningScreen() {
  const { isPremium } = useUser();
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!isPremium) {
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
                        {!isPremium && <Lock size={16} color="rgba(255, 255, 255, 0.8)" />}
                      </View>
                      <Text style={styles.categoryDescription}>
                        {category.description}
                        {!isPremium && ' (Premium)'}
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
  categoryCard: {
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
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  categoryDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 16,
  },
  duration: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});