import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/apiConfig';
import { Image } from 'react-native';

const GST_RATE = 0.18; // 18% GST for auto parts

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const { userInfo, refreshProfile } = useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [redeemCoins, setRedeemCoins] = React.useState(false);

  const coins = userInfo?.coins || 0;
  const subtotal = getCartTotal();
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grossTotal = subtotal + gstAmount;
  const coinsDiscount = redeemCoins ? Math.min(coins, grossTotal) : 0;
  const payable = grossTotal - coinsDiscount;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const response = await api.post('/orders/checkout-session', {
        orderItems: cartItems.map(i => ({
          name: i.name, qty: i.quantity, price: i.price, product: i._id,
        })),
        totalAmount: payable,
        coinsRedeemed: coinsDiscount,
      });

      const { id: sessionId, url: checkoutUrl, orderId } = response.data;

      if (Platform.OS === 'web') {
        window.location.href = checkoutUrl;
      } else {
        await WebBrowser.openBrowserAsync(checkoutUrl);
        
        // After they close the browser modal, confirm payment status on the backend
        setLoading(true);
        try {
          await api.post(`/orders/${orderId}/confirm-payment`, {
            session_id: sessionId
          });
          
          await refreshProfile();
          clearCart();
          setRedeemCoins(false);
          navigation.navigate('OrderSuccess');
        } catch (confirmErr) {
          console.error('Payment confirmation error:', confirmErr);
          Alert.alert(
            'Payment Verification',
            'If you completed payment, your order will show as Confirmed shortly. Check the Orders tab.',
            [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
          );
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      Alert.alert('Checkout Failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.emptyWrap}>
          <View style={s.emptyIcon}>
            <ShoppingCart color="#ea580c" size={52} />
          </View>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySub}>Browse our catalog and add genuine spare parts to your cart.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <ShoppingBag color="#fff" size={18} />
            <Text style={s.emptyBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Cart</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cartItems.map((item) => (
          <View key={item._id} style={s.card}>
            <Image
              source={{ uri: item.image }}
              style={s.itemImg}
              resizeMode="contain"
            />
            <View style={s.itemInfo}>
              <Text style={s.itemBrand}>{item.brand?.toUpperCase()}</Text>
              <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={s.itemUnitPrice}>₹{item.price} / unit</Text>
              <View style={s.qtyRow}>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => updateQuantity(item._id, 'decrement')}
                >
                  <Minus size={14} color="#0f172a" />
                </TouchableOpacity>
                <Text style={s.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => updateQuantity(item._id, 'increment')}
                >
                  <Plus size={14} color="#0f172a" />
                </TouchableOpacity>
                <Text style={s.itemLineTotal}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item._id)} style={s.deleteBtn}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Coins Panel */}
        {coins > 0 && (
          <View style={s.coinsCard}>
            <View style={s.coinsLeft}>
              <Text style={s.coinsTitle}>🪙 Redeem SpareSaarthi Coins</Text>
              <Text style={s.coinsSub}>You have {coins} coins (₹{coins} value)</Text>
              <Text style={s.coinsMax}>Max discount: ₹{Math.min(coins, grossTotal)}</Text>
            </View>
            <TouchableOpacity
              style={[s.coinsBtn, redeemCoins && s.coinsBtnActive]}
              onPress={() => setRedeemCoins(p => !p)}
            >
              <Text style={[s.coinsBtnText, redeemCoins && s.coinsBtnTextActive]}>
                {redeemCoins ? '✓ Applied' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Order Summary</Text>

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal ({itemCount} items)</Text>
            <Text style={s.summaryVal}>₹{subtotal}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>GST (18%)</Text>
            <Text style={s.summaryVal}>₹{gstAmount}</Text>
          </View>
          {redeemCoins && (
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: '#10b981' }]}>Coins Discount</Text>
              <Text style={[s.summaryVal, { color: '#10b981' }]}>-₹{coinsDiscount}</Text>
            </View>
          )}
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total Payable</Text>
            <Text style={s.totalVal}>₹{payable}</Text>
          </View>
          <Text style={s.gstNote}>*Inclusive of all taxes. GST invoice will be generated.</Text>
        </View>
      </ScrollView>

      {/* Checkout CTA */}
      <View style={s.checkoutBar}>
        <View>
          <Text style={s.checkoutBarLabel}>Total Payable</Text>
          <Text style={s.checkoutBarTotal}>₹{payable}</Text>
          {redeemCoins && <Text style={s.checkoutBarSaved}>You save ₹{coinsDiscount} with coins</Text>}
        </View>
        <TouchableOpacity
          style={[s.checkoutBtn, loading && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.checkoutBtnText}>Place Order →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff7ed',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ea580c', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerBadge: {
    backgroundColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: { color: '#ea580c', fontSize: 13, fontWeight: '700' },

  list: { padding: 16, paddingBottom: 120 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f8fafc', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemBrand: { fontSize: 10, fontWeight: '800', color: '#ea580c', marginBottom: 3 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  itemUnitPrice: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  qtyText: { fontSize: 15, fontWeight: '700', color: '#0f172a', minWidth: 24, textAlign: 'center' },
  itemLineTotal: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginLeft: 8 },
  deleteBtn: { padding: 6, marginLeft: 4 },

  coinsCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#fed7aa',
    borderLeftWidth: 4, borderLeftColor: '#ea580c',
  },
  coinsLeft: { flex: 1 },
  coinsTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  coinsSub: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  coinsMax: { fontSize: 12, color: '#ea580c', fontWeight: '600' },
  coinsBtn: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  coinsBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  coinsBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  coinsBtnTextActive: { color: '#fff' },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  summaryVal: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  gstNote: { fontSize: 11, color: '#94a3b8', marginTop: 10 },

  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  checkoutBarLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  checkoutBarTotal: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  checkoutBarSaved: { fontSize: 11, color: '#10b981', fontWeight: '600', marginTop: 1 },
  checkoutBtn: {
    backgroundColor: '#ea580c', paddingHorizontal: 28, paddingVertical: 16,
    borderRadius: 14, minWidth: 140, alignItems: 'center',
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
