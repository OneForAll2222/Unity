import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Receipt, Calendar, DollarSign } from 'lucide-react-native';
import { usePayment } from '@/providers/PaymentProvider';
import { router } from 'expo-router';

export default function PaymentHistoryScreen() {
  const { paymentHistory } = usePayment();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#2563EB', '#DB2777']}
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
          <Text style={styles.title}>Payment History</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {paymentHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.emptyCard}
              >
                <Receipt size={64} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.emptyTitle}>No Payments Yet</Text>
                <Text style={styles.emptyMessage}>
                  Your payment history will appear here once you make your first purchase.
                </Text>
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => router.push('/payments')}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.shopGradient}
                  >
                    <Text style={styles.shopButtonText}>Browse Premium Services</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                {paymentHistory.length} transaction{paymentHistory.length !== 1 ? 's' : ''}
              </Text>

              {paymentHistory.map((item, index) => (
                <LinearGradient
                  key={`${item.id}-${index}`}
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.historyCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.receiptIcon}>
                      <Receipt size={24} color="#10B981" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.dateContainer}>
                      <Calendar size={16} color="rgba(255, 255, 255, 0.6)" />
                      <Text style={styles.dateText}>
                        {formatDate(new Date())}
                      </Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Completed</Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}

              <View style={styles.totalSection}>
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={styles.totalCard}
                >
                  <DollarSign size={32} color="#fff" />
                  <Text style={styles.totalLabel}>Total Spent</Text>
                  <Text style={styles.totalAmount}>
                    ${paymentHistory.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </Text>
                </LinearGradient>
              </View>
            </>
          )}
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
    paddingHorizontal: 20,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'capitalize',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  itemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  totalSection: {
    marginTop: 20,
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});