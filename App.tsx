import {AuthHeader, AuthFooter} from './src/screens/AuthChrome';

import React, { useEffect, useState } from 'react';
import StaffPortal from './src/portals/StaffPortal';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
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
function BotanicalWaves({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <View pointerEvents="none" style={{ height: compact ? 28 : 98, overflow: 'hidden', width: '100%', position: 'relative', marginTop: compact ? 0 : 18 }}>
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
  user?: { fullName?: string; roles?: string[] };
  token?: string;
  accessToken?: string;
  otpRequired?: boolean;
  challengeId?: string;
};
type Mode = 'login' | 'register';

type PortalRoute = 'home' | 'customer' | 'register' | 'admin' | 'nutritionist' | 'privacy';
const paths: Record<PortalRoute, string> = { home: '/', customer: '/customer/login', register: '/customer/register', admin: '/admin/login', nutritionist: '/nutritionist/login', privacy: '/privacy-policy' };
function readRoute(): PortalRoute {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (path.startsWith('/admin/')) return 'admin';
  if (path.startsWith('/nutritionist/')) return 'nutritionist';
  if (path === '/customer/register') return 'register';
  if (path === '/privacy-policy') return 'privacy';
  if (path === '/login' || path.startsWith('/customer/')) return 'customer';
  return 'home';
}
export default function App() {
  const [route, setRoute] = useState<PortalRoute>(readRoute);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const sync = () => setRoute(readRoute());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const navigate = (next: PortalRoute) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.history.pushState({}, '', paths[next]);
    setRoute(next);
  };
  const home = () => navigate('home');
  if (route === 'admin' || route === 'nutritionist') return <StaffPortal key={route} role={route} onHome={home} />;
  if (route === 'home') return <WelcomeScreen onNavigate={navigate} />;
  return <CustomerApp key={route} initialMode={route === 'register' ? 'register' : 'login'} initialPrivacy={route === 'privacy'} onHome={home} />;
}

function WelcomeScreen({onNavigate}: {onNavigate: (route: PortalRoute) => void}) {
  const {width, height} = useWindowDimensions();
  const [dark, setDark] = useState(false);
  const fg = dark ? '#E4F5E9' : '#153F34';
  const muted = dark ? '#B2D0C1' : '#526F62';
  const surface = dark ? '#203C32' : '#FFFFFF';
  const wide = width >= 760;
  const compact = height < 780 || !wide;
  const pad = compact ? 12 : 24;
  const gap = compact ? 8 : 16;
  const portals = [
    {route:'customer' as const, title:'Customer', image:require('./assets/portal-customer-icon.png'), color:'#087F72', desc:'Your personalised nutrition and wellness journey.', button:'Customer Login'},
    {route:'nutritionist' as const, title:'Nutritionist', image:require('./assets/portal-nutritionist-icon.png'), color:'#286AA5', desc:'Manage clients, diet plans and consultations.', button:'Nutritionist Login'},
    {route:'admin' as const, title:'Administrator', image:require('./assets/portal-admin-icon.png'), color:'#7652A0', desc:'Manage customers, teams and wellness programs.', button:'Admin Login'},
  ];
  return <SafeAreaView style={{flex:1,backgroundColor:dark?'#102820':'#EAF5EF'}}>
    <StatusBar style={dark?'light':'dark'} />
    <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow:1,padding:pad}}>
      <View style={{width:'100%',alignSelf:'center',flex:1,gap}}>
        <AuthHeader dark={dark} onToggle={()=>setDark(v=>!v)} />
        <View style={{flex:1,justifyContent:'center',gap}}>
          <View style={{backgroundColor:'#145C46',borderRadius:18,paddingHorizontal:wide?28:16,paddingVertical:compact?12:24,overflow:'hidden',gap:4}}>
            <BotanicalAccent dark bottom/>
            <Text style={{color:'#C2E6D3',fontSize:11,fontWeight:'700',letterSpacing:1}}>NOURISH • TRANSFORM • THRIVE</Text>
            <Text accessibilityRole="header" style={{color:'#FFFFFF',fontSize:wide?(compact?30:40):24,fontWeight:'800'}}>Welcome to NutriFitora</Text>
            <Text style={{color:'#E0F5ED',fontSize:compact?13:16}}>Your journey towards a healthier, happier life begins here.</Text>
          </View>
          <Text accessibilityRole="header" style={{color:fg,fontSize:compact?19:24,fontWeight:'800',textAlign:'center'}}>Choose your portal</Text>
          <View style={{flexDirection:wide?'row':'column',gap}}>
            {portals.map(p=><View key={p.route} style={{flex:wide?1:undefined,minWidth:0,backgroundColor:surface,borderRadius:16,padding:compact?10:20,gap:compact?8:12,borderWidth:1,borderColor:dark?'#456657':'#C8DED0',flexDirection:wide?'column':'row',alignItems:wide?'stretch':'center'}}>
              <Image source={p.image} accessible={false} resizeMode="contain" style={{width:compact?40:56,height:compact?40:56,alignSelf:'center'}} />
              <View style={{flex:wide?undefined:1,flexGrow:1,gap:4,minWidth:0}}>
                <Text style={{color:fg,fontSize:compact?16:21,fontWeight:'800',textAlign:wide?'center':'left'}}>{p.title}</Text>
                {(wide || height>=740) && <Text style={{color:muted,fontSize:compact?12:14,lineHeight:compact?17:21,textAlign:wide?'center':'left'}}>{p.desc}</Text>}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={p.button} onPress={()=>onNavigate(p.route)} style={{backgroundColor:p.color,borderRadius:10,minHeight:44,paddingHorizontal:12,paddingVertical:8,justifyContent:'center'}}><Text style={{color:'#FFFFFF',fontWeight:'700',fontSize:compact?13:15,textAlign:'center'}}>{wide?p.button:'Login'} →</Text></TouchableOpacity>
            </View>)}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={()=>onNavigate('register')} style={{alignSelf:'center',minHeight:44,justifyContent:'center',paddingHorizontal:12,borderWidth:1,borderColor:'#16866B',borderRadius:10}}><Text style={{color:fg,fontSize:13,fontWeight:'700',textAlign:'center'}}>New here? Create your free customer account</Text></TouchableOpacity>
        </View>
        <AuthFooter dark={dark} onPrivacy={()=>onNavigate('privacy')} />
      </View>
    </ScrollView>
  </SafeAreaView>;
}

