import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, FlatList, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, ShoppingCart, X, ShieldCheck, Truck, Sparkles } from 'lucide-react-native';
import api from '../api/apiConfig';
import { CartContext } from '../context/CartContext';

export default function ProductsScreen({ route, navigation }) {
  const { initialCategory, initialBrand, initialSearch } = route.params || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const { addToCart } = useContext(CartContext);

  const BRANDS = ['Hero', 'Bajaj', 'Honda', 'TVS', 'Exide', 'Motul', 'Castrol'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch categories and brands
        const [catRes, prodRes, brandRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/products'),
          api.get('/products/brands').catch(() => ({ data: [] })),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
        setBrands(brandRes.data);
      } catch (error) {
        console.error('Error fetching products/categories:', error);
        Alert.alert('Error', 'Failed to load spare parts catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    if (Platform.OS === 'web') {
      const goToCart = window.confirm(`${product.name} has been added to your cart. Go to Cart?`);
      if (goToCart) {
        navigation.navigate('Cart');
      }
    } else {
      Alert.alert('Added to Cart', `${product.name} has been added to your cart.`, [
        { text: 'Continue' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
      ]);
    }
  };

  // Filtering logic
  const filteredProducts = products.filter(product => {
    // Brand filter
    if (selectedBrand && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    // Category filter
    if (selectedCategory && product.category?._id !== selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchBrand = product.brand.toLowerCase().includes(query);
      const matchCat = product.category?.name?.toLowerCase().includes(query);
      return matchName || matchBrand || matchCat;
    }
    return true;
  });

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => {
        setSelectedProduct(item);
        setQty(1);
      }}
    >
      <Text style={styles.productBrand}>{item.brand.toUpperCase()}</Text>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          onError={(e) => {
            e.target.src = `https://placehold.co/150x150/e2e8f0/475569/png?text=${encodeURIComponent(item.brand)}`;
          }}
        />
      </View>
      <View style={styles.priceContainer}>
        <View>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
        </View>
        <Text style={styles.discountText}>{item.discount || 'Special'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spare Parts Catalog</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <ShoppingCart color="#0f172a" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="gray" size={20} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search spare parts..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Options */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {/* Brand Filters */}
          <TouchableOpacity 
            style={[styles.filterChip, !selectedBrand && !selectedCategory && styles.activeChip]}
            onPress={() => {
              setSelectedBrand(null);
              setSelectedCategory(null);
            }}
          >
            <Text style={[styles.chipText, !selectedBrand && !selectedCategory && styles.activeChipText]}>All</Text>
          </TouchableOpacity>

          {/* Categories */}
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat._id}
              style={[styles.filterChip, selectedCategory === cat._id && styles.activeChip]}
              onPress={() => {
                setSelectedCategory(cat._id);
                setSelectedBrand(null);
              }}
            >
              <Text style={[styles.chipText, selectedCategory === cat._id && styles.activeChipText]}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Brands */}
          {(brands.length > 0 ? brands.map(b => b.name) : BRANDS).map(brand => (
            <TouchableOpacity 
              key={brand}
              style={[styles.filterChip, selectedBrand === brand && styles.activeChip]}
              onPress={() => {
                setSelectedBrand(brand);
                setSelectedCategory(null);
              }}
            >
              <Text style={[styles.chipText, selectedBrand === brand && styles.activeChipText]}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{ marginTop: 50 }} />
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No parts found matching your selection.</Text>
          <TouchableOpacity 
            style={styles.resetBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedBrand(null);
              setSelectedCategory(null);
            }}
          >
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          visible={selectedProduct !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProduct(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>Product Details</Text>
                <TouchableOpacity
                  onPress={() => setSelectedProduct(null)}
                  style={styles.closeBtn}
                >
                  <X color="#475569" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Product Image */}
                <View style={styles.modalImageWrapper}>
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.modalProductImage}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/300x300/e2e8f0/475569/png?text=${encodeURIComponent(selectedProduct.brand)}`;
                    }}
                  />
                  {selectedProduct.isHotDeal && (
                    <View style={styles.hotDealBadge}>
                      <Sparkles color="#fff" size={12} style={{ marginRight: 4 }} />
                      <Text style={styles.hotDealText}>Hot Deal</Text>
                    </View>
                  )}
                </View>

                {/* Brand & Name */}
                <View style={styles.modalMetaSection}>
                  <Text style={styles.modalBrand}>{selectedProduct.brand.toUpperCase()}</Text>
                  <Text style={styles.modalName}>{selectedProduct.name}</Text>
                  
                  {/* Category Chip */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Category:</Text>
                    <Text style={styles.metaValue}>{selectedProduct.category?.name || 'Spare Parts'}</Text>
                  </View>
                </View>

                {/* Pricing Card */}
                <View style={styles.modalPriceCard}>
                  <View style={styles.modalPriceRow}>
                    <View>
                      <Text style={styles.modalPriceLabel}>Special Price</Text>
                      <Text style={styles.modalPriceValue}>₹{selectedProduct.price}</Text>
                    </View>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.modalOriginalPrice}>MRP ₹{selectedProduct.originalPrice}</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            {selectedProduct.discount || `${Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.stockStatusContainer}>
                    <View style={[
                      styles.stockStatusDot,
                      { backgroundColor: selectedProduct.stock > 10 ? '#10b981' : selectedProduct.stock > 0 ? '#f59e0b' : '#ef4444' }
                    ]} />
                    <Text style={styles.stockStatusText}>
                      {selectedProduct.stock > 10
                        ? `In Stock (${selectedProduct.stock} available)`
                        : selectedProduct.stock > 0
                        ? `Only ${selectedProduct.stock} left in stock - order soon!`
                        : 'Out of Stock'}
                    </Text>
                  </View>
                </View>

                {/* Premium Perks / Info */}
                <View style={styles.perksSection}>
                  <View style={styles.perkRow}>
                    <ShieldCheck color="#10b981" size={20} />
                    <Text style={styles.perkText}>100% Genuine and Certified OEM Spare Part</Text>
                  </View>
                  <View style={styles.perkRow}>
                    <Truck color="#ea580c" size={20} />
                    <Text style={styles.perkText}>Free Delivery on orders above ₹1,999</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descSection}>
                  <Text style={styles.descTitle}>Description</Text>
                  <Text style={styles.descContent}>
                    High-quality replacement spare part built to exact factory specifications. Designed for high durability, weather resistance, and premium performance for long-term usage. Ensure safe and reliable riding/servicing with this certified component.
                  </Text>
                </View>
              </ScrollView>

              {/* Sticky Footer */}
              <View style={styles.modalFooter}>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(q => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(q => Math.min(selectedProduct.stock || 99, q + 1))}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.modalAddBtn, selectedProduct.stock <= 0 && styles.disabledBtn]}
                  disabled={selectedProduct.stock <= 0}
                  onPress={() => {
                    addToCart(selectedProduct, qty);
                    setSelectedProduct(null);
                  }}
                >
                  <Text style={styles.modalAddBtnText}>
                    {selectedProduct.stock <= 0 ? 'Out of Stock' : `Add to Cart • ₹${selectedProduct.price * qty}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  cartBtn: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
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
  filterSection: {
    marginTop: 12,
    paddingLeft: 20,
    paddingBottom: 5,
  },
  filterScroll: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productBrand: {
    fontSize: 10,
    color: '#ea580c',
    fontWeight: '800',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    height: 40,
    marginBottom: 8,
  },
  imageContainer: {
    height: 90,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  modalImageWrapper: {
    height: 220,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  modalProductImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  hotDealBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ea580c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hotDealText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalMetaSection: {
    marginBottom: 16,
  },
  modalBrand: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ea580c',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  modalPriceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPriceLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  modalPriceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalOriginalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '800',
  },
  stockStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  stockStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockStatusText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  perksSection: {
    gap: 12,
    marginBottom: 20,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  descSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    marginBottom: 10,
  },
  descTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  descContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    height: 52,
  },
  qtyBtn: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 24,
    textAlign: 'center',
  },
  modalAddBtn: {
    flex: 1,
    backgroundColor: '#ea580c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledBtn: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalAddBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
