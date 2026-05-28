import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Search, User, Zap } from 'lucide-react-native';
import api from '../api/apiConfig';
import { CartContext } from '../context/CartContext';

const BRANDS = [
  { id: 'hero', name: 'Hero', color: '#ff0000' },
  { id: 'bajaj', name: 'Bajaj', color: '#0055a5' },
  { id: 'honda', name: 'Honda', color: '#e3000f' },
  { id: 'tvs', name: 'TVS', color: '#0033a0' },
];

export default function HomeScreen({ navigation }) {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (deal) => {
    addToCart(deal);
    Alert.alert('Added to Cart', `${deal.name} has been added to your cart.`, [
      { text: 'Continue Shopping' },
      { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
    ]);
  };

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        const { data } = await api.get('/products?isHotDeal=true');
        setHotDeals(data);
      } catch (error) {
        console.error('Error fetching hot deals', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotDeals();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.profileIconContainer} 
              onPress={() => navigation.navigate('Profile')}
            >
              <User color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SpareSaarthi</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="gray" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search with Part Name"
            placeholderTextColor="gray"
          />
        </View>

        {/* Bike Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bike Brands</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
            {BRANDS.map(brand => (
              <TouchableOpacity key={brand.id} style={styles.brandCard}>
                <Text style={[styles.brandText, { color: brand.color }]}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Banner */}
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
                     <Image source={{ uri: deal.image }} style={styles.dealImage} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ea580c', // orange-600
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ea580c', // brand color
    letterSpacing: 0.5,
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
});
