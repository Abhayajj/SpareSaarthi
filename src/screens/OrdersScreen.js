import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, Alert, Share, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Package, RefreshCw, ShoppingBag } from 'lucide-react-native';
import api from '../api/apiConfig';
import { AuthContext } from '../context/AuthContext';

const STATUS_TABS = ['All', 'Pending Payment', 'Confirmed', 'Self Pickup', 'Delivered'];

const STATUS_META = {
  'Pending Payment': { color: '#d97706', bg: '#fef3c7', step: 0 },
  'Confirmed':       { color: '#2563eb', bg: '#dbeafe', step: 1 },
  'Self Pickup':     { color: '#7c3aed', bg: '#ede9fe', step: 2 },
  'Delivered':       { color: '#059669', bg: '#d1fae5', step: 3 },
};

const TIMELINE_STEPS = ['Pending Payment', 'Confirmed', 'Self Pickup', 'Delivered'];

export default function OrdersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { userInfo } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch {
      Alert.alert('Error', 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchOrders);
    return unsub;
  }, [navigation]);

  const handleShareLedger = async () => {
    if (orders.length === 0) {
      Alert.alert('No Orders', 'Place your first order to generate a ledger.');
      return;
    }
    const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCoins = orders.reduce((s, o) => s + (o.coinsEarned || 0), 0);

    let text = `📄 SpareSaarthi Transaction Ledger\n`;
    text += `Generated: ${new Date().toLocaleString('en-IN')}\n`;
    text += `Business: ${userInfo?.businessName || 'N/A'} | ${userInfo?.name || 'N/A'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    orders.forEach((o, i) => {
      text += `Order ${i + 1}: #${o._id.substring(0, 8).toUpperCase()}\n`;
      text += `Date: ${new Date(o.createdAt).toLocaleDateString('en-IN')}\n`;
      text += `Status: ${o.status}\n`;
      text += `Amount: ₹${o.totalAmount} | Coins Earned: 🪙${o.coinsEarned || 0}\n`;
      if (o.orderItems?.length) {
        text += `Items: ${o.orderItems.map(i => `${i.name} x${i.qty}`).join(', ')}\n`;
      }
      text += `─────────────────────────────\n`;
    });
    text += `\n📊 SUMMARY\nTotal Orders: ${orders.length}\nTotal Spent: ₹${totalSpent}\nTotal Coins Earned: 🪙${totalCoins}\n`;
    text += `\n✅ Thank you for choosing SpareSaarthi!`;

    try {
      await Share.share({ title: 'SpareSaarthi Ledger', message: text });
    } catch {
      Alert.alert('Error', 'Could not share ledger.');
    }
  };

  const filtered = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

  const renderTimeline = (status) => {
    const currentStep = TIMELINE_STEPS.indexOf(status);
    return (
      <View style={t.row}>
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= currentStep;
          const isLast = i === TIMELINE_STEPS.length - 1;
          return (
            <View key={step} style={t.stepWrap}>
              <View style={[t.dot, done && t.dotDone]}>
                {done && <Text style={t.dotCheck}>✓</Text>}
              </View>
              {!isLast && <View style={[t.line, done && i < currentStep && t.lineDone]} />}
              <Text style={[t.label, done && t.labelDone]} numberOfLines={2}>{step}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>My Orders</Text>
          <Text style={s.headerSub}>{orders.length} total orders</Text>
        </View>
        <TouchableOpacity style={s.ledgerBtn} onPress={handleShareLedger}>
          <FileText color="#ea580c" size={16} />
          <Text style={s.ledgerBtnText}>Ledger</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Strip */}
      {orders.length > 0 && (
        <View style={s.summaryStrip}>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}</Text>
            <Text style={s.summaryLabel}>Total Spent</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>{orders.filter(o => o.status === 'Delivered').length}</Text>
            <Text style={s.summaryLabel}>Delivered</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryVal, { color: '#ea580c' }]}>🪙 {orders.reduce((s, o) => s + (o.coinsEarned || 0), 0)}</Text>
            <Text style={s.summaryLabel}>Coins Earned</Text>
          </View>
        </View>
      )}

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsRow} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {STATUS_TABS.map(tab => {
          const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
              {count > 0 && (
                <View style={[s.tabBadge, activeTab === tab && s.tabBadgeActive]}>
                  <Text style={[s.tabBadgeText, activeTab === tab && { color: '#fff' }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={s.centred}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={s.loadingText}>Loading orders...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.centred}>
          <ShoppingBag color="#e2e8f0" size={70} />
          <Text style={s.emptyTitle}>No orders here</Text>
          <Text style={s.emptySubtitle}>
            {activeTab === 'All' ? 'Start shopping to place your first order!' : `No ${activeTab} orders.`}
          </Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.shopBtnText}>Browse Products →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] || STATUS_META['Pending Payment'];
            const isExpanded = expandedId === item._id;
            return (
              <View style={s.card}>
                {/* Card Header */}
                <TouchableOpacity
                  style={s.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : item._id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={s.cardTopRow}>
                      <Text style={s.orderId}>#{item._id.substring(0, 8).toUpperCase()}</Text>
                      <View style={[s.statusChip, { backgroundColor: meta.bg }]}>
                        <Text style={[s.statusChipText, { color: meta.color }]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={s.orderDate}>
                      📅 {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                    <View style={s.cardAmountRow}>
                      <Text style={s.orderAmount}>₹{item.totalAmount}</Text>
                      {item.coinsEarned > 0 && (
                        <Text style={s.coinsEarned}>+🪙{item.coinsEarned} earned</Text>
                      )}
                      {item.coinsRedeemed > 0 && (
                        <Text style={s.coinsRedeemed}>-🪙{item.coinsRedeemed} redeemed</Text>
                      )}
                    </View>
                  </View>
                  <Text style={s.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={s.expandedContent}>
                    <View style={s.divider} />

                    {/* Status Timeline */}
                    <Text style={s.sectionLabel}>Order Progress</Text>
                    {renderTimeline(item.status)}

                    {/* Delivery Partner / Tracking ID */}
                    {item.trackingNumber ? (
                      <View style={{ backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, padding: 12, marginVertical: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#ea580c', textTransform: 'uppercase', marginBottom: 6 }}>📦 Shipping & Tracking Info</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>
                          Delivery Partner: <Text style={{ color: '#0f172a', fontWeight: '700' }}>{item.deliveryPartner || 'General Courier'}</Text>
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 4 }}>
                          Tracking ID: <Text style={{ color: '#0f172a', fontWeight: '700' }}>{item.trackingNumber}</Text>
                        </Text>
                        <TouchableOpacity
                          style={{ backgroundColor: '#ea580c', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 10 }}
                          onPress={() => {
                            const url = `https://www.google.com/search?q=${encodeURIComponent(item.deliveryPartner + ' tracking ' + item.trackingNumber)}`;
                            Linking.openURL(url).catch(() => {
                              Alert.alert('Error', 'Could not open tracking page.');
                            });
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Track Package Details 🌐</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    <View style={s.divider} />

                    {/* Items */}
                    <Text style={s.sectionLabel}>Items Ordered</Text>
                    {item.orderItems?.map((oi, idx) => (
                      <View key={idx} style={s.itemRow}>
                        <View style={s.itemDot} />
                        <Text style={s.itemName} numberOfLines={1}>{oi.name}</Text>
                        <Text style={s.itemQty}>{oi.qty} × ₹{oi.price}</Text>
                        <Text style={s.itemTotal}>₹{oi.qty * oi.price}</Text>
                      </View>
                    ))}

                    <View style={s.divider} />

                    {/* Invoice summary */}
                    <View style={s.invoiceRow}>
                      <Text style={s.invoiceLabel}>Subtotal</Text>
                      <Text style={s.invoiceVal}>₹{item.orderItems?.reduce((sum, i) => sum + i.qty * i.price, 0) || item.totalAmount}</Text>
                    </View>
                    {item.coinsRedeemed > 0 && (
                      <View style={s.invoiceRow}>
                        <Text style={[s.invoiceLabel, { color: '#10b981' }]}>Coins Discount</Text>
                        <Text style={[s.invoiceVal, { color: '#10b981' }]}>-₹{item.coinsRedeemed}</Text>
                      </View>
                    )}
                    <View style={[s.invoiceRow, { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8, marginTop: 4 }]}>
                      <Text style={[s.invoiceLabel, { fontWeight: '800', color: '#0f172a', fontSize: 15 }]}>Total Paid</Text>
                      <Text style={[s.invoiceVal, { fontWeight: '900', color: '#ea580c', fontSize: 17 }]}>₹{item.totalAmount}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

// Timeline styles
const t = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 12 },
  stepWrap: { alignItems: 'center', flex: 1 },
  dot: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: '#e2e8f0', backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  dotDone: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  dotCheck: { color: '#fff', fontSize: 11, fontWeight: '900' },
  line: {
    position: 'absolute', top: 10, left: '50%', right: '-50%',
    height: 2, backgroundColor: '#e2e8f0', zIndex: -1,
  },
  lineDone: { backgroundColor: '#ea580c' },
  label: { fontSize: 9, color: '#94a3b8', textAlign: 'center', fontWeight: '600', lineHeight: 12 },
  labelDone: { color: '#ea580c' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  ledgerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff7ed', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#fed7aa',
  },
  ledgerBtnText: { fontSize: 13, fontWeight: '700', color: '#ea580c' },

  summaryStrip: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 14,
    paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  summaryLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  summaryDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 10 },

  tabsRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
  },
  tabActive: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabBadge: {
    backgroundColor: '#e2e8f0', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopBtn: { backgroundColor: '#ea580c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  orderId: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  cardAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  orderAmount: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  coinsEarned: { fontSize: 12, color: '#10b981', fontWeight: '700' },
  coinsRedeemed: { fontSize: 12, color: '#f59e0b', fontWeight: '700' },
  expandIcon: { fontSize: 12, color: '#94a3b8', paddingLeft: 8 },

  expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ea580c' },
  itemName: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '500' },
  itemQty: { fontSize: 12, color: '#94a3b8' },
  itemTotal: { fontSize: 13, fontWeight: '700', color: '#0f172a', minWidth: 55, textAlign: 'right' },

  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  invoiceLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  invoiceVal: { fontSize: 13, color: '#0f172a', fontWeight: '700' },
});
