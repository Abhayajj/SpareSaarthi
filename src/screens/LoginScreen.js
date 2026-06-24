import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
  Image, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Zap } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleUrlParams = async (url) => {
      if (!url) return;
      const emailRegex = /[?&]email=([^&]+)/;
      const passRegex = /[?&]password=([^&]+)/;
      const emailMatch = url.match(emailRegex);
      const passMatch = url.match(passRegex);

      if (emailMatch && passMatch) {
        const decodedEmail = decodeURIComponent(emailMatch[1]);
        const decodedPass = decodeURIComponent(passMatch[1]);
        
        setEmail(decodedEmail);
        setPassword(decodedPass);

        // Clear query parameters from URL bar on Web so logout / refreshes work normally
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        setLoading(true);
        setError(null);
        try {
          await login(decodedEmail.trim().toLowerCase(), decodedPass);
        } catch (e) {
          setError(e.message || 'Auto-login failed.');
        } finally {
          setLoading(false);
        }
      }
    };

    const checkDeepLink = async () => {
      try {
        let initialUrl = null;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            initialUrl = window.location.href;
          }
        } else {
          initialUrl = await Linking.getInitialURL();
        }
        if (initialUrl) {
          await handleUrlParams(initialUrl);
        }
      } catch (e) {
        console.log('Error checking deep link:', e);
      }
    };

    checkDeepLink();

    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) {
        handleUrlParams(event.url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const qrLoginUrl = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? `${window.location.origin}/?email=admin@sparesaarthi.com&password=adminpassword123` : 'http://localhost:8081/?email=admin@sparesaarthi.com&password=adminpassword123')
    : 'http://10.62.41.76:8081/?email=admin@sparesaarthi.com&password=adminpassword123';

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Brand Header */}
          <View style={s.brandSection}>
            <View style={s.logoCircle}>
              <Zap color="#fff" size={36} fill="#fff" />
            </View>
            <Text style={s.brandName}>SpareSaarthi</Text>
            <Text style={s.brandTagline}>India's B2B Auto Parts Platform</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Welcome Back 👋</Text>
            <Text style={s.cardSubtitle}>Login to your mechanic or retailer account</Text>

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  onSubmitEditing={handleLogin}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  {showPassword
                    ? <EyeOff color="#94a3b8" size={20} />
                    : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.loginBtnText}>Login to Account</Text>}
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          {/* Quick QR Login Card */}
          <View style={s.qrCard}>
            <View style={s.qrHeader}>
              <View style={s.qrBadge}>
                <Text style={s.qrBadgeText}>⚡ QUICK ACCESS</Text>
              </View>
              <Text style={s.qrTitle}>Scan to Login Instantly</Text>
              <Text style={s.qrSubtitle}>
                Scan this QR code with your mobile camera or Google Lens to log in on your phone as Demo Admin!
              </Text>
            </View>
            
            <View style={s.qrFrame}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrLoginUrl)}` }}
                style={s.qrImage}
              />
            </View>
            <Text style={s.qrTip}>Credentials auto-fill & authorize automatically</Text>
          </View>

          <Text style={s.footer}>
            SpareSaarthi © 2025 · Made for India's Mechanics
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  brandSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#ea580c',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  brandName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  brandTagline: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '500' },

  card: {
    backgroundColor: '#1e293b', borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: '#334155',
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },

  errorBox: {
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    marginBottom: 18, borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8, letterSpacing: 0.8 },
  input: {
    backgroundColor: '#0f172a', borderWidth: 1.5, borderColor: '#334155',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#fff', marginBottom: 0,
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderWidth: 1.5, borderColor: '#334155',
    borderRadius: 12, paddingRight: 14,
    overflow: 'hidden',
  },
  eyeBtn: { padding: 4 },

  loginBtn: {
    backgroundColor: '#ea580c', borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { color: '#475569', fontSize: 13, marginHorizontal: 12 },

  registerBtn: {
    borderWidth: 1.5, borderColor: '#334155', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  registerBtnText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },

  footer: { textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 24 },
  qrCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 20,
    alignItems: 'center',
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrBadge: {
    backgroundColor: '#ea580c20',
    borderColor: '#ea580c',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  qrBadgeText: {
    color: '#ea580c',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  qrSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  qrFrame: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  qrTip: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
});