function CustomerApp({initialMode='login',initialPrivacy=false,onHome}: {initialMode?: Mode; initialPrivacy?: boolean; onHome:()=>void}) {
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const compactToggle = viewportWidth < 600;
  const isMobile = viewportWidth < 600;
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Nutri Fitora';
    }
  }, []);

  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(current => !current);
  const themed = (key: string, style: any) => [style, darkMode && appDarkOverrides[key], mode === 'login' && !loggedIn && loginFit[key]];
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);
  const [activeTab, setActiveTab] = useState<NutriTab>('home');
  const [customerName, setCustomerName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRules = [
    { label: '12–128 characters', ok: password.length >= 12 && password.length <= 128 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[^\p{L}\p{N}\s]/u.test(password) },
  ];
  const mobileValid = /^[6-9][0-9]{9}$/.test(phone);
  const [challenge, setChallenge] = useState('');
  const [otp, setOtp] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { if (!challenge) return; const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, [challenge]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] =
    useState(initialPrivacy);

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

    if (mode === 'register') {
      if (name.trim().length < 2 || name.trim().length > 100) { notify('Enter a full name of 2–100 characters.'); return; }
      if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { notify('Enter a valid email address.'); return; }
      if (!mobileValid) { notify('Enter a valid 10-digit Indian mobile number.'); return; }
      if (!passwordRules.every(rule => rule.ok)) { notify('Please meet all password requirements.'); return; }
      if (password !== confirmPassword) { notify('Passwords do not match.'); return; }
      if (!acceptedPrivacy) { notify('Please accept the Privacy Policy.'); return; }
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
              phoneNumber: `+91${phone}`,
              acceptedPrivacy,
              password,
            }
          : {
              email: email.trim(),
              password,
              portal: "customer",
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
        setConfirmPassword('');
        setAcceptedPrivacy(false);
        setShowPassword(false);
      } else {
        if (!data.otpRequired || !data.challengeId) throw new Error('Email verification is unavailable. Please contact support.');
        setChallenge(data.challengeId); setOtp(''); setPassword(''); setClock(Date.now()); setResendAt(Date.now()+60000);
        setMessage('Verification code sent to your email.');
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

  async function submitOtp(resend: boolean) {
    if (busy || !challenge || (resend && Date.now()<resendAt)) return;
    if (!resend && !/^[0-9]{6}$/.test(otp)) { setMessage('Enter all six digits.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/otp/${resend ? 'resend' : 'verify'}`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({challengeId:challenge, ...(resend ? {} : {code:otp})})
      });
      const data: ApiResponse = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');
      if (resend) {
        if (!data.challengeId) throw new Error('Unable to resend code.');
        setChallenge(data.challengeId); setOtp(''); setClock(Date.now()); setResendAt(Date.now()+60000); setMessage('New code sent.');
      } else {
        if (!data.accessToken || !data.user?.roles?.includes('Customer')) throw new Error('Invalid login response.');
        setChallenge(''); setOtp(''); setCustomerName(data.user.fullName || ''); setLoggedIn(true);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Verification failed.'); }
    finally { setBusy(false); }
  }

  function closeOtp() {
    if (busy) return;
    setChallenge(''); setOtp(''); setMessage('');
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
        <PrivacyPolicyScreen darkMode={darkMode} onToggleTheme={toggleTheme} onBack={() => initialPrivacy ? onHome() : setShowPrivacyPolicy(false)} />
      </SafeAreaView>
    );
  }

  // Login and registration screen
  return (
    <SafeAreaView style={themed('safe', styles.safe)}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <ScrollView
        style={themed('scroll', styles.scroll)}
        contentContainerStyle={[themed('page', styles.page), isMobile && styles.pageMobile, mode === 'login' && {padding: viewportWidth < 600 ? 10 : 20, paddingTop: 10, paddingBottom: 10}]}
        keyboardShouldPersistTaps="always"
      >
        <View style={[themed('shell', styles.shell), {maxWidth:mode==='login'?'100%':780, flexGrow:1, justifyContent:'space-between',gap:10}]}>
          <AuthHeader dark={darkMode} onToggle={toggleTheme} onHome={onHome} />

          <View style={{width:'100%', flexDirection:mode === 'login' && viewportWidth >= 850 ? 'row' : 'column', alignItems:(mode === 'login' && viewportWidth >= 850)?'stretch':'center', flexGrow:mode === 'login'?1:0, gap:12}}>
          {mode === 'login' && viewportWidth >= 850 && <View style={{flex:1,width:0,backgroundColor:darkMode?'#153E32':'#155D49',borderRadius:16,padding:viewportHeight<760?18:28,justifyContent:'center'}}>{(mode === 'login' && viewportWidth >= 850) && <View style={{gap:12,paddingVertical:10}}><Text style={{fontSize:Math.min(42,viewportWidth*0.032),fontWeight:'800',color:'#FFFFFF',lineHeight:42}}>A healthier you starts here.</Text><Text style={{fontSize:17,lineHeight:25,color:'#D2EBDD'}}>Build sustainable habits with personalised nutrition and expert support.</Text><Image source={require('./assets/login-customer-art.jpg')} resizeMode="contain" style={{width:"100%",height:Math.max(80,Math.min(180,viewportHeight*0.20)),borderRadius:14,backgroundColor:"#FFFFFF"}} />{['Personalised nutrition plans','Expert wellness guidance','Track your health journey'].map(item=><Text key={item} style={{fontSize:15,color:'#D8F2DF',lineHeight:24}}>✓  {item}</Text>)}</View>}</View>}
          <View style={[themed('card', styles.card), isMobile && styles.cardMobile, mode === 'login' && {flex:viewportWidth >= 850 ? 1 : undefined,padding:viewportHeight < 760 ? 20 : 32,justifyContent:'center',borderRadius:0,borderWidth:0,shadowOpacity:0,elevation:0,width:viewportWidth>=850?0:'100%'}]}>
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

            {mode === "login" && <Image source={require("./assets/portal-customer-icon.png")} style={{width:52,height:52,marginVertical:8}} resizeMode="contain" />}
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
                  Mobile number (+91)
                </Text>

                <TextInput
                  style={themed('input', styles.input)}
                  value={phone}
                  onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                  maxLength={10}
                  inputMode="numeric"
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder="10-digit mobile number" placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
                  keyboardType="number-pad"
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
              placeholder={mode === 'register' ? "At least 12 characters" : "Enter password"} placeholderTextColor={darkMode ? "#A5BBAA" : "#88998D"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            {mode === 'login' && <TouchableOpacity onPress={()=>setShowPassword(v=>!v)} accessibilityRole="button"><Text style={{color:darkMode?'#A8EA8D':'#087F72',textAlign:'right',paddingVertical:5}}>{showPassword?'Hide password':'Show password'}</Text></TouchableOpacity>}
            {mode === 'register' && (
              <View style={{ gap: 6, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} accessibilityRole="button">
                  <Text style={themed('privacyLink', styles.privacyLink)}>{showPassword ? 'Hide password' : 'Show password'}</Text>
                </TouchableOpacity>
                {passwordRules.map(rule => <Text key={rule.label} style={{ color: rule.ok ? (darkMode ? '#A6E4BC' : '#087F72') : (darkMode ? '#FCA5A5' : '#B91C1C'), fontSize: 13 }}>{rule.ok ? '✓' : '○'} {rule.label}</Text>)}
                <Text style={themed('label', styles.label)}>Confirm password</Text>
                <TextInput style={themed('input', styles.input)} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} placeholder="Re-enter password" placeholderTextColor={darkMode ? '#A5BBAA' : '#88998D'} />
                {!!confirmPassword && password !== confirmPassword && <Text style={{ color: darkMode ? '#FCA5A5' : '#B91C1C' }}>Passwords do not match.</Text>}
                <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: acceptedPrivacy }} onPress={() => setAcceptedPrivacy(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
                  <Text style={themed('label', styles.label)}>{acceptedPrivacy ? '☑' : '☐'} I accept the Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            )}
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
            {!challenge && !!message && (
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

          </View>
          <AuthFooter dark={darkMode} onPrivacy={openPrivacyPolicy} />

        </View>
      </ScrollView>
      <Modal visible={!!challenge} transparent animationType="fade" onRequestClose={closeOtp}>
        <KeyboardAvoidingView style={styles.otpOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.otpCenter}>
            <View accessibilityViewIsModal style={[styles.otpCard, darkMode && styles.otpCardDark]}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close verification" disabled={busy} onPress={closeOtp} style={[styles.otpClose, {backgroundColor: darkMode ? '#30483D' : '#EDF4EF'}]}><Text style={{fontSize:24,color:darkMode?'#E3F4E9':'#24543D'}}>×</Text></TouchableOpacity>
              <View style={[styles.otpIcon,{backgroundColor:darkMode?'#315944':'#E0F3E6'}]}><Text style={{fontSize:32,color:darkMode?'#A6E4BC':'#087F72'}}>✉</Text></View>
              <Text style={[styles.otpEyebrow,{color:darkMode?'#A6E4BC':'#087F72'}]}>SECURE CUSTOMER LOGIN</Text>
              <Text style={[styles.otpTitle,{color:darkMode?'#F0FAF3':'#173D2D'}]}>Verify your email</Text>
              <Text style={[styles.otpDescription,{color:darkMode?'#B9D0C2':'#52695B'}]}>Enter the 6-digit verification code sent to</Text>
              <Text style={[styles.otpEmail,{color:darkMode?'#E0F3E6':'#173D2D'}]}>{email.trim().replace(/^(.{1,2})[^@]*(@.*)$/, '$1••••$2')}</Text>
              <View style={styles.otpDigits}>
                {Array.from({length:6},(_,i)=><View key={i} style={[styles.otpDigit,{backgroundColor:darkMode?'#182C24':'#F6FAF7',borderColor:i===otp.length?'#16866B':darkMode?'#496458':'#D3E3D9'}]}><Text style={{fontSize:24,fontWeight:'700',color:darkMode?'#F0FAF3':'#173D2D'}}>{otp[i] || '·'}</Text></View>)}
                <TextInput style={styles.otpCapture} value={otp} onChangeText={v=>setOtp(v.replace(/[^0-9]/g,'').slice(0,6))} maxLength={6} keyboardType="number-pad" inputMode="numeric" autoComplete="one-time-code" accessibilityLabel="Six digit verification code" editable={!busy} caretHidden autoFocus onSubmitEditing={()=>submitOtp(false)} />
              </View>
              <Text style={[styles.otpDescription,{color:darkMode?'#B9D0C2':'#52695B'}]}>Code expires 5 minutes after sending.</Text>
              {!!message && <Text accessibilityRole="alert" style={[styles.otpNotice,{color:message==='New code sent.'?(darkMode?'#A6E4BC':'#087F72'):(darkMode?'#FCA5A5':'#B91C1C')}]}>{message}</Text>}
              <TouchableOpacity accessibilityRole="button" disabled={busy || otp.length!==6} onPress={()=>submitOtp(false)} style={[styles.otpVerify,(busy || otp.length!==6)&&styles.buttonDisabled]}>{busy?<ActivityIndicator color="#FFFFFF"/>:<Text style={styles.buttonText}>Verify &amp; Login  →</Text>}</TouchableOpacity>
              <Text style={[styles.otpDescription,{color:darkMode?'#B9D0C2':'#52695B'}]}>Didn't receive the code?</Text>
              <TouchableOpacity accessibilityRole="button" disabled={busy || clock<resendAt} onPress={()=>submitOtp(true)} style={{padding:10}}><Text style={{textAlign:'center',fontWeight:'700',color:clock<resendAt||busy?(darkMode?'#9CB3A5':'#66796D'):(darkMode?'#A6E4BC':'#087F72')}}>{clock<resendAt ? `Resend in ${Math.ceil((resendAt-clock)/1000)}s` : 'Resend OTP'}</Text></TouchableOpacity>
              <View style={[styles.otpDivider,{backgroundColor:darkMode?'#496458':'#E1EBE4'}]}/>
              <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={closeOtp} style={{padding:10}}><Text style={{textAlign:'center',fontWeight:'600',color:darkMode?'#B9D0C2':'#52695B'}}>← Back to login</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  otpOverlay: {flex:1,backgroundColor:'rgba(8,25,19,0.68)'},
  otpCenter: {flexGrow:1,justifyContent:'space-between',alignItems:'center',padding:16},
  otpCard: {width:'100%',maxWidth:420,backgroundColor:'#FFFFFF',borderRadius:28,padding:24,alignItems:'center',gap:8,shadowColor:'#000',shadowOpacity:0.22,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:12},
  otpCardDark: {backgroundColor:'#20372D'},
  otpClose: {position:'absolute',top:12,right:12,width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},
  otpIcon: {width:70,height:70,borderRadius:24,alignItems:'center',justifyContent:'center',marginTop:6,marginBottom:6},
  otpEyebrow: {fontSize:10,fontWeight:'800',letterSpacing:1.4,textAlign:'center'},
  otpTitle: {fontSize:26,fontWeight:'800',textAlign:'center'},
  otpDescription: {fontSize:13,lineHeight:20,textAlign:'center'},
  otpEmail: {fontSize:14,fontWeight:'700',textAlign:'center'},
  otpDigits: {width:'100%',flexDirection:'row',gap:6,position:'relative',marginVertical:12},
  otpDigit: {flex:1,minWidth:0,height:52,borderWidth:1.5,borderRadius:12,alignItems:'center',justifyContent:'center'},
  otpCapture: {position:'absolute',top:0,bottom:0,left:0,right:0,opacity:0.02,color:'transparent',fontSize:16},
  otpNotice: {fontSize:13,textAlign:'center',paddingVertical:6},
  otpVerify: {width:'100%',minHeight:50,borderRadius:14,backgroundColor:'#08795B',alignItems:'center',justifyContent:'center',marginVertical:8},
  otpDivider: {height:1,width:'100%'},
  privacyTopPanel: { width: '94%', maxWidth: 780, alignSelf: 'center', marginTop: 16, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#C8DED0', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  privacyTopPanelDark: { borderColor: '#45604B' },
  authHeaderPanel: { width: '100%', borderWidth: 1, borderColor: '#C8DED0', borderRadius: 20, backgroundColor: 'transparent', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, marginBottom: 18 },
  authHeaderPanelMobile: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, borderRadius: 19, marginBottom: 14 },
  pageMobile: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 32 },
  cardMobile: { padding: 20, borderRadius: 19 },
  formContent: { width: '100%', maxWidth: 480, alignSelf: 'center' },
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

const loginFit: Record<string, object> = { page:{paddingTop:10,paddingBottom:10}, tagline:{fontSize:22,lineHeight:26}, loginHeader:{marginBottom:2}, tabs:{marginBottom:8}, tab:{paddingVertical:8}, subtitle:{marginTop:3,marginBottom:5}, label:{marginTop:9,marginBottom:5,fontSize:14}, input:{height:46,fontSize:16}, forgot:{marginTop:7}, button:{height:46,marginTop:10}, termsContainer:{marginTop:7}, privacyButton:{minHeight:32,paddingVertical:5}, footer:{marginTop:4}, message:{marginTop:7,padding:7} };
