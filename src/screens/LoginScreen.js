import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>vishflow</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{isSignUp ? 'Sign up' : 'Log in'} <Text style={styles.titleItalic}>to your</Text></Text>
              <Text style={styles.titleLarge}>dashboard</Text>
            </View>
            <Text style={styles.subtitle}>CURATING YOUR DAILY LIFE, REFINED AND ORGANIZED.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.accentBar} />
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="curator@vishflow.com"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>FORGOT?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>Keep me logged in for 30 days</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, loading && { opacity: 0.7 }]} 
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'PROCESSING...' : (isSignUp ? 'SIGN UP' : 'LOG IN')}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>GOOGLE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>APPLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.footerText}>
                {isSignUp ? 'Already have an account? ' : 'New to vishflow? '}
                <Text style={styles.linkText}>{isSignUp ? 'Log in' : 'Create an account'}</Text>
              </Text>
            </TouchableOpacity>
            
            <View style={styles.legalLinks}>
              <Text style={styles.legalText}>© 2024 VISHFLOW CURATOR ECOSYSTEM. ALL RIGHTS RESERVED.</Text>
              <View style={styles.legalRow}>
                <TouchableOpacity><Text style={styles.legalLink}>PRIVACY POLICY</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.legalLink}>TERMS OF SERVICE</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7f2', // Cream background from screenshot
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 24,
    color: '#1a1a1a',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 50,
    color: '#1a1a1a',
    lineHeight: 55,
  },
  titleItalic: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
    fontSize: 45,
  },
  titleLarge: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 55,
    color: '#1a1a1a',
    lineHeight: 60,
    marginTop: -5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  accentBar: {
    height: 3,
    backgroundColor: '#444',
    width: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 8,
  },
  inputGroup: {
    marginBottom: 25,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f4ef',
    borderRadius: 6,
    padding: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1a1a1a',
  },
  forgotText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: '#888',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 2,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#444',
  },
  checkboxLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#2d2e28', // Dark charcoal from screenshot
    borderRadius: 6,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#aaa',
    paddingHorizontal: 15,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
  },
  socialButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#333',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  linkText: {
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
  legalLinks: {
    alignItems: 'center',
  },
  legalText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: '#aaa',
    letterSpacing: 1,
    marginBottom: 15,
  },
  legalRow: {
    flexDirection: 'row',
  },
  legalLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#aaa',
    marginHorizontal: 15,
    letterSpacing: 1,
  },
});
