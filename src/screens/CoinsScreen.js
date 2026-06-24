import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../api/apiConfig';

const TIERS = [
  { name: 'Bronze', min: 0,    max: 999,  color: '#92400e', bg: '#fef3c7', icon: '🥉', perks: ['1 coin per ₹100 spent', 'Basic support'] },
  { name: 'Silver', min: 1000, max: 4999, color: '#475569', bg: '#f1f5f9', icon: '🥈', perks: ['1 coin per ₹100 spent', 'Priority order processing', 'Exclusive silver offers'] },
  { name: 'Gold',   min: 5000, max: Infinity, color: '#d97706', bg: '#fef3c7', icon: '🥇', perks: ['1.5 coins per ₹100 spent', 'Dedicated account manager', 'Gold-only flash sales', 'Free delivery on all orders'] },
];

const HOW_TO_EARN = [
  { icon: '🛒', title: 'Place an Order', desc: 'Earn 1 coin for every ₹100 spent on any order.' },
  { icon: '👥', title: 'Refer a Mechanic', desc: 'Earn 100 bonus coins when a friend places their first order.' },
  { icon: '⭐', title: 'Write a Review', desc: 'Coming soon — earn 20 coins per review.' },
  { icon: '📅', title: 'Monthly Bonus', desc: 'Coming soon — regular shoppers get a monthly bonus.' },
];

export default function CoinsScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const coins = userInfo?.coins || 0;

  const currentTier = TIERS.find(t => coins >= t.min && coins <= t.max) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > coins);
  const progressPct = nextTier
    ? Math.min(((coins - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100)
    : 100;

  useEffect(() => {
    api.get('/orders/myorders').then(res => setOrders(res.data)).catch(() => {});
  }, []);

  const totalEarned = orders.reduce((s, o) => s + (o.coinsEarned || 0), 0);
  const totalRedeemed = orders.reduce((s, o) => s + (o.coinsRedeemed || 0), 0);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Balance Card */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Your Coin Balance</Text>
          <View style={s.heroAmountRow}>
            <Text style={s.coinEmoji}>🪙</Text>
            <Text style={s.heroAmount}>{coins}</Text>
          </View>
          <Text style={s.heroSub}>1 Coin = ₹1 · Redeem at checkout</Text>

          {/* Quick Stats */}
          <View style={s.heroStats}>
            <View style={s.heroStatItem}>
              <Text style={s.heroStatVal}>🪙 {totalEarned}</Text>
              <Text style={s.heroStatLabel}>Total Earned</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStatItem}>
              <Text style={s.heroStatVal}>🪙 {totalRedeemed}</Text>
              <Text style={s.heroStatLabel}>Total Redeemed</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStatItem}>
              <Text style={s.heroStatVal}>₹{coins}</Text>
              <Text style={s.heroStatLabel}>Cash Value</Text>
            </View>
          </View>
        </View>

        {/* Tier Progress */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Member Tier</Text>
          <View style={[s.tierCard, { borderColor: currentTier.color }]}>
            <View style={s.tierHeader}>
              <Text style={s.tierIcon}>{currentTier.icon}</Text>
              <View>
                <Text style={[s.tierName, { color: currentTier.color }]}>{currentTier.name} Member</Text>
                <Text style={s.tierCoins}>{coins.toLocaleString()} coins</Text>
              </View>
            </View>

            {nextTier && (
              <>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${progressPct}%`, backgroundColor: currentTier.color }]} />
                </View>
                <Text style={s.progressLabel}>
                  {nextTier.min - coins} more coins to unlock {nextTier.icon} {nextTier.name}
                </Text>
              </>
            )}
            {!nextTier && <Text style={s.progressLabel}>🎉 You've reached the highest tier!</Text>}

            <View style={s.tierPerks}>
              <Text style={s.perksTitle}>Your Perks:</Text>
              {currentTier.perks.map((perk, i) => (
                <Text key={i} style={s.perkItem}>✓ {perk}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* All Tiers */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Loyalty Tiers</Text>
          {TIERS.map(tier => (
            <View key={tier.name} style={[s.allTierRow, coins >= tier.min && coins <= tier.max && s.allTierRowActive]}>
              <Text style={s.allTierIcon}>{tier.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.allTierName, { color: tier.color }]}>{tier.name}</Text>
                <Text style={s.allTierRange}>
                  {tier.max === Infinity ? `${tier.min.toLocaleString()}+ coins` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} coins`}
                </Text>
              </View>
              {coins >= tier.min && coins <= tier.max && (
                <View style={[s.currentChip, { backgroundColor: tier.bg }]}>
                  <Text style={[s.currentChipText, { color: tier.color }]}>Current</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* How to Earn */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How to Earn Coins</Text>
          {HOW_TO_EARN.map((item, i) => (
            <View key={i} style={s.earnCard}>
              <Text style={s.earnIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.earnTitle}>{item.title}</Text>
                <Text style={s.earnDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Orders with Coin Activity */}
        {orders.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Coin Activity</Text>
            {orders.slice(0, 5).map(order => (
              <View key={order._id} style={s.activityRow}>
                <View style={s.activityDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>Order #{order._id.substring(0, 8).toUpperCase()}</Text>
                  <Text style={s.activityDate}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {order.coinsEarned > 0 && (
                    <Text style={s.activityEarned}>+🪙{order.coinsEarned}</Text>
                  )}
                  {order.coinsRedeemed > 0 && (
                    <Text style={s.activityRedeemed}>-🪙{order.coinsRedeemed}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={[s.section, { marginBottom: 30 }]}>
          <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.shopBtnText}>🛒 Shop Now to Earn More Coins</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  heroCard: {
    backgroundColor: '#0f172a', padding: 28, paddingTop: 36, paddingBottom: 28,
  },
  heroLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  heroAmountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 },
  coinEmoji: { fontSize: 42 },
  heroAmount: { fontSize: 64, fontWeight: '900', color: '#fff' },
  heroSub: { color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  heroStats: {
    flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 10,
  },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  heroStatLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  heroStatDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 8 },

  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748b', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },

  tierCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  tierIcon: { fontSize: 36 },
  tierName: { fontSize: 18, fontWeight: '900' },
  tierCoins: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
  tierPerks: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12 },
  perksTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
  perkItem: { fontSize: 13, color: '#334155', paddingVertical: 3, fontWeight: '500' },

  allTierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  allTierRowActive: { borderColor: '#ea580c', backgroundColor: '#fff7ed' },
  allTierIcon: { fontSize: 28 },
  allTierName: { fontSize: 15, fontWeight: '800' },
  allTierRange: { fontSize: 12, color: '#94a3b8' },
  currentChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  currentChipText: { fontSize: 11, fontWeight: '800' },

  earnCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  earnIcon: { fontSize: 28 },
  earnTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  earnDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8,
  },
  activityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ea580c' },
  activityTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  activityDate: { fontSize: 11, color: '#94a3b8' },
  activityEarned: { fontSize: 13, fontWeight: '700', color: '#10b981' },
  activityRedeemed: { fontSize: 12, color: '#f59e0b', fontWeight: '600' },

  shopBtn: {
    backgroundColor: '#ea580c', borderRadius: 14, paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
