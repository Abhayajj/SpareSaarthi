import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Share, Linking, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, User, Shield, UserPlus, PhoneCall,
  FileText, LogOut, ChevronRight, Settings, Star
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const TIER_INFO = (coins) => {
  if (coins >= 5000) return { name: 'Gold', color: '#d97706', bg: '#fef3c7', icon: '🥇' };
  if (coins >= 1000) return { name: 'Silver', color: '#64748b', bg: '#f1f5f9', icon: '🥈' };
  return { name: 'Bronze', color: '#92400e', bg: '#fef3c7', icon: '🥉' };
};

export default function ProfileScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);
  const coins = userInfo?.coins || 0;
  const tier = TIER_INFO(coins);
  const initials = (userInfo?.name || 'U')
    .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join SpareSaarthi — India's #1 B2B auto parts platform for mechanics! Get 100 bonus coins on your first order. Register now at sparesaarthi.com`,
      });
    } catch {
      Alert.alert('Error', 'Could not open share sheet.');
    }
  };

  const handleCall = () => {
    const num = 'tel:+916387244265';
    Linking.canOpenURL(num).then(ok => {
      if (ok) Linking.openURL(num);
      else Alert.alert('Support', 'Call us at +91 6387244265');
    });
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        logout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]
      );
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Your Details', sub: 'Name, email, address', onPress: () => navigation.navigate('UserDetails') },
        { icon: Bell, label: 'Notifications', sub: 'Order & offer alerts', onPress: () => navigation.navigate('Notifications') },
        ...(userInfo?.role === 'admin' ? [
          { icon: Shield, label: 'Admin Control Center', sub: 'Manage products, orders & offers', onPress: () => navigation.navigate('AdminPanel'), highlight: true }
        ] : []),
      ],
    },
    {
      title: 'Rewards',
      items: [
        {
          icon: Star, label: 'Invite & Earn',
          sub: 'Earn 100 coins per referral',
          badge: '100 🪙', onPress: handleShare,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: PhoneCall, label: 'Call Customer Care', sub: '+91 6387244265', onPress: handleCall },
        { icon: FileText, label: 'Privacy Policy', sub: 'Data & privacy terms', onPress: () => navigation.navigate('PrivacyPolicy') },
      ],
    },
  ];

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Hero */}
        <View style={s.hero}>
          <View style={s.heroBg} />
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.userName}>{userInfo?.name || 'Welcome!'}</Text>
          <Text style={s.userBusiness}>{userInfo?.businessName || ''}</Text>
          <Text style={s.userAddress} numberOfLines={1}>{userInfo?.address || ''}</Text>
          {userInfo?.role === 'admin' && (
            <View style={s.adminBadge}>
              <Shield color="#fff" size={12} />
              <Text style={s.adminBadgeText}>ADMINISTRATOR</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{userInfo?.ordersCount || 0}</Text>
            <Text style={s.statLabel}>Orders</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: '#ea580c' }]}>🪙 {coins}</Text>
            <Text style={s.statLabel}>Coins</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: tier.color }]}>{tier.icon} {tier.name}</Text>
            <Text style={s.statLabel}>Member Tier</Text>
          </View>
        </View>

        {/* Tier Progress */}
        {userInfo?.role !== 'admin' && (
          <View style={s.tierCard}>
            <View style={s.tierRow}>
              <Text style={[s.tierTitle, { color: tier.color }]}>{tier.icon} {tier.name} Member</Text>
              <Text style={s.tierCoins}>{coins} coins</Text>
            </View>
            <View style={s.tierBar}>
              <View style={[s.tierFill, {
                width: `${Math.min((coins / 5000) * 100, 100)}%`,
                backgroundColor: tier.color,
              }]} />
            </View>
            <Text style={s.tierNext}>
              {coins < 1000
                ? `${1000 - coins} coins to Silver`
                : coins < 5000
                ? `${5000 - coins} coins to Gold`
                : '🎉 Maximum tier reached!'}
            </Text>
          </View>
        )}

        {/* Menu Sections */}
        {sections.map(section => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[s.menuItem, idx < section.items.length - 1 && s.menuItemBorder, item.highlight && s.menuItemHighlight]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[s.menuIconWrap, item.highlight && { backgroundColor: '#fff7ed' }]}>
                      <Icon color={item.highlight ? '#ea580c' : '#475569'} size={20} />
                    </View>
                    <View style={s.menuText}>
                      <Text style={[s.menuLabel, item.highlight && { color: '#ea580c' }]}>{item.label}</Text>
                      <Text style={s.menuSub}>{item.sub}</Text>
                    </View>
                    {item.badge && (
                      <View style={s.menuBadge}>
                        <Text style={s.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight color="#cbd5e1" size={18} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={s.section}>
          <View style={s.sectionCard}>
            <TouchableOpacity style={s.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <View style={[s.menuIconWrap, { backgroundColor: '#fef2f2' }]}>
                <LogOut color="#ef4444" size={20} />
              </View>
              <View style={s.menuText}>
                <Text style={[s.menuLabel, { color: '#ef4444' }]}>Logout</Text>
                <Text style={s.menuSub}>Signed in as {userInfo?.email}</Text>
              </View>
              <ChevronRight color="#fca5a5" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.footer}>SpareSaarthi v2.0 · Made with ❤️ for India's Mechanics</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  hero: { alignItems: 'center', paddingBottom: 30, paddingTop: 40, position: 'relative' },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    backgroundColor: '#0f172a',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#ea580c',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  userBusiness: { fontSize: 14, color: '#475569', fontWeight: '600', marginBottom: 2 },
  userAddress: { fontSize: 12, color: '#94a3b8', maxWidth: 260, textAlign: 'center' },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ea580c', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginTop: 10,
  },
  adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 },

  tierCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tierTitle: { fontSize: 14, fontWeight: '800' },
  tierCoins: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  tierBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  tierFill: { height: '100%', borderRadius: 3 },
  tierNext: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  section: { marginHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8, paddingLeft: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuItemHighlight: { backgroundColor: '#fff7ed' },
  menuIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  menuSub: { fontSize: 12, color: '#94a3b8' },
  menuBadge: {
    backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#fed7aa',
  },
  menuBadgeText: { fontSize: 12, color: '#ea580c', fontWeight: '700' },

  footer: { textAlign: 'center', color: '#cbd5e1', fontSize: 12, padding: 24, paddingTop: 8 },
});
