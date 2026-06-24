import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react-native';

export default function OrderSuccessScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Bounce in the check icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Fade in + slide up the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.wrap}>

        {/* Animated success icon */}
        <Animated.View style={[s.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={s.outerRing}>
            <View style={s.innerRing}>
              <CheckCircle color="#059669" size={64} fill="#d1fae5" />
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={s.title}>Order Placed! 🎉</Text>
          <Text style={s.subtitle}>
            Your spare parts order has been successfully placed. The SpareSaarthi team will confirm it shortly.
          </Text>

          {/* Info cards */}
          <View style={s.infoRow}>
            <View style={s.infoCard}>
              <Text style={s.infoIcon}>📦</Text>
              <Text style={s.infoTitle}>Processing</Text>
              <Text style={s.infoText}>Order received & being confirmed</Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoIcon}>🪙</Text>
              <Text style={s.infoTitle}>Coins Earned</Text>
              <Text style={s.infoText}>Check your coins balance</Text>
            </View>
          </View>

          <View style={s.tipBox}>
            <Text style={s.tipText}>
              💡 <Text style={{ fontWeight: '700' }}>Pro tip:</Text> Track your order status in real-time from the Orders tab. You'll move from Confirmed → Self Pickup → Delivered.
            </Text>
          </View>

          <TouchableOpacity
            style={s.trackBtn}
            onPress={() => {
              navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
              // Small delay then navigate to Orders tab
              setTimeout(() => navigation.navigate('Orders'), 100);
            }}
          >
            <Package color="#fff" size={18} />
            <Text style={s.trackBtnText}>Track My Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.continueBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          >
            <ShoppingBag color="#ea580c" size={16} />
            <Text style={s.continueBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },

  iconWrap: { marginBottom: 32 },
  outerRing: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center',
  },
  innerRing: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center',
  },

  content: { alignItems: 'center', width: '100%' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 10 },
  subtitle: {
    fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22,
    marginBottom: 24,
  },

  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 18, width: '100%' },
  infoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  infoIcon: { fontSize: 24, marginBottom: 6 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  infoText: { fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 15 },

  tipBox: {
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 24,
    width: '100%', borderWidth: 1, borderColor: '#fde68a',
  },
  tipText: { fontSize: 13, color: '#78350f', lineHeight: 18 },

  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#059669', borderRadius: 14, paddingVertical: 16,
    paddingHorizontal: 24, width: '100%', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff7ed', borderRadius: 14, paddingVertical: 15,
    paddingHorizontal: 24, width: '100%', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fed7aa',
  },
  continueBtnText: { color: '#ea580c', fontSize: 15, fontWeight: '700' },
});
