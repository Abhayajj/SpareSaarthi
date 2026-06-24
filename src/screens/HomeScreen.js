import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, User, Zap, Tag, Bell } from 'lucide-react-native';
import api from '../api/apiConfig';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const BRANDS = [
  { id: 'hero', name: 'Hero', color: '#ff0000' },
  { id: 'bajaj', name: 'Bajaj', color: '#0055a5' },
  { id: 'honda', name: 'Honda', color: '#e3000f' },
  { id: 'tvs', name: 'TVS', color: '#0033a0' },
];

export default function HomeScreen({ navigation }) {
  const [hotDeals, setHotDeals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleAddToCart = (deal) => {
    addToCart(deal);
    if (Platform.OS === 'web') {
      const goToCart = window.confirm(`${deal.name} has been added to your cart. Go to Cart?`);
      if (goToCart) {
        navigation.navigate('Cart');
      }
    } else {
      Alert.alert('Added to Cart', `${deal.name} has been added to your cart.`, [
        { text: 'Continue Shopping' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
      ]);
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [dealsRes, offersRes, ordersRes] = await Promise.all([
          api.get('/products?isHotDeal=true'),
          api.get('/offers'),
          api.get('/orders/myorders'),
        ]);
        setHotDeals(dealsRes.data);
        setOffers(offersRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>{greeting()}, 👋</Text>
              <Text style={styles.headerTitle}>
                {userInfo?.businessName || userInfo?.name || 'SpareSaarthi'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileIconContainer}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileInitials}>
                {(userInfo?.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mechanic Stats Strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ea580c' }]}>🪙 {userInfo?.coins || 0}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="gray" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search with Part Name"
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                navigation.navigate('Products', { initialSearch: searchQuery });
                setSearchQuery('');
              }
            }}
            returnKeyType="search"
          />
        </View>

        {/* Bike Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bike Brands</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
            {BRANDS.map(brand => (
              <TouchableOpacity 
                key={brand.id} 
                style={styles.brandCard}
                onPress={() => navigation.navigate('Products', { initialBrand: brand.name })}
              >
                <Text style={[styles.brandText, { color: brand.color }]}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Active Offers Strip ─── */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
              <Tag color="#7c3aed" size={20} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {offers.map(offer => (
                <View
                  key={offer._id}
                  style={[styles.offerCard, { backgroundColor: offer.bgColor || '#ea580c' }]}
                >
                  <Text style={styles.offerBadge}>{offer.badgeText}</Text>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  {offer.discountPercent > 0 && (
                    <Text style={styles.offerDiscount}>{offer.discountPercent}% OFF</Text>
                  )}
                  <Text style={styles.offerDesc} numberOfLines={2}>{offer.description}</Text>
                  <View style={styles.offerCategoryChip}>
                    <Text style={styles.offerCategoryText}>📦 {offer.applicableCategory}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.offerShopBtn}
                    onPress={() => navigation.navigate('Products')}
                  >
                    <Text style={styles.offerShopBtnText}>Shop Now →</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Banner ─── */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>SPARE PARTS SALE</Text>
            <Text style={styles.bannerSubText}>Best Quality, Best Margins!</Text>
          </View>
        </View>

        {/* Hot Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Deals</Text>
            <Zap color="#eab308" size={20} fill="#eab308" />
          </View>
          <View style={styles.dealsGrid}>
            {loading ? (
              <ActivityIndicator size="large" color="#ea580c" style={{marginTop: 20}} />
            ) : hotDeals.length > 0 ? (
              hotDeals.map(deal => (
                <View key={deal._id} style={styles.dealCard}>
                  <Text style={styles.dealTitle} numberOfLines={1}>{deal.name}</Text>
                  <View style={styles.dealImageContainer}>
                     <Image
                       source={{ uri: deal.image }}
                       style={styles.dealImage}
                       onError={(e) => {
                         e.target.src = `https://placehold.co/150x150/e2e8f0/475569/png?text=${encodeURIComponent(deal.brand || 'Part')}`;
                       }}
                     />
                  </View>
                  <View style={styles.dealInfo}>
                    <Text style={styles.discountText}>{deal.discount || 'Special'}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.currentPrice}>₹{deal.price}</Text>
                      <Text style={styles.originalPrice}>₹{deal.originalPrice}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(deal)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{color: 'gray', marginTop: 10}}>No hot deals found.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginRight: 8,
    marginBottom: 10,
  },
  brandsScroll: {
    paddingBottom: 5,
  },
  brandCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brandText: {
    fontWeight: '800',
    fontSize: 16,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  banner: {
    backgroundColor: '#0f172a', // slate-900
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
    borderLeftWidth: 5,
    borderLeftColor: '#ea580c',
  },
  bannerText: {
    color: '#fff',
    backgroundColor: '#ea580c', // orange-600
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 12,
  },
  bannerSubText: {
    color: '#fbbf24', // amber-400
    fontSize: 24,
    fontWeight: '800',
    width: '60%',
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dealCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dealTitle: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 10,
  },
  dealImageContainer: {
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dealImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  dealInfo: {},
  discountText: {
    color: '#10b981', // emerald-500
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#ea580c', // orange-600
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // ─── Offer Cards ───
  offerCard: {
    width: 260,
    borderRadius: 16,
    padding: 18,
    marginRight: 14,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  offerBadge: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  offerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  offerDiscount: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 4,
  },
  offerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  offerCategoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  offerCategoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  offerShopBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  offerShopBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
