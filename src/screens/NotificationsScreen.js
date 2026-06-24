import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

const NOTIFICATIONS = [
  { id: '1', title: 'Welcome to SpareSaarthi!', message: 'Thank you for registering. You have received 100 coins as a welcome bonus!', date: 'Today' },
  { id: '2', title: 'New Hot Deals!', message: 'Check out the new Exide Batteries at 33% off.', date: 'Yesterday' },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconContainer}>
        <Bell color="#ea580c" size={24} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  list: { padding: 20 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#ffedd5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  message: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  date: { fontSize: 12, color: '#94a3b8' },
});
