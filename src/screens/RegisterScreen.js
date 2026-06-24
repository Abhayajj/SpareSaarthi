import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Zap, ArrowLeft, User, Building2, MapPin, Mail, Lock } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

function InputRow({ icon: Icon, label, children }) {
  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <Icon color="#475569" size={18} style={{ marginRight: 10 }} />
        {children}
      </View>
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!name.trim() || !businessName.trim() || !address.trim() || !email.trim() || !password) {
      setError('Please fill in all fields to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, businessName.trim(), address.trim());
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <ArrowLeft color="#94a3b8" size={22} />
            </TouchableOpacity>
          </View>

          <View style={s.brandRow}>
            <View style={s.logoMini}>
              <Zap color="#fff" size={20} fill="#fff" />
            </View>
            <Text style={s.brandName}>SpareSaarthi</Text>
          </View>

          <Text style={s.heading}>Create Your Account</Text>
          <Text style={s.subheading}>Join thousands of mechanics & retailers ordering parts at wholesale prices</Text>

          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Benefits Strip */}
          <View style={s.benefitsStrip}>
            {['🪙 Earn coins on every order', '📦 Genuine parts only', '🚀 Quick delivery'].map((b, i) => (
              <Text key={i} style={s.benefitItem}>{b}</Text>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Personal Info</Text>

            <InputRow icon={User} label="FULL NAME">
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Ramesh Kumar"
                placeholderTextColor="#475569"
              />
            </InputRow>

            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Business Info</Text>

            <InputRow icon={Building2} label="SHOP / BUSINESS NAME">
              <TextInput
                style={s.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Ramesh Auto Works"
                placeholderTextColor="#475569"
              />
            </InputRow>

            <InputRow icon={MapPin} label="SHOP ADDRESS">
              <TextInput
                style={s.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Plot 12, Industrial Area, Delhi"
                placeholderTextColor="#475569"
              />
            </InputRow>

            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Login Credentials</Text>

            <InputRow icon={Mail} label="EMAIL ADDRESS">
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </InputRow>

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.inputWrap}>
                <Lock color="#475569" size={18} style={{ marginRight: 10 }} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#475569" size={18} /> : <Eye color="#475569" size={18} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>Create Account & Start Ordering</Text>}
          </TouchableOpacity>

          <Text style={s.terms}>
            By registering, you agree to SpareSaarthi's Terms of Service and Privacy Policy.
          </Text>

          <TouchableOpacity style={s.loginRow} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginRowText}>Already have an account? </Text>
            <Text style={s.loginRowLink}>Login →</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 50 },

  topBar: { paddingTop: 16, marginBottom: 8 },
  backBtn: { padding: 6, alignSelf: 'flex-start' },

  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  logoMini: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#ea580c',
    justifyContent: 'center', alignItems: 'center',
  },
  brandName: { fontSize: 20, fontWeight: '900', color: '#fff' },

  heading: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subheading: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 20 },

  errorBox: {
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },

  benefitsStrip: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155', gap: 6,
  },
  benefitItem: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },

  card: {
    backgroundColor: '#1e293b', borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: '#334155', marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#ea580c',
    letterSpacing: 1, marginBottom: 14,
  },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', color: '#64748b', marginBottom: 7, letterSpacing: 0.8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderWidth: 1.5, borderColor: '#334155',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14, color: '#fff' },

  submitBtn: {
    backgroundColor: '#ea580c', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginBottom: 14,
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  terms: { fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 16, marginBottom: 20 },

  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginRowText: { color: '#64748b', fontSize: 14 },
  loginRowLink: { color: '#ea580c', fontSize: 14, fontWeight: '700' },
});
