
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import AssessmentScreen from './src/screens/AssessmentScreen';

// Expo reads EXPO_PUBLIC_* values from frontend/.env at startup.
// Use the deployed API by default, including when testing locally in a browser.
const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  'https://nutrifitora-client-api.onrender.com'
).trim().replace(/\/+$/, '');

type ApiResponse = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
  user?: { fullName?: string };
  token?: string;
};
type Mode = 'login' | 'register';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Nutri Fitora';
    }
  }, []);

  const [mode, setMode] = useState<Mode>('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] =
    useState(false);

  function notify(text: string) {
    setMessage(text);

    if (Platform.OS !== 'web') {
      Alert.alert('NutriFitora', text);
    }
  }

  async function submit() {
    setMessage('');

    if (!email.trim() || !password) {
      notify('Enter your email and password.');
      return;
    }

    if (mode === 'register' && name.trim().length < 2) {
      notify('Enter your full name.');
      return;
    }

    if (mode === 'register' && password.length < 8) {
      notify('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);

    try {
      const action =
        mode === 'register' ? 'register' : 'login';

      const body =
        mode === 'register'
          ? {
              fullName: name.trim(),
              email: email.trim(),
              phoneNumber: phone.trim() || null,
              password,
            }
          : {
              email: email.trim(),
              password,
            };

      const response = await fetch(
        `${API_URL}/api/auth/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      // Some server failures return plain text or an empty response.
      const responseText = await response.text();
      let data: ApiResponse = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText) as ApiResponse;
        } catch {
          // Avoid displaying server HTML or sensitive diagnostic output.
        }
      }

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : undefined;
        const detail = validationMessage || data.message || data.title;
        throw new Error(
          detail || `Request failed (HTTP ${response.status}).`
        );
      }

      if (mode === 'register') {
        notify(
          'Account created successfully. Please follow the email verification instructions if required.'
        );
        setMode('login');
        setPassword('');
      } else {
        notify(
          `Welcome${data.user?.fullName ? ` ${data.user.fullName}` : ''}! Login successful.`
        );
        setPassword('');
        setCustomerName(data.user?.fullName || '');
        setLoggedIn(true);
      }
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error && error.message === 'Network request failed');
      notify(
        isNetworkError
          ? 'Cannot reach the API. Check the API URL, network connection, and browser CORS console.'
          : error instanceof Error
            ? error.message
            : 'Unable to connect to the server.'
      );
    } finally {
      setBusy(false);
    }
  }

  function openPrivacyPolicy() {
    console.log('Opening Privacy Policy');
    setShowPrivacyPolicy(true);
  }

  if (loggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <AssessmentScreen customerName={customerName} onLogout={() => {
          setLoggedIn(false);
          setCustomerName('');
          setPassword('');
          setMessage('');
          setMode('login');
        }} />
      </SafeAreaView>
    );
  }

  // Privacy Policy screen
  if (showPrivacyPolicy) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <PrivacyPolicyScreen
          onBack={() => setShowPrivacyPolicy(false)}
        />
      </SafeAreaView>
    );
  }

  // Login and registration screen
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.shell}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/NutriFitora_logo.png')}
              style={styles.brandLogo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.tagline}>
            Small steps. Healthier you.
          </Text>

          <View style={styles.card}>

            {/* Login / Register tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  mode === 'login' && styles.selected,
                ]}
                onPress={() => {
                  setMode('login');
                  setMessage('');
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'login' && styles.selectedText,
                  ]}
                >
                  Sign in
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  mode === 'register' && styles.selected,
                ]}
                onPress={() => {
                  setMode('register');
                  setMessage('');
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'register' && styles.selectedText,
                  ]}
                >
                  Create account
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heading}>
              {mode === 'login'
                ? 'Welcome back'
                : 'Start your wellness journey'}
            </Text>

            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to continue to your nutrition plan.'
                : 'Create your customer account.'}
            </Text>

            {/* Registration-only fields */}
            {mode === 'register' && (
              <>
                <Text style={styles.label}>
                  Full name
                </Text>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />

                <Text style={styles.label}>
                  Mobile number (optional)
                </Text>

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                />
              </>
            )}

            {/* Email */}
            <Text style={styles.label}>
              Email address
            </Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Forgot Password */}
            {mode === 'login' && (
              <TouchableOpacity
                style={styles.forgot}
                onPress={() =>
                  notify(
                    'Password reset will be added in the next step.'
                  )
                }
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}

            {/* API response messages */}
            {!!message && (
              <Text
                accessibilityRole="alert"
                style={styles.message}
              >
                {message}
              </Text>
            )}

            {/* Sign in / Create account button */}
            <TouchableOpacity
              disabled={busy}
              onPress={submit}
              style={[
                styles.button,
                busy && styles.buttonDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Privacy Policy */}
            <View style={styles.termsContainer}>
              <Text style={styles.terms}>
                By continuing, you agree to our Terms of
                Service and
              </Text>

              <TouchableOpacity
                onPress={openPrivacyPolicy}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="Open Privacy Policy"
                style={styles.privacyButton}
              >
                <Text style={styles.privacyLink}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>

          </View>

          <Text style={styles.footer}>
            Your wellness, one choice at a time.
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },

  scroll: {
    flex: 1,
  },

  page: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  shell: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },

  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  brandLogo: {
    width: 180,
    height: 80,
    borderRadius: 15,
  },

  tagline: {
    color: '#738078',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E6EDE7',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F1',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 9,
  },

  selected: {
    backgroundColor: '#FFFFFF',
  },

  tabText: {
    color: '#758078',
    fontWeight: '600',
  },

  selectedText: {
    color: '#246B4A',
  },

  heading: {
    color: '#1C3327',
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: '#78837B',
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 18,
  },

  label: {
    color: '#304438',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 13,
    fontSize: 13,
  },

  input: {
    height: 49,
    borderWidth: 1,
    borderColor: '#DCE5DE',
    borderRadius: 11,
    paddingHorizontal: 14,
    color: '#20382A',
    backgroundColor: '#FCFDFC',
  },

  forgot: {
    alignSelf: 'flex-end',
    marginTop: 13,
  },

  forgotText: {
    color: '#246B4A',
    fontWeight: '700',
    fontSize: 13,
  },

  message: {
    color: '#246B4A',
    backgroundColor: '#EDF7F0',
    padding: 11,
    borderRadius: 9,
    marginTop: 16,
    lineHeight: 20,
  },

  button: {
    height: 51,
    backgroundColor: '#246B4A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  termsContainer: {
    alignItems: 'center',
    marginTop: 18,
  },

  terms: {
    color: '#98A29B',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },

  privacyButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  privacyLink: {
    color: '#246B4A',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  footer: {
    color: '#9AA69D',
    fontSize: 12,
    marginTop: 22,
    textAlign: 'center',
  },
});
