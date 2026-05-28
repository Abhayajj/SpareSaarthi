import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { CircleDollarSign, History } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

export default function CoinsScreen() {
  const { userInfo } = useContext(AuthContext);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SpareSaarthi Coins</Text>
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <View style={styles.coinAmountContainer}>
              <CircleDollarSign color="#ea580c" size={32} />
              <Text style={styles.balanceAmount}>{userInfo?.coins || 0}</Text>
            </View>
            <Text style={styles.balanceSubText}>1 Coin = ₹1 (Use on next purchase)</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Redeem Coins</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Activity</Text>
            <History color="#64748b" size={20} />
          </View>
          
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No recent coin activity.</Text>
            <Text style={styles.emptyHistorySubText}>Earn coins on every purchase!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  balanceContainer: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#0f172a', // slate-900
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  coinAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    marginLeft: 10,
  },
  balanceSubText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#ea580c', // orange-600
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  emptyHistory: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyHistoryText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptyHistorySubText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
