import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Mail, 
  Settings, 
  Eye, 
  EyeOff,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

// Admin password validation is now handled securely by the backend

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  totalMessages: number;
  totalRevenue: number;
  activeUsers: number;
  supportTickets: number;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  isPremium: boolean;
  joinDate: string;
  lastActive: string;
}

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const contactSubmissionsQuery = trpc.contact.getSubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const markAsReadMutation = trpc.contact.markAsRead.useMutation({
    onSuccess: () => {
      contactSubmissionsQuery.refetch();
    },
  });
  const validatePasswordMutation = trpc.admin.validatePassword.useMutation();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 1247,
    premiumUsers: 342,
    totalMessages: 15678,
    totalRevenue: 8540,
    activeUsers: 89,
    supportTickets: 23,
  });
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      username: 'John Doe',
      email: 'john@example.com',
      isPremium: true,
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
    },
    {
      id: '2',
      username: 'Jane Smith',
      email: 'jane@example.com',
      isPremium: false,
      joinDate: '2024-01-18',
      lastActive: '2024-01-19',
    },
    {
      id: '3',
      username: 'Mike Johnson',
      email: 'mike@example.com',
      isPremium: true,
      joinDate: '2024-01-10',
      lastActive: '2024-01-20',
    },
  ]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('adminAuthenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await validatePasswordMutation.mutateAsync({ password });
      setIsAuthenticated(true);
      await AsyncStorage.setItem('adminAuthenticated', 'true');
      setPassword('');
    } catch (error) {
      console.error('Admin login error:', error);
      Alert.alert('Access Denied', 'Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsAuthenticated(false);
            await AsyncStorage.removeItem('adminAuthenticated');
          },
        },
      ]
    );
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setAnalytics(prev => ({
      ...prev,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      totalMessages: prev.totalMessages + Math.floor(Math.random() * 10),
      supportTickets: contactSubmissionsQuery.data?.length || prev.supportTickets,
    }));
    await contactSubmissionsQuery.refetch();
    setRefreshing(false);
    Alert.alert('Success', 'Analytics data refreshed!');
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#EF4444';
      case 'read': return '#F59E0B';
      case 'responded': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Mail size={16} color={getStatusColor(status)} />;
      case 'read': return <Clock size={16} color={getStatusColor(status)} />;
      case 'responded': return <CheckCircle size={16} color={getStatusColor(status)} />;
      default: return <MessageSquare size={16} color={getStatusColor(status)} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Admin Access</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.loginContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.loginCard}
            >
              <Shield size={64} color="#EF4444" />
              <Text style={styles.loginTitle}>Restricted Access</Text>
              <Text style={styles.loginDescription}>
                This area is restricted to authorized administrators only.
              </Text>
              
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter admin password"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" />
                  ) : (
                    <Eye size={20} color="rgba(255, 255, 255, 0.7)" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, validatePasswordMutation.isPending && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={validatePasswordMutation.isPending}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {validatePasswordMutation.isPending ? 'Validating...' : 'Access Admin Panel'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#4B5563']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Settings size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAnalytics}
              tintColor="#fff"
              colors={['#fff']}
            />
          }
        >
          {/* Analytics Overview */}
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.1)']}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <BarChart3 size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Analytics Overview</Text>
              <TouchableOpacity onPress={refreshAnalytics}>
                <Activity size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Users size={20} color="#3B82F6" />
                <Text style={styles.analyticsValue}>{analytics.totalUsers}</Text>
                <Text style={styles.analyticsLabel}>Total Users</Text>
              </View>
              <View style={styles.analyticsCard}>
                <TrendingUp size={20} color="#10B981" />
                <Text style={styles.analyticsValue}>{analytics.premiumUsers}</Text>
                <Text style={styles.analyticsLabel}>Premium Users</Text>
              </View>
              <View style={styles.analyticsCard}>
                <MessageSquare size={20} color="#8B5CF6" />
                <Text style={styles.analyticsValue}>{analytics.totalMessages}</Text>
                <Text style={styles.analyticsLabel}>Messages</Text>
              </View>
              <View style={styles.analyticsCard}>
                <CreditCard size={20} color="#F59E0B" />
                <Text style={styles.analyticsValue}>${analytics.totalRevenue}</Text>
                <Text style={styles.analyticsLabel}>Revenue</Text>
              </View>
            </View>
          </LinearGradient>

          {/* User Management */}
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Users size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>User Management</Text>
            </View>
            
            {users.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userDate}>Joined: {user.joinDate}</Text>
                </View>
                <View style={styles.userStatus}>
                  {user.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                  <Text style={styles.lastActive}>Last: {user.lastActive}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>

          {/* Contact Submissions */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.1)']}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Mail size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Contact Submissions</Text>
            </View>
            
            <View style={styles.supportStats}>
              <View style={styles.supportCard}>
                <Text style={styles.supportValue}>
                  {contactSubmissionsQuery.data?.filter(s => s.status === 'new').length || 0}
                </Text>
                <Text style={styles.supportLabel}>New Messages</Text>
              </View>
              <View style={styles.supportCard}>
                <Text style={styles.supportValue}>
                  {contactSubmissionsQuery.data?.length || 0}
                </Text>
                <Text style={styles.supportLabel}>Total Submissions</Text>
              </View>
            </View>
            
            {contactSubmissionsQuery.isLoading ? (
              <Text style={styles.loadingText}>Loading submissions...</Text>
            ) : contactSubmissionsQuery.data && contactSubmissionsQuery.data.length > 0 ? (
              <View style={styles.submissionsList}>
                {contactSubmissionsQuery.data.slice(0, 5).map((submission) => (
                  <TouchableOpacity
                    key={submission.id}
                    style={[
                      styles.submissionItem,
                      { borderLeftColor: getStatusColor(submission.status) }
                    ]}
                    onPress={() => {
                      Alert.alert(
                        submission.subject,
                        `From: ${submission.name}${submission.email ? ` (${submission.email})` : ''}\n\nMessage:\n${submission.message}\n\nSubmitted: ${formatDate(submission.timestamp)}`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          ...(submission.status === 'new' ? [{
                            text: 'Mark as Read',
                            onPress: () => handleMarkAsRead(submission.id)
                          }] : []),
                        ]
                      );
                    }}
                  >
                    <View style={styles.submissionHeader}>
                      <View style={styles.submissionStatus}>
                        {getStatusIcon(submission.status)}
                        <Text style={[styles.submissionStatusText, { color: getStatusColor(submission.status) }]}>
                          {submission.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.submissionDate}>
                        {formatDate(submission.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.submissionSubject} numberOfLines={1}>
                      {submission.subject}
                    </Text>
                    <Text style={styles.submissionFrom} numberOfLines={1}>
                      From: {submission.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {contactSubmissionsQuery.data.length > 5 && (
                  <Text style={styles.moreSubmissions}>
                    +{contactSubmissionsQuery.data.length - 5} more submissions
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.supportNote}>
                No contact submissions yet. Users can submit messages through the support form.
              </Text>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  logoutButton: {
    padding: 8,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  loginButton: {
    width: '100%',
  },
  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  premiumBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  lastActive: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  supportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  supportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  supportValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  supportLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  supportNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  submissionsList: {
    marginTop: 12,
    gap: 8,
  },
  submissionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  submissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  submissionStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  submissionDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  submissionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  submissionFrom: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moreSubmissions: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
});