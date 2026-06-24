import React, { useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

export default function UserDetailsScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Details</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={userInfo?.name} editable={false} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value={userInfo?.email} editable={false} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput style={styles.input} value={userInfo?.businessName} editable={false} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Address</Text>
          <TextInput style={styles.input} value={userInfo?.address} editable={false} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.saveButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#64748b', marginBottom: 5, fontWeight: '600' },
  input: {
    backgroundColor: '#e2e8f0', // grayed out because it's not editable yet
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#334155',
  },
  saveButton: {
    backgroundColor: '#ea580c',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
