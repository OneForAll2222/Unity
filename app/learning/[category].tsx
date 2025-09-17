import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import { learningCategories, lessons } from "@/constants/learning";
import { PlayCircle, CheckCircle, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function CategoryScreen() {
  const { category: categoryId } = useLocalSearchParams();
  const category = learningCategories.find((c) => c.id === categoryId);
  const categoryLessons = lessons[categoryId as string] || [];
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const handleLessonPress = (lessonId: string, isLocked: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isLocked) {
      Alert.alert(
        "Lesson Locked",
        "Complete previous lessons to unlock this one."
      );
      return;
    }

    if (completedLessons.includes(lessonId)) {
      Alert.alert("Lesson Completed", "You've already completed this lesson!");
    } else {
      Alert.alert(
        "Start Lesson",
        "Would you like to start this lesson?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start",
            onPress: () => {
              setCompletedLessons([...completedLessons, lessonId]);
              Alert.alert("Great job!", "You've completed the lesson!");
            },
          },
        ]
      );
    }
  };

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  const Icon = category.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: category.title,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#fff',

        }}
      />
      <LinearGradient
        colors={category.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.header}>
            <View style={styles.categoryInfo}>
              <View style={styles.iconContainer}>
                <Icon size={32} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{category.title}</Text>
                <Text style={styles.subtitle}>{category.description}</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {completedLessons.length} / {categoryLessons.length} Completed
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${categoryLessons.length ? (completedLessons.length / categoryLessons.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.lessonsContainer}
            contentContainerStyle={styles.lessonsContent}
            showsVerticalScrollIndicator={false}
          >
            {categoryLessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isLocked = index > 0 && !completedLessons.includes(categoryLessons[index - 1].id);

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    isLocked && styles.lockedCard,
                  ]}
                  onPress={() => handleLessonPress(lesson.id, isLocked)}
                  activeOpacity={0.8}
                  disabled={false}
                >
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonIcon}>
                      {isCompleted ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : isLocked ? (
                        <Lock size={24} color="#9CA3AF" />
                      ) : (
                        <PlayCircle size={24} color="#3B82F6" />
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[
                        styles.lessonTitle,
                        isLocked && styles.lockedText,
                      ]}>
                        {lesson.title}
                      </Text>
                      <Text style={[
                        styles.lessonDescription,
                        isLocked && styles.lockedText,
                      ]}>
                        {lesson.description}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonDuration}>
                          {lesson.duration}
                        </Text>
                        {lesson.difficulty && (
                          <View style={[
                            styles.difficultyBadge,
                            lesson.difficulty === 'Beginner' && styles.beginnerBadge,
                            lesson.difficulty === 'Intermediate' && styles.intermediateBadge,
                            lesson.difficulty === 'Advanced' && styles.advancedBadge,
                          ]}>
                            <Text style={styles.difficultyText}>
                              {lesson.difficulty}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  progressText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  lessonsContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  lessonsContent: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  lockedText: {
    color: "#9CA3AF",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beginnerBadge: {
    backgroundColor: "#D1FAE5",
  },
  intermediateBadge: {
    backgroundColor: "#FEF3C7",
  },
  advancedBadge: {
    backgroundColor: "#FEE2E2",
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
});