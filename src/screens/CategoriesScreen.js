import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../api/apiConfig';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={2} textAlign="center">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
        />
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
  listContent: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
