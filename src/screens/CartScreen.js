import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import api from '../api/apiConfig';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal()
      };

      await api.post('/orders', orderData);
      
      clearCart();
      Alert.alert('Order Placed!', 'Your order has been placed successfully.', [
        { text: 'View Orders', onPress: () => navigation.navigate('Orders') }
      ]);
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Checkout Failed', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <ShoppingCart color="#ea580c" size={80} />
          </View>
          <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
          <Text style={styles.emptyStateSubText}>Looks like you haven't added any spare parts to your cart yet.</Text>
          
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.cartList}>
            {cartItems.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item._id, 'decrement')}
                    >
                      <Minus size={16} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item._id, 'increment')}
                    >
                      <Plus size={16} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => removeFromCart(item._id)}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{getCartTotal()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton} 
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#ffedd5', // orange-100
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#0f172a',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#ea580c', // orange-600
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 10,
  },
  checkoutBar: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  checkoutButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    flex: 1,
    marginLeft: 15,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
