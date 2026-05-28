import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import api from '../api/apiConfig';

const TABS = ['Pending Payment', 'Confirmed', 'Self Pickup', 'Delivered'];

export default function OrdersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Pending Payment');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Refresh orders when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    
    return unsubscribe;
  }, [navigation]);

  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <TouchableOpacity style={styles.ledgerButton}>
          <Text style={styles.ledgerButtonText}>Download Ledger</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List / Empty State */}
      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{marginTop: 50}} />
      ) : filteredOrders.length > 0 ? (
        <ScrollView style={{paddingHorizontal: 20}}>
          {filteredOrders.map(order => (
            <View key={order._id} style={styles.orderCard}>
              <Text style={styles.orderId}>Order ID: {order._id.substring(0, 8).toUpperCase()}</Text>
              <Text style={styles.orderTotal}>Total: ₹{order.totalAmount}</Text>
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.orderCoins}>Coins Earned: {order.coinsEarned}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.bagPlaceholder}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 24}}>BAG</Text>
            </View>
          </View>
          <Text style={styles.emptyStateSubText}>Nothing in here</Text>
          <Text style={styles.emptyStateTitle}>Please start buying products</Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buyButtonText}>Buy products</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  ledgerButton: {
    backgroundColor: '#ea580c', // orange-600
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ledgerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tabsContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  tabsScroll: {
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9', // slate-100
    borderRadius: 8,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#e2e8f0', // slate-200
  },
  tabText: {
    color: '#64748b', // slate-500
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#0f172a', // slate-900
    fontWeight: '700',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  bagPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#ea580c', // orange-600
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
    marginBottom: 10,
    fontWeight: '500',
  },
  emptyStateTitle: {
    fontSize: 26,
    color: '#cbd5e1', // slate-300
    fontWeight: '800',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    padding: 20,
  },
  buyButton: {
    backgroundColor: '#ea580c', // orange-600
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  orderCoins: {
    fontSize: 12,
    color: '#ea580c',
    fontWeight: '600',
  }
});
