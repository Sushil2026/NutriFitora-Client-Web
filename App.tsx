
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
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import AssessmentScreen from './src/screens/AssessmentScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import HomeScreen from './src/screens/HomeScreen';
import DemoWellnessScreen from './src/screens/DemoWellnessScreen';
import NutriBottomNav, { NutriTab } from './src/screens/NutriBottomNav';


// Decorative shapes use native Views; no external image or animation package.
function BotanicalAccent({ dark = false, bottom = false }: { dark?: boolean; bottom?: boolean }) {
  const leafColor = dark ? '#235F50' : '#A9D98A';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', ...(bottom ? { bottom: -18, right: -22 } : { top: -20, left: -22 }), width: 145, height: 150, opacity: dark ? 0.5 : 0.72 }}>
      <View style={{ position: 'absolute', left: 70, top: 20, width: 3, height: 124, backgroundColor: dark ? '#3E9377' : '#85BD6D', transform: [{ rotate: '35deg' }] }} />
      {[[25,28,-32],[65,20,35],[24,76,-40],[75,70,40],[58,108,25]].map(([x,y,r], i) => (
        <View key={i} style={{ position: 'absolute', left: x, top: y, width: 51, height: 24, borderTopLeftRadius: 48, borderBottomRightRadius: 48, backgroundColor: leafColor, transform: [{ rotate: `${r}deg` }] }} />
      ))}
    </View>
  );
}
function BotanicalWaves({ dark = false }: { dark?: boolean }) {
  return (
    <View pointerEvents="none" style={{ height: 98, overflow: 'hidden', width: '100%', position: 'relative', marginTop: 18 }}>
      <View style={{ position: 'absolute', left: -45, right: -45, top: 26, height: 170, borderTopLeftRadius: 170, borderTopRightRadius: 220, backgroundColor: dark ? '#174F47' : '#D9F2D1', transform: [{ rotate: '-6deg' }] }} />
      <View style={{ position: 'absolute', left: -40, right: -45, top: 56, height: 150, borderTopLeftRadius: 190, borderTopRightRadius: 170, backgroundColor: dark ? '#227568' : '#AFE4A0', transform: [{ rotate: '5deg' }] }} />
      <BotanicalAccent dark={dark} bottom />
    </View>
  );
}

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
  const { width: viewportWidth } = useWindowDimensions();
  const compactToggle = viewportWidth < 600;
  const isMobile = viewportWidth < 600;
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
  const [showPrograms, setShowPrograms] = useState(false);
  const [activeTab, setActiveTab] = useState<NutriTab>('home');
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
    const logout = () => { setLoggedIn(false); setShowPrograms(false); setActiveTab('home'); setCustomerName(''); setPassword(''); setMessage(''); setMode('login'); };
    const navigate = (tab: NutriTab) => { setActiveTab(tab); setShowPrograms(tab === 'programs'); };
    return <SafeAreaView style={themed('safe', styles.safe)}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={{flex:1}}>
        {(['plan','log','charts','track','team','events'] as NutriTab[]).includes(activeTab) && <DemoWellnessScreen key={activeTab} tab={activeTab as 'plan'|'log'|'charts'|'track'|'team'|'events'} darkMode={darkMode} customerName={customerName} onToggleTheme={toggleTheme} onLogout={logout} />}
        {activeTab === 'home' && <HomeScreen darkMode={darkMode} customerName={customerName} onToggleTheme={toggleTheme} onLogout={logout} onAssessment={()=>navigate('assessment')} onPrograms={()=>navigate('programs')} />}
        {activeTab === 'assessment' && <AssessmentScreen customerName={customerName} darkMode={darkMode} onToggleTheme={toggleTheme} onViewPrograms={()=>navigate('programs')} onLogout={logout} />}
        {activeTab === 'programs' && <ProgramsScreen darkMode={darkMode} onToggleTheme={toggleTheme} onBack={()=>navigate('assessment')} onLogout={logout} customerName={customerName} />}
        {activeTab === 'privacy' && <PrivacyPolicyScreen darkMode={darkMode} onToggleTheme={toggleTheme} onLogout={logout} customerName={customerName} onBack={()=>navigate('home')} />}
      </View>
      <NutriBottomNav active={activeTab} onChange={navigate} darkMode={darkMode} />
    </SafeAreaView>;
  }

  // Privacy Policy: the screen owns the same full-width branded header as the other pages.
  if (showPrivacyPolicy) {
    return (
      <SafeAreaView style={themed('safe', styles.safe)}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <PrivacyPolicyScreen darkMode={darkMode} onToggleTheme={toggleTheme} onBack={() => setShowPrivacyPolicy(false)} />
      </SafeAreaView>
    );
  }

  // Login and registration screen
  return (
    <SafeAreaView style={themed('safe', styles.safe)}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <ScrollView
        style={themed('scroll', styles.scroll)}
        contentContainerStyle={[themed('page', styles.page), isMobile && styles.pageMobile]}
        keyboardShouldPersistTaps="always"
      >
        <View style={themed('shell', styles.shell)}>
          <BotanicalAccent dark={darkMode} />

          {/* Matching assessment header: logo left, theme toggle right */}
          <View style={[styles.authHeaderPanel, isMobile && styles.authHeaderPanelMobile, darkMode && styles.authHeaderPanelDark]}>
          <View style={themed('loginHeader', styles.loginHeader)}>
            <View>
              <Image
                source={darkMode ? require('./assets/NutriFitora_logo_white.png') : require('./assets/NutriFitora_logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
                accessibilityLabel="Nutri Fitora logo"
              />
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              accessibilityRole="switch"
              accessibilityState={{ checked: darkMode }}
              accessibilityLabel={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={[styles.loginThemeButton, compactToggle && styles.loginThemeButtonCompact, darkMode ? styles.loginThemeButtonDark : styles.loginThemeButtonLight]}
            >
              <View style={[styles.loginThemeThumb, compactToggle && styles.loginThemeThumbCompact, darkMode ? styles.loginThemeThumbDark : styles.loginThemeThumbLight]}>
                <Text style={[styles.loginThemeIcon, compactToggle && styles.loginThemeIconCompact, darkMode && styles.loginThemeIconDark]}>{darkMode ? '☾' : '☀'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.taglineRow}>
            <Text style={themed('tagline', styles.tagline)}>
              <Text style={themed('taglineAccent', styles.taglineAccent)}>Small steps.</Text>
              {'\n'}Healthier you.
            </Text>
          </View>
          </View>

          <View style={[themed('card', styles.card), isMobile && styles.cardMobile]}>
            <View style={styles.formContent}>

            {/* Login / Register tabs */}
            <View style={themed('tabs', styles.tabs)}>
              <TouchableOpacity
                style={[
                  themed('tab', styles.tab),
                  mode === 'login' && themed('selected', styles.selected),
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'login' }}
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
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'register' }}
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

            <Text style={themed('eyebrow', styles.eyebrow)}>NUTRIFITORA CUSTOMER PORTAL</Text>
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
          </View>

          <BotanicalWaves dark={darkMode} />
          <Text style={themed('footer', styles.footer)}>
            Your wellness, one choice at a time.
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  privacyTopPanel: { width: '94%', maxWidth: 780, alignSelf: 'center', marginTop: 16, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#C8DED0', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  privacyTopPanelDark: { borderColor: '#45604B' },
  authHeaderPanel: { width: '100%', borderWidth: 1, borderColor: '#C8DED0', borderRadius: 20, backgroundColor: 'transparent', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, marginBottom: 18 },
  authHeaderPanelMobile: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, borderRadius: 19, marginBottom: 14 },
  pageMobile: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 32 },
  cardMobile: { padding: 20, borderRadius: 19 },
  formContent: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  eyebrow: { color: '#246B4A', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  authHeaderPanelDark: { borderColor: '#45604B' },
  secondaryPageLogo: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F3FBF5',
  },
  secondaryBrandLogo: { width: 170, height: 72 },
  privacyContent: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: '#F3FBF5',
  },

  scroll: {
    flex: 1,
  },

  page: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 56,
  },

  shell: {
    width: '100%',
    maxWidth: 780,
    position: 'relative',
    alignItems: 'center',
  },

  loginHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  // Image-inspired compact sliding sun/moon switch
  loginThemeButton: {
    width: 72, height: 38, borderRadius: 22, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 3,
  },
  loginThemeButtonCompact: { width: 52, height: 28, borderRadius: 16, borderWidth: 1, paddingHorizontal: 2 },
  loginThemeButtonLight: { backgroundColor: '#F9FFF8', borderColor: '#79C96E', justifyContent: 'flex-end' },
  loginThemeButtonDark: { backgroundColor: '#123D35', borderColor: '#4BAA95', justifyContent: 'flex-start' },
  loginThemeThumb: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  loginThemeThumbCompact: { width: 22, height: 22, borderRadius: 11 },
  loginThemeThumbLight: { backgroundColor: '#A8EA8D' },
  loginThemeThumbDark: { backgroundColor: '#2C7667' },
  loginThemeIcon: { fontSize: 21, lineHeight: 26, color: '#174A30', textAlign: 'center' },
  loginThemeIconCompact: { fontSize: 15, lineHeight: 19 },
  loginThemeIconDark: { color: '#FFFFFF' },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logoBorderBox: {
    borderWidth: 1,
    borderColor: '#C8DED0',
    borderRadius: 16,
    backgroundColor: 'transparent',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  brandLogo: {
    width: 180,
    height: 80,
    // The original PNG already has a dark background.
    // Avoid a white backing that shows as an unwanted rectangle in dark mode.
    borderRadius: 0,
  },

  taglineRow: { width: '100%', alignItems: 'flex-start', marginBottom: 0, paddingLeft: 2 },
  tagline: {
    color: '#1C4933',
    textAlign: 'left',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  taglineAccent: {
    color: '#399466',
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: -0.35,
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 34,
    borderWidth: 1,
    borderColor: '#E0EFE4',
    shadowColor: '#1A4530',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 9 },
    elevation: 4,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EAF5EB',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#006746',
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
  card: { backgroundColor: '#1B2A23', borderColor: '#34483B', shadowColor: '#000000' },
  eyebrow: { color: '#8DD5A9' },
  tagline: { color: '#F0F7F1' }, taglineAccent: { color: '#91D9AA' }, tabs: { backgroundColor: '#2A3A30' },
  selected: { backgroundColor: '#365640' }, tabText: { color: '#C0D2C4' },
  selectedText: { color: '#B9F2CB' }, heading: { color: '#F1F7F2' },
  subtitle: { color: '#B5C9BA' }, label: { color: '#DDECE0' },
  input: { backgroundColor: '#22352A', borderColor: '#45604B', color: '#FFFFFF' },
  forgotText: { color: '#A6E4BC' }, message: { color: '#F4C2A7', backgroundColor: '#283F32' },
  terms: { color: '#B5C9BA' }, privacyLink: { color: '#A6E4BC' },
  footer: { color: '#A0B7A6' },
};
