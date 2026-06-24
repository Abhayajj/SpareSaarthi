import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, FlatList, ActivityIndicator, Modal, Switch, Image,
  KeyboardAvoidingView, Platform, Alert as RNAlert,
} from 'react-native';

const Alert = {
  alert: (title, message, buttons) => {
    if (Platform.OS === 'web') {
      const displayMsg = message ? `${title}\n\n${message}` : title;
      if (buttons && buttons.length > 1) {
        const confirmResult = window.confirm(displayMsg);
        if (confirmResult) {
          const actionBtn = buttons.find(b => b.text !== 'Cancel' && b.text !== 'No' && b.onPress);
          if (actionBtn && actionBtn.onPress) actionBtn.onPress();
        } else {
          const cancelBtn = buttons.find(b => (b.text === 'Cancel' || b.text === 'No') && b.onPress);
          if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
        }
      } else {
        alert(displayMsg);
        if (buttons && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      RNAlert.alert(title, message, buttons);
    }
  }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Edit3, Package, ShoppingBag, Tag, Search,
  Check, PlusCircle, Trash2, RefreshCw, Layers, X,
  TrendingUp, AlertTriangle, ChevronDown, ChevronUp,
  FileText, UploadCloud,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../api/apiConfig';

const ORDER_STATUSES = ['Pending Payment', 'Confirmed', 'Self Pickup', 'Delivered'];

const BRAND_OPTIONS = ['Hero', 'Honda', 'Bajaj', 'TVS', 'Exide', 'Motul', 'Castrol'];

const OFFER_COLORS = [
  { label: 'Orange', value: '#ea580c' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Green', value: '#059669' },
  { label: 'Dark', value: '#0f172a' },
];

// ──────────────────────────────────────────────
// Reusable labelled input
// ──────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <View style={f.group}>
      <Text style={f.label}>{label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
      {children}
    </View>
  );
}

const f = StyleSheet.create({
  group: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
});

// ──────────────────────────────────────────────
// Quick stat card
// ──────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
  return (
    <View style={[sc.card, { borderTopColor: color }]}>
      <Text style={sc.icon}>{icon}</Text>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderTopWidth: 3, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  icon: { fontSize: 22, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
});

// ──────────────────────────────────────────────
// MAIN SCREEN
// ──────────────────────────────────────────────
export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ── Add Product Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [addBrand, setAddBrand] = useState('Hero');
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addOriginalPrice, setAddOriginalPrice] = useState('');
  const [addStock, setAddStock] = useState('');
  const [addDiscount, setAddDiscount] = useState('');
  const [addImage, setAddImage] = useState('');
  const [addIsHotDeal, setAddIsHotDeal] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  // ── Edit Product Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editIsHotDeal, setEditIsHotDeal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Bulk Stock Modal
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [selectedProds, setSelectedProds] = useState({});
  const [savingBulk, setSavingBulk] = useState(false);

  // ── Offer Modal
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerBadge, setOfferBadge] = useState('FLASH SALE');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerCategory, setOfferCategory] = useState('All Products');
  const [offerColor, setOfferColor] = useState('#ea580c');
  const [savingOffer, setSavingOffer] = useState(false);

  // ── Expanded orders
  const [expandedOrders, setExpandedOrders] = useState({});

  // ── AI Invoice States
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [processingInvoice, setProcessingInvoice] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);
  const [importingInvoice, setImportingInvoice] = useState(false);
  const [matchingItemIndex, setMatchingItemIndex] = useState(null);
  const [matchSearchText, setMatchSearchText] = useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setInvoiceFile(file);
        setParsedItems([]); // Clear previous scans
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to select document.');
    }
  };

  const handlePickProductImage = async (isEdit = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        if (Platform.OS === 'web') {
          const fileObj = file.file;
          if (fileObj) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Data = reader.result;
              if (isEdit) {
                setEditImage(base64Data);
              } else {
                setAddImage(base64Data);
              }
            };
            reader.readAsDataURL(fileObj);
            return;
          }
        }

        // Native / Fallback
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result;
          if (isEdit) {
            setEditImage(base64Data);
          } else {
            setAddImage(base64Data);
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to select product image.');
    }
  };

  const playNotificationSound = async () => {
    try {
      if (Platform.OS === 'web') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
        await audio.play();
      } else {
        const { Audio } = require('expo-av');
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav' }
        );
        await sound.playAsync();
      }
    } catch (err) {
      console.log('Failed to play notification sound:', err);
    }
  };

  const handleProcessInvoice = async () => {
    if (!invoiceFile) return;
    setProcessingInvoice(true);
    try {
      const mimeType = invoiceFile.mimeType || 'application/pdf';

      if (invoiceFile.uri === 'mock_demo') {
        await sendInvoiceToAPI('DEMO_BASE64_DATA', mimeType);
        return;
      }

      if (Platform.OS === 'web') {
        const fileObj = invoiceFile.file;
        if (fileObj) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result.split(',')[1];
              await sendInvoiceToAPI(base64Data, mimeType);
            } catch (err) {
              setProcessingInvoice(false);
              Alert.alert('Processing Failed', err.message);
            }
          };
          reader.readAsDataURL(fileObj);
          return;
        }
      }

      // Cross-platform fallback (Web without fileObj and Native Android/iOS)
      // Uses fetch to retrieve the URI as a blob, then FileReader converts it to Base64.
      try {
        const response = await fetch(invoiceFile.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result.split(',')[1];
            await sendInvoiceToAPI(base64Data, mimeType);
          } catch (err) {
            setProcessingInvoice(false);
            Alert.alert('Processing Failed', err.message);
          }
        };
        reader.onerror = () => {
          setProcessingInvoice(false);
          Alert.alert('Read Error', 'Failed to read picked file.');
        };
        reader.readAsDataURL(blob);
      } catch (fetchErr) {
        console.error('Fetch error for local URI:', fetchErr);
        setProcessingInvoice(false);
        Alert.alert('Network Error', 'Failed to fetch local document URI.');
      }

    } catch (err) {
      console.error(err);
      Alert.alert(
        'Read Error', 
        'Failed to read document file. If you are on an emulator, please use the "Use Demo Invoice File" option.'
      );
      setProcessingInvoice(false);
    }
  };

  const sendInvoiceToAPI = async (base64Data, mimeType) => {
    try {
      const { data } = await api.post('/products/process-invoice', {
        fileData: base64Data,
        mimeType: mimeType,
      });

      setParsedItems(data.items || []);
      if (data.isMock) {
        if (Platform.OS === 'web') {
          alert(`Demo Mode Active: ${data.message}`);
        } else {
          Alert.alert('Demo Mode Active', data.message);
        }
      }
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') {
        alert(`❌ Processing Failed: ${err.response?.data?.message || 'Could not parse invoice.'}`);
      } else {
        Alert.alert('Processing Failed', err.response?.data?.message || 'Could not parse invoice.');
      }
    } finally {
      setProcessingInvoice(false);
    }
  };

  const handleImportInvoice = async () => {
    if (parsedItems.length === 0) return;
    setImportingInvoice(true);
    try {
      const { data } = await api.post('/products/import-invoice', {
        items: parsedItems,
      });

      if (Platform.OS === 'web') {
        alert(`✅ Import Successful: ${data.message}`);
      } else {
        Alert.alert('✅ Import Successful', data.message);
      }
      setInvoiceModalVisible(false);
      setInvoiceFile(null);
      setParsedItems([]);
      fetchData(true); // refresh products list
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') {
        alert(`❌ Import Failed: ${err.response?.data?.message || 'Failed to import stock.'}`);
      } else {
        Alert.alert('Import Failed', err.response?.data?.message || 'Failed to import stock.');
      }
    } finally {
      setImportingInvoice(false);
    }
  };

  const updateParsedItem = (index, field, value) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ─────────────── Data fetching ───────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodRes, catRes, ordRes, offRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories'),
        api.get('/orders'),
        api.get('/offers/admin'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setOrders(ordRes.data);
      setOffers(offRes.data);
      if (!addCategoryId && catRes.data.length > 0) {
        setAddCategoryId(catRes.data[0]._id);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addCategoryId]);

  useEffect(() => { fetchData(); }, []);

  // ── Polling for new orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const ordRes = await api.get('/orders');
        const latestOrders = ordRes.data;
        
        setOrders(prevOrders => {
          if (prevOrders && prevOrders.length > 0 && latestOrders.length > prevOrders.length) {
            playNotificationSound();
            console.log('🎉 New order received! Playing notification chime...');
          }
          return latestOrders;
        });
      } catch (err) {
        console.log('Error polling for new orders:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ─────────────── Add Product ───────────────
  const resetAddForm = () => {
    setAddName(''); setAddPrice(''); setAddOriginalPrice('');
    setAddStock(''); setAddDiscount(''); setAddImage('');
    setAddIsHotDeal(false); setAddBrand('Hero');
    if (categories.length > 0) setAddCategoryId(categories[0]._id);
  };

  const handleAddProduct = async () => {
    if (!addName.trim() || !addPrice || !addOriginalPrice || !addStock || !addCategoryId) {
      Alert.alert('Missing Fields', 'Name, prices, stock and category are required.');
      return;
    }
    if (Number(addPrice) > Number(addOriginalPrice)) {
      Alert.alert('Invalid Price', 'Sale price cannot be higher than original price.');
      return;
    }
    setSavingAdd(true);
    try {
      await api.post('/products', {
        name: addName.trim(),
        brand: addBrand,
        category: addCategoryId,
        price: Number(addPrice),
        originalPrice: Number(addOriginalPrice),
        stock: Number(addStock),
        discount: addDiscount.trim(),
        image: addImage.trim(),
        isHotDeal: addIsHotDeal,
      });
      Alert.alert('✅ Product Added', `"${addName}" is now live in the catalog.`);
      setAddModalVisible(false);
      resetAddForm();
      fetchData(true);
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not add product.');
    } finally {
      setSavingAdd(false);
    }
  };

  // ─────────────── Edit Product ───────────────
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBrand(product.brand);
    setEditPrice(product.price.toString());
    setEditOriginalPrice(product.originalPrice.toString());
    setEditStock(product.stock.toString());
    setEditDiscount(product.discount || '');
    setEditImage(product.image || '');
    setEditIsHotDeal(product.isHotDeal || false);
    setEditModalVisible(true);
  };

  const handleUpdateProduct = async () => {
    if (!editName.trim() || !editPrice || !editOriginalPrice || !editStock) {
      Alert.alert('Missing Fields', 'All required fields must be filled.');
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/products/${editingProduct._id}`, {
        name: editName.trim(),
        brand: editBrand,
        price: Number(editPrice),
        originalPrice: Number(editOriginalPrice),
        stock: Number(editStock),
        discount: editDiscount,
        image: editImage,
        isHotDeal: editIsHotDeal,
      });
      Alert.alert('✅ Updated', 'Product updated successfully.');
      setEditModalVisible(false);
      fetchData(true);
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not update product.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ─────────────── Delete Product ───────────────
  const handleDeleteProduct = (product) => {
    const performDelete = async () => {
      try {
        await api.delete(`/products/${product._id}`);
        setProducts(prev => prev.filter(p => p._id !== product._id));
        Alert.alert('Deleted', `"${product.name}" has been removed.`);
      } catch {
        Alert.alert('Error', 'Failed to delete product.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${product.name}"? This cannot be undone.`);
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to permanently delete "${product.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // ─────────────── Bulk Stock ───────────────
  const handleBulkStock = async () => {
    const ids = Object.keys(selectedProds).filter(id => selectedProds[id]);
    if (ids.length === 0) return Alert.alert('No Selection', 'Please select at least one product.');
    if (!bulkQty || Number(bulkQty) <= 0) return Alert.alert('Invalid Qty', 'Enter a valid quantity.');
    setSavingBulk(true);
    try {
      const { data } = await api.put('/products/bulk-stock', {
        updates: ids.map(id => ({ productId: id, addQty: Number(bulkQty) })),
      });
      Alert.alert('✅ Done', `Added ${bulkQty} units to ${data.results.length} product(s).`);
      setBulkModalVisible(false);
      setBulkQty('');
      setSelectedProds({});
      fetchData(true);
    } catch {
      Alert.alert('Failed', 'Bulk update failed.');
    } finally {
      setSavingBulk(false);
    }
  };

  // ─────────────── Orders ───────────────
  const handleOrderStatus = async (orderId, status) => {
    try {
      const order = orders.find(o => o._id === orderId);
      await api.put(`/orders/${orderId}/status`, { 
        status,
        deliveryPartner: order?.deliveryPartner || '',
        trackingNumber: order?.trackingNumber || ''
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  // ─────────────── Offers ───────────────
  const handleCreateOffer = async () => {
    if (!offerTitle.trim() || !offerDesc.trim()) {
      Alert.alert('Required', 'Title and description are required.');
      return;
    }
    setSavingOffer(true);
    try {
      await api.post('/offers', {
        title: offerTitle.trim(), description: offerDesc.trim(),
        badgeText: offerBadge, discountPercent: Number(offerDiscount) || 0,
        bgColor: offerColor, applicableCategory: offerCategory,
      });
      Alert.alert('✅ Offer Live!', 'Mechanics will now see this offer.');
      setOfferModalVisible(false);
      setOfferTitle(''); setOfferDesc(''); setOfferDiscount('');
      setOfferBadge('FLASH SALE'); setOfferCategory('All Products'); setOfferColor('#ea580c');
      fetchData(true);
    } catch {
      Alert.alert('Failed', 'Could not create offer.');
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOffer = async (id) => {
    try {
      const { data } = await api.put(`/offers/${id}/toggle`);
      setOffers(prev => prev.map(o => o._id === id ? { ...o, isActive: data.isActive } : o));
    } catch {
      Alert.alert('Error', 'Could not toggle offer.');
    }
  };

  const handleDeleteOffer = (id, title) => {
    const performDelete = async () => {
      try {
        await api.delete(`/offers/${id}`);
        setOffers(prev => prev.filter(o => o._id !== id));
      } catch {
        Alert.alert('Error', 'Could not delete offer.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Delete "${title}"?`);
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Offer', `Delete "${title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  // ─────────────── Derived ───────────────
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const selectedCount = Object.values(selectedProds).filter(Boolean).length;

  const statusColor = (s) => {
    if (s === 'Confirmed') return { bg: '#dbeafe', text: '#2563eb' };
    if (s === 'Self Pickup') return { bg: '#fef3c7', text: '#d97706' };
    if (s === 'Delivered') return { bg: '#d1fae5', text: '#059669' };
    return { bg: '#f1f5f9', text: '#64748b' };
  };

  // ─────────────── Render ───────────────
  return (
    <SafeAreaView style={s.root}>

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerIcon}>
          <ArrowLeft color="#0f172a" size={22} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Admin Control Center</Text>
          <Text style={s.headerSub}>{products.length} products · {orders.length} orders</Text>
        </View>
        <TouchableOpacity onPress={() => fetchData(true)} style={s.headerIcon}>
          <RefreshCw color="#ea580c" size={20} />
        </TouchableOpacity>
      </View>

      {/* ─── STAT STRIP ─── */}
      {!loading && (
        <View style={s.statsRow}>
          <StatCard label="Products" value={products.length} color="#ea580c" icon="📦" />
          <View style={s.statGap} />
          <StatCard label="Orders" value={orders.length} color="#2563eb" icon="🛒" />
          <View style={s.statGap} />
          <StatCard label="Low Stock" value={lowStockCount} color="#dc2626" icon="⚠️" />
          <View style={s.statGap} />
          <StatCard label="Offers" value={offers.filter(o => o.isActive).length} color="#059669" icon="🎯" />
        </View>
      )}

      {/* ─── TABS ─── */}
      <View style={s.tabs}>
        {[
          { key: 'products', label: 'Products', icon: <Package size={16} /> },
          { key: 'orders',   label: 'Orders',   icon: <ShoppingBag size={16} /> },
          { key: 'offers',   label: 'Offers',   icon: <Tag size={16} /> },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, activeTab === t.key && s.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            {React.cloneElement(t.icon, { color: activeTab === t.key ? '#ea580c' : '#94a3b8' })}
            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <View style={s.centred}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={s.loadingText}>Loading data...</Text>
        </View>
      ) : activeTab === 'products' ? (

        /* ════════════ PRODUCTS TAB ════════════ */
        <View style={{ flex: 1 }}>
          {/* Toolbar */}
          <View style={s.toolbar}>
            <View style={s.searchWrap}>
              <Search color="#94a3b8" size={17} />
              <TextInput
                style={s.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X color="#94a3b8" size={16} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={s.toolbarBtnSecondary} onPress={() => setBulkModalVisible(true)}>
              <Layers color="#0f172a" size={16} />
              <Text style={s.toolbarBtnSecondaryText}>Bulk</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.toolbarBtnSecondary, { borderColor: '#ea580c', borderWidth: 1.5 }]} onPress={() => setInvoiceModalVisible(true)}>
              <FileText color="#ea580c" size={16} />
              <Text style={[s.toolbarBtnSecondaryText, { color: '#ea580c' }]}>AI Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.toolbarBtnPrimary} onPress={() => setAddModalVisible(true)}>
              <PlusCircle color="#fff" size={16} />
              <Text style={s.toolbarBtnPrimaryText}>Add</Text>
            </TouchableOpacity>
          </View>

          {lowStockCount > 0 && (
            <View style={s.warningBanner}>
              <AlertTriangle color="#92400e" size={16} />
              <Text style={s.warningText}>{lowStockCount} product(s) have low stock (under 10 units)</Text>
            </View>
          )}

          <FlatList
            data={filteredProducts}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyText}>No products found.</Text>
                <TouchableOpacity style={s.emptyAddBtn} onPress={() => setAddModalVisible(true)}>
                  <Text style={s.emptyAddBtnText}>+ Add First Product</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={s.productCard}>
                <Image
                  source={{ uri: item.image }}
                  style={s.productImage}
                />
                <View style={s.productInfo}>
                  <View style={s.productTopRow}>
                    <Text style={s.productBrandBadge}>{item.brand}</Text>
                    {item.isHotDeal && <Text style={s.hotBadge}>🔥 Hot</Text>}
                    {item.stock < 10 && <Text style={s.lowBadge}>⚠️ Low</Text>}
                  </View>
                  <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={s.productPriceRow}>
                    <Text style={s.productPrice}>₹{item.price}</Text>
                    <Text style={s.productOriginalPrice}>₹{item.originalPrice}</Text>
                    {item.discount ? <Text style={s.productDiscount}>{item.discount}</Text> : null}
                  </View>
                  <Text style={[s.productStock, { color: item.stock < 10 ? '#ef4444' : '#10b981' }]}>
                    Stock: {item.stock} units
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={s.productActions}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEditModal(item)}>
                    <Edit3 color="#fff" size={14} />
                    <Text style={s.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteProduct(item)}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

      ) : activeTab === 'orders' ? (

        /* ════════════ ORDERS TAB ════════════ */
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
          ListEmptyComponent={<View style={s.centred}><Text style={s.emptyText}>No orders yet.</Text></View>}
          renderItem={({ item }) => {
            const sc2 = statusColor(item.status);
            const expanded = !!expandedOrders[item._id];
            return (
              <View style={s.orderCard}>
                {/* Order Header - always visible */}
                <TouchableOpacity
                  style={s.orderHeader}
                  onPress={() => setExpandedOrders(p => ({ ...p, [item._id]: !p[item._id] }))}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderId}>#{item._id.substring(0, 8).toUpperCase()}</Text>
                    <Text style={s.orderDate}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    <Text style={s.orderBusiness}>{item.user?.businessName || 'Unknown Business'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[s.statusBadge, { backgroundColor: sc2.bg }]}>
                      <Text style={[s.statusBadgeText, { color: sc2.text }]}>{item.status}</Text>
                    </View>
                    <Text style={s.orderTotal}>₹{item.totalAmount}</Text>
                    {expanded
                      ? <ChevronUp color="#94a3b8" size={18} />
                      : <ChevronDown color="#94a3b8" size={18} />}
                  </View>
                </TouchableOpacity>

                {/* Expanded details */}
                {expanded && (
                  <View style={s.orderExpanded}>
                    <View style={s.orderDivider} />
                    <View style={s.buyerBox}>
                      <Text style={s.buyerName}>{item.user?.name || 'N/A'}</Text>
                      <Text style={s.buyerDetail}>📍 {item.user?.address || 'No address'}</Text>
                      <Text style={s.buyerDetail}>✉️ {item.user?.email || 'No email'}</Text>
                    </View>
                    {item.orderItems?.map((oi, idx) => (
                      <View key={idx} style={s.orderItemRow}>
                        <Text style={s.orderItemName} numberOfLines={1}>{oi.name}</Text>
                        <Text style={s.orderItemQty}>{oi.qty} × ₹{oi.price}</Text>
                      </View>
                    ))}
                    {item.coinsRedeemed > 0 && (
                      <Text style={s.coinsRow}>🪙 {item.coinsRedeemed} coins redeemed</Text>
                    )}
                    <View style={s.orderDivider} />
                    <Text style={s.statusChangeLabel}>Update Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4, gap: 8, marginBottom: 12 }}>
                      {ORDER_STATUSES.map(st => (
                        <TouchableOpacity
                          key={st}
                          style={[s.statusBtn, item.status === st && s.statusBtnActive]}
                          onPress={() => handleOrderStatus(item._id, st)}
                        >
                          {item.status === st && <Check size={12} color="#fff" />}
                          <Text style={[s.statusBtnText, item.status === st && s.statusBtnTextActive]}>{st}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Delivery Tracking Inputs */}
                    <View style={{ marginTop: 8, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>Delivery Tracking Info</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', marginBottom: 4 }}>DELIVERY PARTNER</Text>
                          <TextInput
                            style={[m.input, { paddingVertical: 6, fontSize: 13, backgroundColor: '#fff' }]}
                            placeholder="e.g. Delhivery, BlueDart"
                            value={item.deliveryPartner || ''}
                            onChangeText={(val) => {
                              setOrders(prev => prev.map(o => o._id === item._id ? { ...o, deliveryPartner: val } : o));
                            }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', marginBottom: 4 }}>TRACKING ID / REF</Text>
                          <TextInput
                            style={[m.input, { paddingVertical: 6, fontSize: 13, backgroundColor: '#fff' }]}
                            placeholder="e.g. 1234567890"
                            value={item.trackingNumber || ''}
                            onChangeText={(val) => {
                              setOrders(prev => prev.map(o => o._id === item._id ? { ...o, trackingNumber: val } : o));
                            }}
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{ backgroundColor: '#ea580c', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                        onPress={async () => {
                          try {
                            await api.put(`/orders/${item._id}/status`, { 
                              status: item.status, 
                              deliveryPartner: item.deliveryPartner || '', 
                              trackingNumber: item.trackingNumber || '' 
                            });
                            if (Platform.OS === 'web') {
                              alert('✅ Success: Tracking details updated successfully.');
                            } else {
                              Alert.alert('Success', 'Tracking details updated successfully.');
                            }
                          } catch (err) {
                            console.error(err);
                            if (Platform.OS === 'web') {
                              alert('❌ Error: Failed to update tracking details.');
                            } else {
                              Alert.alert('Error', 'Failed to update tracking details.');
                            }
                          }
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Save Tracking Info</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />

      ) : (

        /* ════════════ OFFERS TAB ════════════ */
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={s.createOfferBtn} onPress={() => setOfferModalVisible(true)}>
            <PlusCircle color="#fff" size={20} />
            <Text style={s.createOfferBtnText}>Create New Offer</Text>
          </TouchableOpacity>
          <FlatList
            data={offers}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={s.centred}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
                <Text style={s.emptyText}>No offers yet. Create one above!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[s.offerCard, { borderLeftColor: item.bgColor || '#ea580c' }]}>
                <View style={s.offerCardTop}>
                  <View style={[s.offerBadgeChip, { backgroundColor: item.bgColor }]}>
                    <Text style={s.offerBadgeChipText}>{item.badgeText}</Text>
                  </View>
                  <Text style={[s.offerPctText, { color: item.bgColor }]}>
                    {item.discountPercent > 0 ? `${item.discountPercent}% OFF` : ''}
                  </Text>
                </View>
                <Text style={s.offerTitle}>{item.title}</Text>
                <Text style={s.offerDesc}>{item.description}</Text>
                <Text style={s.offerCategory}>📦 {item.applicableCategory}</Text>
                <View style={s.offerActions}>
                  <View style={s.offerToggleRow}>
                    <Switch
                      value={item.isActive}
                      onValueChange={() => handleToggleOffer(item._id)}
                      trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }}
                      thumbColor={item.isActive ? '#059669' : '#94a3b8'}
                    />
                    <Text style={[s.offerStatusText, { color: item.isActive ? '#059669' : '#94a3b8' }]}>
                      {item.isActive ? 'Live' : 'Hidden'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteOffer(item._id, item.title)}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD PRODUCT
      ══════════════════════════════════════════ */}
      <Modal visible={addModalVisible} animationType="slide" transparent onRequestClose={() => setAddModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.sheetHandle} />
              <View style={m.sheetHeader}>
                <Text style={m.sheetTitle}>➕ Add New Product</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}><X color="#64748b" size={22} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                <Field label="Product Name" required>
                  <TextInput style={m.input} value={addName} onChangeText={setAddName} placeholder="e.g. Honda Activa Brake Shoe" />
                </Field>

                <Field label="Brand" required>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {BRAND_OPTIONS.map(b => (
                      <TouchableOpacity
                        key={b}
                        style={[m.chip, addBrand === b && m.chipActive]}
                        onPress={() => setAddBrand(b)}
                      >
                        <Text style={[m.chipText, addBrand === b && m.chipTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TextInput 
                    style={[m.input, { marginTop: 8 }]} 
                    value={addBrand} 
                    onChangeText={setAddBrand} 
                    placeholder="Or type a custom brand name..." 
                  />
                </Field>

                <Field label="Category" required>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat._id}
                        style={[m.chip, addCategoryId === cat._id && m.chipActive]}
                        onPress={() => setAddCategoryId(cat._id)}
                      >
                        <Text style={[m.chipText, addCategoryId === cat._id && m.chipTextActive]}>{cat.icon} {cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Field>

                <View style={m.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="Sale Price (₹)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={addPrice} onChangeText={setAddPrice} placeholder="180" />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Original Price (₹)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={addOriginalPrice} onChangeText={setAddOriginalPrice} placeholder="250" />
                    </Field>
                  </View>
                </View>

                <View style={m.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="Stock (Units)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={addStock} onChangeText={setAddStock} placeholder="50" />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Discount Tag">
                      <TextInput style={m.input} value={addDiscount} onChangeText={setAddDiscount} placeholder="28% Off" />
                    </Field>
                  </View>
                </View>

                <Field label="Product Image">
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TextInput 
                      style={[m.input, { flex: 1, marginBottom: 0 }]} 
                      value={addImage && addImage.startsWith('data:image') ? '[Uploaded Image]' : addImage} 
                      onChangeText={setAddImage} 
                      placeholder="https://... or upload image" 
                      autoCapitalize="none"
                      editable={!addImage || !addImage.startsWith('data:image')}
                    />
                    <TouchableOpacity 
                      style={{ backgroundColor: '#ea580c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' }}
                      onPress={() => handlePickProductImage(false)}
                    >
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Upload JPG</Text>
                    </TouchableOpacity>
                    {addImage && addImage.startsWith('data:image') ? (
                      <TouchableOpacity 
                        style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' }}
                        onPress={() => setAddImage('')}
                      >
                        <Trash2 color="#fff" size={16} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </Field>

                {addImage && addImage.length > 10 ? (
                  <Image source={{ uri: addImage }} style={m.imagePreview} resizeMode="contain" />
                ) : null}

                <View style={m.switchRow}>
                  <Text style={m.switchLabel}>🔥 Mark as Hot Deal</Text>
                  <Switch
                    value={addIsHotDeal}
                    onValueChange={setAddIsHotDeal}
                    trackColor={{ false: '#e2e8f0', true: '#fed7aa' }}
                    thumbColor={addIsHotDeal ? '#ea580c' : '#94a3b8'}
                  />
                </View>

                <TouchableOpacity style={m.submitBtn} onPress={handleAddProduct} disabled={savingAdd}>
                  {savingAdd
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={m.submitBtnText}>Add Product to Catalog</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: EDIT PRODUCT
      ══════════════════════════════════════════ */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.sheetHandle} />
              <View style={m.sheetHeader}>
                <Text style={m.sheetTitle}>✏️ Edit Product</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}><X color="#64748b" size={22} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                <Text style={m.editingName}>{editingProduct?.name}</Text>

                <Field label="Product Name" required>
                  <TextInput style={m.input} value={editName} onChangeText={setEditName} />
                </Field>

                <Field label="Brand" required>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {BRAND_OPTIONS.map(b => (
                      <TouchableOpacity
                        key={b}
                        style={[m.chip, editBrand === b && m.chipActive]}
                        onPress={() => setEditBrand(b)}
                      >
                        <Text style={[m.chipText, editBrand === b && m.chipTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TextInput 
                    style={[m.input, { marginTop: 8 }]} 
                    value={editBrand} 
                    onChangeText={setEditBrand} 
                    placeholder="Or type a custom brand name..." 
                  />
                </Field>

                <Field label="Product Image">
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TextInput 
                      style={[m.input, { flex: 1, marginBottom: 0 }]} 
                      value={editImage && editImage.startsWith('data:image') ? '[Uploaded Image]' : editImage} 
                      onChangeText={setEditImage} 
                      placeholder="https://... or upload image" 
                      autoCapitalize="none"
                      editable={!editImage || !editImage.startsWith('data:image')}
                    />
                    <TouchableOpacity 
                      style={{ backgroundColor: '#ea580c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' }}
                      onPress={() => handlePickProductImage(true)}
                    >
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Upload JPG</Text>
                    </TouchableOpacity>
                    {editImage && editImage.startsWith('data:image') ? (
                      <TouchableOpacity 
                        style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' }}
                        onPress={() => setEditImage('')}
                      >
                        <Trash2 color="#fff" size={16} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </Field>

                {editImage && editImage.length > 10 ? (
                  <Image source={{ uri: editImage }} style={m.imagePreview} resizeMode="contain" />
                ) : null}

                <View style={m.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="Sale Price (₹)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={editPrice} onChangeText={setEditPrice} />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Original Price (₹)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={editOriginalPrice} onChangeText={setEditOriginalPrice} />
                    </Field>
                  </View>
                </View>

                <View style={m.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="Stock (Units)" required>
                      <TextInput style={m.input} keyboardType="numeric" value={editStock} onChangeText={setEditStock} />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Discount Tag">
                      <TextInput style={m.input} value={editDiscount} onChangeText={setEditDiscount} placeholder="25% Off" />
                    </Field>
                  </View>
                </View>

                <View style={m.switchRow}>
                  <Text style={m.switchLabel}>🔥 Mark as Hot Deal</Text>
                  <Switch
                    value={editIsHotDeal}
                    onValueChange={setEditIsHotDeal}
                    trackColor={{ false: '#e2e8f0', true: '#fed7aa' }}
                    thumbColor={editIsHotDeal ? '#ea580c' : '#94a3b8'}
                  />
                </View>

                <TouchableOpacity style={m.submitBtn} onPress={handleUpdateProduct} disabled={savingEdit}>
                  {savingEdit
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={m.submitBtnText}>Save Changes</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: BULK STOCK
      ══════════════════════════════════════════ */}
      <Modal visible={bulkModalVisible} animationType="slide" transparent onRequestClose={() => setBulkModalVisible(false)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.sheetHandle} />
            <View style={m.sheetHeader}>
              <Text style={m.sheetTitle}>📦 Bulk Stock Update</Text>
              <TouchableOpacity onPress={() => setBulkModalVisible(false)}><X color="#64748b" size={22} /></TouchableOpacity>
            </View>
            <Text style={m.bulkSubtitle}>Add stock to multiple products at once</Text>

            <Field label="Units to Add per Product" required>
              <TextInput style={[m.input, { fontSize: 24, fontWeight: '800', textAlign: 'center', height: 64 }]}
                keyboardType="numeric" value={bulkQty} onChangeText={setBulkQty} placeholder="50" />
            </Field>

            <View style={m.bulkSelectHeader}>
              <Text style={[f.label, { flex: 1 }]}>Select Products ({selectedCount} selected)</Text>
              <TouchableOpacity onPress={() => {
                const all = products.every(p => selectedProds[p._id]);
                const ns = {};
                products.forEach(p => { ns[p._id] = !all; });
                setSelectedProds(ns);
              }}>
                <Text style={m.selectAllText}>{products.every(p => selectedProds[p._id]) ? 'Deselect All' : 'Select All'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {products.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={[m.bulkRow, selectedProds[item._id] && m.bulkRowActive]}
                  onPress={() => setSelectedProds(p => ({ ...p, [item._id]: !p[item._id] }))}
                >
                  <View style={[m.checkbox, selectedProds[item._id] && m.checkboxActive]}>
                    {selectedProds[item._id] && <Check size={13} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={m.bulkItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={m.bulkItemStock}>Stock: {item.stock} → {selectedProds[item._id] && bulkQty ? item.stock + Number(bulkQty) : item.stock}</Text>
                  </View>
                  <Text style={m.bulkItemBrand}>{item.brand}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[m.submitBtn, { marginTop: 16 }]} onPress={handleBulkStock} disabled={savingBulk}>
              {savingBulk
                ? <ActivityIndicator color="#fff" />
                : <Text style={m.submitBtnText}>Add {bulkQty || '?'} Units to {selectedCount} Products</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: CREATE OFFER
      ══════════════════════════════════════════ */}
      <Modal visible={offerModalVisible} animationType="slide" transparent onRequestClose={() => setOfferModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.sheetHandle} />
              <View style={m.sheetHeader}>
                <Text style={m.sheetTitle}>🎯 Create Offer</Text>
                <TouchableOpacity onPress={() => setOfferModalVisible(false)}><X color="#64748b" size={22} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                {/* Live Preview */}
                <View style={[m.offerPreview, { backgroundColor: offerColor }]}>
                  <Text style={m.offerPreviewBadge}>{offerBadge || 'BADGE'}</Text>
                  <Text style={m.offerPreviewTitle}>{offerTitle || 'Offer Title'}</Text>
                  {offerDiscount ? <Text style={m.offerPreviewDiscount}>{offerDiscount}% OFF</Text> : null}
                </View>

                <Field label="Offer Title" required>
                  <TextInput style={m.input} value={offerTitle} onChangeText={setOfferTitle} placeholder="e.g. Monsoon Brake Parts Sale" />
                </Field>

                <Field label="Description" required>
                  <TextInput style={[m.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                    value={offerDesc} onChangeText={setOfferDesc}
                    placeholder="Describe the offer for mechanics..." multiline />
                </Field>

                <View style={m.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="Badge Text">
                      <TextInput style={m.input} value={offerBadge} onChangeText={setOfferBadge} placeholder="FLASH SALE" />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Discount %">
                      <TextInput style={m.input} keyboardType="numeric" value={offerDiscount} onChangeText={setOfferDiscount} placeholder="25" />
                    </Field>
                  </View>
                </View>

                <Field label="Category">
                  <TextInput style={m.input} value={offerCategory} onChangeText={setOfferCategory} placeholder="All Products" />
                </Field>

                <Field label="Card Color">
                  <View style={m.colorRow}>
                    {OFFER_COLORS.map(c => (
                      <TouchableOpacity
                        key={c.value}
                        style={[m.colorDot, { backgroundColor: c.value }, offerColor === c.value && m.colorDotActive]}
                        onPress={() => setOfferColor(c.value)}
                      >
                        {offerColor === c.value && <Check size={14} color="#fff" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>

                <TouchableOpacity style={m.submitBtn} onPress={handleCreateOffer} disabled={savingOffer}>
                  {savingOffer
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={m.submitBtnText}>Publish Offer to Mechanics</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: INVOICE STOCK IMPORTER (AI SCAN)
      ══════════════════════════════════════════ */}
      <Modal visible={invoiceModalVisible} animationType="slide" transparent onRequestClose={() => setInvoiceModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={[m.sheet, { maxHeight: '95%' }]}>
              <View style={m.sheetHandle} />
              <View style={m.sheetHeader}>
                <Text style={m.sheetTitle}>🤖 AI Invoice Stock Importer</Text>
                <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}><X color="#64748b" size={22} /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* File Upload Trigger */}
                <TouchableOpacity style={im.uploadBox} onPress={handlePickDocument}>
                  <UploadCloud color="#ea580c" size={32} />
                  <Text style={im.uploadTitle}>
                    {invoiceFile ? invoiceFile.name : 'Select Invoice Image or PDF'}
                  </Text>
                  <Text style={im.uploadSub}>
                    {invoiceFile ? `Size: ${Math.round(invoiceFile.size / 1024)} KB` : 'Tap to browse device files'}
                  </Text>
                </TouchableOpacity>

                {!invoiceFile && (
                  <TouchableOpacity
                    style={[m.submitBtn, { marginTop: 12, backgroundColor: '#1e293b' }]}
                    onPress={() => {
                      setInvoiceFile({
                        name: 'demo_supplier_invoice.pdf',
                        size: 34500,
                        mimeType: 'application/pdf',
                        uri: 'mock_demo'
                      });
                      setParsedItems([]);
                    }}
                  >
                    <Text style={m.submitBtnText}>📄 Use Demo Invoice File (Testing)</Text>
                  </TouchableOpacity>
                )}

                {invoiceFile && parsedItems.length === 0 && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      style={[m.submitBtn, { flex: 1, backgroundColor: '#64748b' }]}
                      onPress={() => {
                        setInvoiceFile(null);
                        setParsedItems([]);
                      }}
                    >
                      <Text style={m.submitBtnText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[m.submitBtn, { flex: 2 }]}
                      onPress={handleProcessInvoice}
                      disabled={processingInvoice}
                    >
                      {processingInvoice ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={m.submitBtnText}>Analyze with AI 🤖</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Processing status */}
                {processingInvoice && (
                  <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Text style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>
                      Gemini is OCR parsing & semantically matching items...
                    </Text>
                  </View>
                )}

                {/* Parsed Items Review Table */}
                {parsedItems.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    {/* Summary Card */}
                    <View style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <View>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Import Summary</Text>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>{parsedItems.length} Products parsed</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Valuation</Text>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#ea580c', marginTop: 2 }}>
                          ₹{parsedItems.reduce((acc, item) => acc + (item.qty * item.purchasePrice), 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    <Text style={[f.label, { marginBottom: 10 }]}>Verify Parsed Stock Items ({parsedItems.length})</Text>
                    {parsedItems.map((item, idx) => {
                      const matchedDbProduct = item.matchedProductId 
                        ? products.find(p => p._id === item.matchedProductId)
                        : null;

                      return (
                        <View key={idx} style={im.parsedCard}>
                          {/* Status bar */}
                          <View style={im.cardStatusHeader}>
                            {item.matchedProductId ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={[s.statusBadge, { backgroundColor: '#d1fae5', paddingVertical: 2, paddingHorizontal: 8 }]}>
                                  <Text style={{ color: '#059669', fontSize: 10, fontWeight: '800' }}>✓ Existing Product Matched</Text>
                                </View>
                                <TouchableOpacity 
                                  style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#f1f5f9', borderRadius: 6 }}
                                  onPress={() => {
                                    updateParsedItem(idx, 'matchedProductId', null);
                                  }}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b' }}>Unlink</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={[s.statusBadge, { backgroundColor: '#ffedd5', paddingVertical: 2, paddingHorizontal: 8 }]}>
                                  <Text style={{ color: '#ea580c', fontSize: 10, fontWeight: '800' }}>★ Suggest New Product</Text>
                                </View>
                                <TouchableOpacity 
                                  style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fdf2f8', borderRadius: 6 }}
                                  onPress={() => {
                                    setMatchingItemIndex(idx);
                                    setMatchSearchText('');
                                  }}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#db2777' }}>Link to Existing</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                            <TouchableOpacity onPress={() => {
                              setParsedItems(prev => prev.filter((_, i) => i !== idx));
                            }}>
                              <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>

                          {/* Matching Dropdown Overlay inside Card */}
                          {matchingItemIndex === idx ? (
                            <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>Search Store Products</Text>
                                <TouchableOpacity onPress={() => setMatchingItemIndex(null)}>
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>Close</Text>
                                </TouchableOpacity>
                              </View>
                              <TextInput
                                style={[m.input, { paddingVertical: 6, fontSize: 13, marginBottom: 8 }]}
                                placeholder="Type part name or brand..."
                                value={matchSearchText}
                                onChangeText={setMatchSearchText}
                              />
                              {products.filter(p => 
                                p.name.toLowerCase().includes(matchSearchText.toLowerCase()) || 
                                p.brand.toLowerCase().includes(matchSearchText.toLowerCase())
                              ).slice(0, 5).map(p => (
                                <TouchableOpacity
                                  key={p._id}
                                  style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                  onPress={() => {
                                    updateParsedItem(idx, 'matchedProductId', p._id);
                                    updateParsedItem(idx, 'name', p.name);
                                    updateParsedItem(idx, 'brand', p.brand);
                                    setMatchingItemIndex(null);
                                  }}
                                >
                                  <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>{p.name}</Text>
                                    <Text style={{ fontSize: 11, color: '#64748b' }}>Brand: {p.brand}</Text>
                                  </View>
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#ea580c' }}>Link</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : null}

                          {/* Matched product indicator info */}
                          {item.matchedProductId && matchedDbProduct && (
                            <View style={{ backgroundColor: '#ecfdf5', borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: '#a7f3d0' }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#065f46' }}>Linked Product: {matchedDbProduct.name}</Text>
                              <Text style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>Current Stock: {matchedDbProduct.stock} | Selling Price: ₹{matchedDbProduct.price}</Text>
                            </View>
                          )}

                          {/* Name Input */}
                          <TextInput
                            style={[m.input, { fontWeight: '700', fontSize: 14, marginBottom: 8, paddingVertical: 8 }]}
                            value={item.name}
                            onChangeText={(v) => updateParsedItem(idx, 'name', v)}
                            placeholder="Product Name"
                            editable={!item.matchedProductId}
                          />

                          <View style={m.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Field label="Qty to Add">
                                <TextInput
                                  style={[m.input, { paddingVertical: 8 }]}
                                  keyboardType="numeric"
                                  value={item.qty.toString()}
                                  onChangeText={(v) => updateParsedItem(idx, 'qty', Number(v) || 0)}
                                />
                              </Field>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Field label="Purchase Price (₹)">
                                <TextInput
                                  style={[m.input, { paddingVertical: 8 }]}
                                  keyboardType="numeric"
                                  value={item.purchasePrice.toString()}
                                  onChangeText={(v) => updateParsedItem(idx, 'purchasePrice', Number(v) || 0)}
                                />
                              </Field>
                            </View>
                          </View>

                          {/* If it's a new product suggestion, let the admin specify Brand and Category */}
                          {!item.matchedProductId && (
                            <View style={[m.row, { marginTop: 4 }]}>
                              <View style={{ flex: 1, marginRight: 8 }}>
                                <Field label="Brand">
                                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingVertical: 2 }}>
                                    {BRAND_OPTIONS.map(b => (
                                      <TouchableOpacity
                                        key={b}
                                        style={[m.chip, { paddingHorizontal: 10, paddingVertical: 5 }, item.brand === b && m.chipActive]}
                                        onPress={() => updateParsedItem(idx, 'brand', b)}
                                      >
                                        <Text style={[m.chipText, { fontSize: 11 }, item.brand === b && m.chipTextActive]}>{b}</Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </Field>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Field label="Category">
                                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingVertical: 2 }}>
                                    {categories.map(cat => (
                                      <TouchableOpacity
                                        key={cat._id}
                                        style={[m.chip, { paddingHorizontal: 10, paddingVertical: 5 }, item.suggestedCategoryName === cat.name && m.chipActive]}
                                        onPress={() => updateParsedItem(idx, 'suggestedCategoryName', cat.name)}
                                      >
                                        <Text style={[m.chipText, { fontSize: 11 }, item.suggestedCategoryName === cat.name && m.chipTextActive]}>
                                          {cat.icon} {cat.name}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </Field>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}

                    <TouchableOpacity
                      style={[m.submitBtn, { marginTop: 14, backgroundColor: '#059669' }]}
                      onPress={handleImportInvoice}
                      disabled={importingInvoice}
                    >
                      {importingInvoice ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={m.submitBtnText}>
                          Confirm and Import {parsedItems.length} Items (₹{parsedItems.reduce((acc, item) => acc + (item.qty * item.purchasePrice), 0).toLocaleString('en-IN')})
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────
// STYLES
// ─────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerIcon: { padding: 6, borderRadius: 8, backgroundColor: '#f8fafc' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  statGap: { width: 10 },

  // Tabs
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 6,
  },
  tabActive: { borderBottomColor: '#ea580c' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#ea580c', fontWeight: '700' },

  // Toolbar
  toolbar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    paddingTop: 14, paddingBottom: 8, gap: 10,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, height: 42,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  toolbarBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 5,
  },
  toolbarBtnSecondaryText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  toolbarBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ea580c',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 5,
  },
  toolbarBtnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Warning
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 4,
    backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  warningText: { fontSize: 12, color: '#92400e', fontWeight: '600', flex: 1 },

  // Product card
  productCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  productImage: {
    width: 70, height: 70, borderRadius: 10, backgroundColor: '#f1f5f9',
  },
  productInfo: { flex: 1 },
  productTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  productBrandBadge: {
    fontSize: 10, fontWeight: '800', color: '#ea580c',
    backgroundColor: '#fff7ed', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  hotBadge: {
    fontSize: 10, fontWeight: '700', backgroundColor: '#fff7ed',
    color: '#ea580c', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  lowBadge: {
    fontSize: 10, fontWeight: '700', backgroundColor: '#fef2f2',
    color: '#ef4444', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  productName: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 5 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  productOriginalPrice: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' },
  productDiscount: { fontSize: 11, color: '#10b981', fontWeight: '700' },
  productStock: { fontSize: 12, fontWeight: '600' },
  productActions: { alignItems: 'center', gap: 8 },
  editBtn: {
    backgroundColor: '#ea580c', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4,
  },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  deleteBtn: {
    padding: 8, backgroundColor: '#fef2f2', borderRadius: 8,
  },

  // Empty
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginBottom: 16 },
  emptyAddBtn: {
    backgroundColor: '#ea580c', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  emptyAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 14 },

  // Orders
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', padding: 14, alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  orderDate: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  orderBusiness: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 4 },
  orderTotal: { fontSize: 14, fontWeight: '800', color: '#ea580c' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-end' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  orderExpanded: { paddingHorizontal: 14, paddingBottom: 14 },
  orderDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  buyerBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 10 },
  buyerName: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 3 },
  buyerDetail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  orderItemName: { fontSize: 13, color: '#334155', flex: 1, marginRight: 10 },
  orderItemQty: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  coinsRow: { fontSize: 12, color: '#d97706', fontWeight: '600', marginTop: 4 },
  statusChangeLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  statusBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', gap: 5,
  },
  statusBtnActive: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  statusBtnText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  statusBtnTextActive: { color: '#fff', fontWeight: '700' },

  // Offers
  createOfferBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#059669', margin: 14, borderRadius: 12, paddingVertical: 15, gap: 8,
  },
  createOfferBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  offerCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 15, marginBottom: 12,
    borderLeftWidth: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  offerCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  offerBadgeChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  offerBadgeChipText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  offerPctText: { fontSize: 16, fontWeight: '900' },
  offerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  offerDesc: { fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 18 },
  offerCategory: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  offerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  offerStatusText: { fontSize: 13, fontWeight: '700' },
});

// Modal styles
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', paddingHorizontal: 20, paddingBottom: 30,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2,
    alignSelf: 'center', marginTop: 12, marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  editingName: { fontSize: 13, color: '#64748b', marginBottom: 16, fontStyle: 'italic' },

  input: {
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#0f172a',
  },
  row: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  imagePreview: {
    width: '100%', height: 100, borderRadius: 10, backgroundColor: '#f1f5f9', marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', marginBottom: 14,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  submitBtn: {
    backgroundColor: '#ea580c', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Bulk
  bulkSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 14 },
  bulkSelectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  selectAllText: { fontSize: 13, color: '#ea580c', fontWeight: '700' },
  bulkRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc', gap: 12,
  },
  bulkRowActive: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 4 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  bulkItemName: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  bulkItemStock: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  bulkItemBrand: { fontSize: 11, color: '#ea580c', fontWeight: '700' },

  // Offers
  offerPreview: { borderRadius: 14, padding: 18, marginBottom: 16 },
  offerPreviewBadge: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  offerPreviewTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  offerPreviewDiscount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  colorRow: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  colorDot: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  colorDotActive: { borderWidth: 3, borderColor: '#0f172a' },
});

// Styles for Invoice Importer
const im = StyleSheet.create({
  uploadBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ea580c',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  parsedCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  cardStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
});
