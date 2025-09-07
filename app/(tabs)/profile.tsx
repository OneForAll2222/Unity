import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Award, Clock, BookOpen, Star, Edit3, Check, X, CreditCard, Crown, HelpCircle } from "lucide-react-native";
import { useUser } from "@/providers/UserProvider";
import { FreeMessageCounter } from "@/components/FreeMessageCounter";
import { router } from "expo-router";
import ContactCard from "@/components/ContactCard";

export default function ProfileScreen() {
  const { username, setUsername, isPremium, purchasedItems, freeMessagesRemaining, resetFreeMessages, clearAllData } = useUser();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempUsername, setTempUsername] = useState<string>(username);

  const handleSaveName = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setIsEditingName(false);
    } else {
      Alert.alert("Error", "Username cannot be empty");
    }
  };

  const handleCancelEdit = () => {
    setTempUsername(username);
    setIsEditingName(false);
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
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/payments')}
              accessibilityLabel="Go to payments"
              accessibilityRole="button"
            >
              <CreditCard size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/support')}
              accessibilityLabel="Go to support"
              accessibilityRole="button"
            >
              <HelpCircle size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/admin')}
              accessibilityLabel="Go to admin settings"
              accessibilityRole="button"
            >
              <Settings size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <LinearGradient
            colors={["#EF4444", "#06B6D4", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#DB2777", "#7C3AED"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            </View>
            <View style={styles.userNameContainer}>
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempUsername}
                    onChangeText={setTempUsername}
                    placeholder="Enter your name"
                    autoFocus
                    maxLength={20}
                    returnKeyType="done"
                    accessibilityLabel="Username input field"
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveName}
                      accessibilityLabel="Save username"
                      accessibilityRole="button"
                    >
                      <Check size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelEdit}
                      accessibilityLabel="Cancel editing username"
                      accessibilityRole="button"
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameDisplayContainer}>
                  <Text style={styles.userName}>{username}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingName(true)}
                    accessibilityLabel="Edit username"
                    accessibilityRole="button"
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.premiumStatusContainer}>
              {isPremium ? (
                <View style={styles.premiumBadge}>
                  <Crown size={16} color="#10B981" />
                  <Text style={styles.premiumText}>Premium Member</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/payments')}
                  accessibilityLabel="Upgrade to premium"
                  accessibilityRole="button"
                >
                  <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userEmail}>user@example.com</Text>
          </LinearGradient>

          {isPremium && (
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <View style={styles.premiumCardHeader}>
                <Crown size={24} color="#fff" />
                <Text style={styles.premiumCardTitle}>Premium Benefits</Text>
              </View>
              <Text style={styles.premiumCardText}>
                You have access to all AI specialists, learning courses, and premium features.
              </Text>
              <Text style={styles.purchasedItemsText}>
                Purchased items: {purchasedItems.length}
              </Text>
            </LinearGradient>
          )}

          <View style={styles.statsGrid}>
            <LinearGradient
              colors={["#7C3AED", "#DB2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Award size={24} color="#fff" />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#2563EB", "#0891B2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Clock size={24} color="#fff" />
              <Text style={styles.statValue}>48h</Text>
              <Text style={styles.statLabel}>Learning Time</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#DB2777", "#EA580C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <BookOpen size={24} color="#fff" />
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#D97706", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Star size={24} color="#fff" />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </LinearGradient>
          </View>

          <ContactCard 
            email="support@yourapp.com"
            onPress={() => router.push('/support')}
          />

          {/* Debug Section for Free Messages */}
          <LinearGradient
            colors={["#DC2626", "#B91C1C", "#991B1B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.debugSection}
          >
            <Text style={styles.debugTitle}>Debug: Free Messages</Text>
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Free Messages: {freeMessagesRemaining}</Text>
              <Text style={styles.debugText}>Is Premium: {isPremium ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
            </View>
            <View style={styles.debugCounter}>
              <FreeMessageCounter />
            </View>
            <View style={styles.debugButtons}>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={resetFreeMessages}
                accessibilityLabel="Reset free messages"
                accessibilityRole="button"
              >
                <Text style={styles.debugButtonText}>Reset Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.debugButton, styles.clearButton]}
                onPress={() => {
                  Alert.alert(
                    "Clear All Data",
                    "This will reset all user data including username, premium status, and free messages. Continue?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Clear", style: "destructive", onPress: clearAllData }
                    ]
                  );
                }}
                accessibilityLabel="Clear all data"
                accessibilityRole="button"
              >
                <Text style={styles.debugButtonText}>Clear All Data</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#059669", "#047857", "#065F46"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                Completed "Introduction to Coding" lesson
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                Consulted with Medical Advisor AI
              </Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                Started "Music Production Basics" course
              </Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </LinearGradient>
        </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Account for tab bar
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userNameContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  nameDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  editNameContainer: {
    alignItems: "center",
    gap: 12,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
    textAlign: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    padding: 8,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderRadius: 20,
    padding: 8,
  },
  premiumStatusContainer: {
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  premiumCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumCardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
  purchasedItemsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  activityCard: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
  },
  activityText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  debugSection: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  debugInfo: {
    marginBottom: 16,
  },
  debugText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  debugCounter: {
    alignItems: "center",
    marginBottom: 16,
  },
  debugButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  debugButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});