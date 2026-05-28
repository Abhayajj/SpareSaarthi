import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to SpareSaarthi. We are committed to protecting your personal information and your right to privacy. 
          If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
          please contact us.
        </Text>

        <Text style={styles.heading}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest 
          in obtaining information about us or our products and services, when participating in activities on the Services or otherwise 
          contacting us.
        </Text>

        <Text style={styles.heading}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use personal information collected via our Services for a variety of business purposes described below. We process your 
          personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform 
          a contract with you, with your consent, and/or for compliance with our legal obligations.
        </Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>I Understand, Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  content: { padding: 20 },
  heading: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 15, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 10 },
  backButton: {
    backgroundColor: '#ea580c',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
