import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { learningCategories, lessons as lessonsByCategory } from '@/constants/learning';
import { useUser } from '@/providers/UserProvider';
import { PremiumGate } from '@/components/PremiumGate';
import * as Haptics from 'expo-haptics';

interface RouteParams {
  category?: string;
}

export default function CategoryScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const categoryParam = typeof params.category === 'string' ? params.category : undefined;
  const { hasUnlimitedAccess } = useUser();
  const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);

  const canAccess = useMemo(() => {
    try {
      return hasUnlimitedAccess();
    } catch (e) {
      console.log('Error checking access, defaulting to false:', e);
      return false;
    }
  }, [hasUnlimitedAccess]);

  const category = useMemo(() => {
    const found = learningCategories.find((c) => c.id === categoryParam);
    return found;
  }, [categoryParam]);

  const lessons = useMemo(() => {
    if (!category?.id) return [] as { id: string; title: string; description: string; duration: string; difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' }[];
    return lessonsByCategory[category.id] ?? [];
  }, [category]);

  useEffect(() => {
    console.log('Category route mounted with param:', categoryParam);
    if (!canAccess) {
      setShowPremiumGate(true);
    }
  }, [categoryParam, canAccess]);

  const onBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    router.back();
  }, []);

  if (!category) {
    return (
      <View style={styles.center} testID="category-not-found">
        <Text style={styles.notFoundTitle}>Category not found</Text>
        <Text style={styles.notFoundSubtitle}>The category you are trying to view does not exist.</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.9} testID="go-back-button">
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={Platform.OS !== 'android'} testID="category-scroll">
        <View style={styles.header} testID="category-header">
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.description}</Text>
        </View>

        <View style={styles.list} testID="lessons-list">
          {lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonCard} testID={`lesson-${lesson.id}`}>
              <View style={styles.lessonRow}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.badge}>{lesson.difficulty ?? 'Beginner'}</Text>
              </View>
              <Text style={styles.lessonDesc}>{lesson.description}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{lesson.duration}</Text>
              </View>
            </View>
          ))}

          {lessons.length === 0 && (
            <View style={styles.empty} testID="empty-lessons">
              <Text style={styles.emptyText}>Lessons coming soon.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onBack}
          style={styles.fab}
          activeOpacity={0.9}
          testID="fab-back"
        >
          <Text style={styles.fabText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <PremiumGate
        visible={showPremiumGate && !canAccess}
        onClose={() => {
          setShowPremiumGate(false);
          router.back();
        }}
        feature="Learning Courses"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 100 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  list: { gap: 12 as number },
  lessonCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  lessonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  lessonTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  badge: { color: '#0E1116', backgroundColor: '#A5B4FC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  lessonDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  notFoundSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  backButton: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  backButtonText: { color: '#FFFFFF', fontWeight: '600' },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.9)' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabText: { color: '#FFFFFF', fontWeight: '700' },
});
