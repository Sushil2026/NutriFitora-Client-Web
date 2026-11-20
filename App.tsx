
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

  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(current => !current);
  const themed = (key: string, style: any) => darkMode ? [style, appDarkOverrides[key]] : style;
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
      <SafeAreaView style={themed('safe', styles.safe)}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <AssessmentScreen customerName={customerName} darkMode={darkMode} onToggleTheme={toggleTheme} onLogout={() => {
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
      <SafeAreaView style={themed('safe', styles.safe)}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <TouchableOpacity onPress={toggleTheme} accessibilityLabel="Toggle light and dark mode" style={{ alignSelf: 'flex-end', padding: 12 }}><Text style={{ color: darkMode ? '#FFFFFF' : '#246B4A' }}>{darkMode ? '☀ Light' : '☾ Dark'}</Text></TouchableOpacity>
        <View style={themed('secondaryPageLogo', styles.secondaryPageLogo)}>
          <Image
            source={require('./assets/NutriFitora_logo.png')}
            style={themed('secondaryBrandLogo', styles.secondaryBrandLogo)}
            resizeMode="contain"
            accessibilityLabel="Nutri Fitora logo"
          />
        </View>
        <View style={themed('privacyContent', styles.privacyContent)}>
          <PrivacyPolicyScreen
            onBack={() => setShowPrivacyPolicy(false)}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Login and registration screen
  return (
    <SafeAreaView style={themed('safe', styles.safe)}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <ScrollView
        style={themed('scroll', styles.scroll)}
        contentContainerStyle={themed('page', styles.page)}
        keyboardShouldPersistTaps="always"
      >
        <View style={themed('shell', styles.shell)}>

          <TouchableOpacity onPress={toggleTheme} accessibilityRole="button" accessibilityLabel={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} style={{ alignSelf: 'flex-end', backgroundColor: darkMode ? '#2B4535' : '#E5F1E8', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 12 }}>
            <Text style={{ color: darkMode ? '#FFE7A1' : '#246B4A', fontWeight: '700' }}>{darkMode ? '☀  Light mode' : '☾  Dark mode'}</Text>
          </TouchableOpacity>
          {/* Logo */}
          <View style={themed('logoContainer', styles.logoContainer)}>
            <Image
              source={require('./assets/NutriFitora_logo.png')}
              style={themed('brandLogo', styles.brandLogo)}
              resizeMode="contain"
            />
          </View>

          <Text style={themed('tagline', styles.tagline)}>
            Small steps. Healthier you.
          </Text>

          <View style={themed('card', styles.card)}>

            {/* Login / Register tabs */}
            <View style={themed('tabs', styles.tabs)}>
              <TouchableOpacity
                style={[
                  themed('tab', styles.tab),
                  mode === 'login' && themed('selected', styles.selected),
                ]}
                onPress={() => {
                  setMode('login');
                  setMessage('');
                }}
              >
                <Text
                  style={[
                    themed('tabText', styles.tabText),
                    mode === 'login' && themed('selectedText', styles.selectedText),
                  ]}
                >
                  Sign in
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  themed('tab', styles.tab),
                  mode === 'register' && themed('selected', styles.selected),
                ]}
                onPress={() => {
                  setMode('register');
                  setMessage('');
                }}
              >
                <Text
                  style={[
                    themed('tabText', styles.tabText),
                    mode === 'register' && themed('selectedText', styles.selectedText),
                  ]}
                >
                  Create account
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={themed('heading', styles.heading)}>
              {mode === 'login'
                ? 'Welcome back'
                : 'Start your wellness journey'}
            </Text>

            <Text style={themed('subtitle', styles.subtitle)}>
              {mode === 'login'
                ? 'Sign in to continue to your nutrition plan.'
                : 'Create your customer account.'}
            </Text>

            {/* Registration-only fields */}
            {mode === 'register' && (
              <>
                <Text style={themed('label', styles.label)}>
                  Full name
                </Text>

                <TextInput
                  style={themed('input', styles.input)}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name" placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
                  autoCapitalize="words"
                />

                <Text style={themed('label', styles.label)}>
                  Mobile number (optional)
                </Text>

                <TextInput
                  style={themed('input', styles.input)}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter mobile number" placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
                  keyboardType="phone-pad"
                />
              </>
            )}

            {/* Email */}
            <Text style={themed('label', styles.label)}>
              Email address
            </Text>

            <TextInput
              style={themed('input', styles.input)}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com" placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={themed('label', styles.label)}>
              Password
            </Text>

            <TextInput
              style={themed('input', styles.input)}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters" placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Forgot Password */}
            {mode === 'login' && (
              <TouchableOpacity
                style={themed('forgot', styles.forgot)}
                onPress={() =>
                  notify(
                    'Password reset will be added in the next step.'
                  )
                }
              >
                <Text style={themed('forgotText', styles.forgotText)}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}

            {/* API response messages */}
            {!!message && (
              <Text
                accessibilityRole="alert"
                style={themed('message', styles.message)}
              >
                {message}
              </Text>
            )}

            {/* Sign in / Create account button */}
            <TouchableOpacity
              disabled={busy}
              onPress={submit}
              style={[
                themed('button', styles.button),
                busy && themed('buttonDisabled', styles.buttonDisabled),
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={themed('buttonText', styles.buttonText)}>
                  {mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Privacy Policy */}
            <View style={themed('termsContainer', styles.termsContainer)}>
              <Text style={themed('terms', styles.terms)}>
                By continuing, you agree to our Terms of
                Service and
              </Text>

              <TouchableOpacity
                onPress={openPrivacyPolicy}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="Open Privacy Policy"
                style={themed('privacyButton', styles.privacyButton)}
              >
                <Text style={themed('privacyLink', styles.privacyLink)}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>

          </View>

          <Text style={themed('footer', styles.footer)}>
            Your wellness, one choice at a time.
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  secondaryPageLogo: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F3F7F3',
  },
  secondaryBrandLogo: { width: 170, height: 72, borderRadius: 15, backgroundColor: "#FFFFFF" },
  privacyContent: { flex: 1 },
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
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
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

const appDarkOverrides: Record<string, object> = {
  safe: { backgroundColor: '#101A16' }, page: { backgroundColor: '#101A16' }, scroll: { backgroundColor: '#101A16' },
  secondaryPageLogo: { backgroundColor: '#101A16' },
  card: { backgroundColor: '#1B2A23', borderColor: '#34483B' },
  tagline: { color: '#B7C9BC' }, tabs: { backgroundColor: '#2A3A30' },
  selected: { backgroundColor: '#365640' }, tabText: { color: '#C0D2C4' },
  selectedText: { color: '#B9F2CB' }, heading: { color: '#F1F7F2' },
  subtitle: { color: '#B5C9BA' }, label: { color: '#DDECE0' },
  input: { backgroundColor: '#22352A', borderColor: '#45604B', color: '#FFFFFF' },
  forgotText: { color: '#A6E4BC' }, message: { color: '#F4C2A7' },
  terms: { color: '#B5C9BA' }, privacyLink: { color: '#A6E4BC' },
  footer: { color: '#A0B7A6' },
};
