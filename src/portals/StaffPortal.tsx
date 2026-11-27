import PasswordField from '../screens/PasswordField';
import {AuthHeader, AuthFooter} from '../screens/AuthChrome';
import NutriPageHeader from '../screens/NutriPageHeader';
import NutriPageFooter from '../screens/NutriPageFooter';
import AdminLayout from '../admin/AdminLayout';
import ClientAssignmentsScreen from '../admin/ClientAssignmentsScreen';
import React, { useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions, Platform } from 'react-native';
import DashboardScreen from '../nutritionist/DashboardScreen';
import { StatusBar } from 'expo-status-bar';

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

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://nutrifitora-client-api.onrender.com').trim().replace(/\/+$/, '');
type Role = 'admin' | 'nutritionist';
type Dashboard = { customers?: number; nutritionists?: number; activeUsers?: number; assignedClients?: number; appointments?: number; pendingReviews?: number; dataStatus?: string };

export default function StaffPortal({ role, onHome, onSession, onSignOut }: { role: Role; onHome?: () => void; onSession?: (token: string) => void; onSignOut?: () => void }) {
  const admin = role === 'admin';
  const title = admin ? 'Administrator' : 'Nutritionist';
  const expectedRole = admin ? 'Administrator' : 'Nutritionist';
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const staffImageWidth = 56;
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const themed = (key: string, style: any) => [darkMode ? [style, appDarkOverrides[key]] : style, !token && loginFit[key]];
  const toggleTheme = () => setDarkMode(current => !current);
  const logout = () => { setToken(''); setStats(null); setFullName(''); setEmail(''); setPassword(''); setShowPassword(false); setMessage(''); };
  const goCustomer = () => { if (onHome) { onHome(); return; } if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign('/'); };

  async function signIn() {
    if (!email.trim() || !password) { setMessage('Enter your email and password.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, portal: role }),
      });
      const raw = await response.text();
      let body: any = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { /* Ignore non-JSON API errors */ }
      if (!response.ok) throw new Error(body.message || body.title || `Sign in failed (HTTP ${response.status}).`);
      const accessToken = body.accessToken || body.token;
      if (!accessToken) throw new Error('No access token returned.');
      if (!Array.isArray(body.user?.roles) || !body.user.roles.includes(expectedRole)) {
        throw new Error('Your account is not authorized for this portal.');
      }
      const dashboardResponse = await fetch(`${API_URL}/api/${role}/dashboard`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!dashboardResponse.ok) throw new Error(`Unable to load your dashboard (HTTP ${dashboardResponse.status}).`);
      const dashboard = await dashboardResponse.json();
      setStats(dashboard); setFullName(body.user?.fullName || title); setToken(accessToken); setPassword('');
      if (onSession) onSession(accessToken);
      else if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.replaceState({}, '', `/${role}/dashboard`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to connect to the API.');
    } finally { setBusy(false); }
  }
  function signOut() {
    logout();
    if (onSignOut) { onSignOut(); return; }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/${role}/login`);
    }
  }
  const tile = (label: string, value?: number) => (
    <View key={label} style={[styles.staffTile, darkMode && styles.staffTileDark]}>
      <Text style={themed('heading', styles.staffTileValue)}>{value === undefined ? '—' : value}</Text>
      <Text style={themed('subtitle', styles.staffTileLabel)}>{label}</Text>
    </View>
  );

  const sharedHeader = <NutriPageHeader darkMode={darkMode} customerName={fullName} onToggleTheme={toggleTheme} onLogout={signOut}/>;
  const sharedFooter = <NutriPageFooter darkMode={darkMode}/>;
  if (admin && token) return <AdminLayout token={token} apiUrl={API_URL} dark={darkMode} name={fullName}
    header={<><StatusBar style={darkMode ? 'light' : 'dark'} /><NutriPageHeader darkMode={darkMode} customerName={fullName} onToggleTheme={toggleTheme} onLogout={signOut} /></>}
    footer={<NutriPageFooter darkMode={darkMode} />}
  />;
  return (
    <SafeAreaView style={themed('safe', styles.safe)}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <ScrollView style={themed('scroll', styles.scroll)} contentContainerStyle={[themed('page', styles.page), isMobile && styles.pageMobile, !token && {paddingHorizontal:isMobile?10:20,paddingTop:10,paddingBottom:10}, !!token && !admin && {justifyContent:'flex-start',paddingHorizontal:width<600?12:24}]} keyboardShouldPersistTaps="always">
        <View style={[themed('shell', styles.shell), !!token && !admin && {maxWidth: '100%', alignSelf: 'stretch'}, !token && {maxWidth:'100%',flexGrow:1,justifyContent:'space-between',gap:10}] }>
          {!token && <AuthHeader dark={darkMode} onToggle={toggleTheme} onHome={goCustomer} />}
          <View style={{width:'100%',flexDirection:!token && width>=850?'row':'column',alignItems:(!token && width >= 850)?'stretch':'center',flexGrow:!token?1:0,gap:12}}>
          {!!token ? sharedHeader : width>=850 ? <View style={{flex:1,width:0,backgroundColor:darkMode?'#153E32':'#155D49',borderRadius:16,padding:height<760?18:28,justifyContent:'center'}}><View style={{gap:10}}><Text style={{fontSize:Math.min(36,width*0.03),fontWeight:'800',color:'#FFFFFF'}}>{admin?'Lead with confidence.':'Make wellness your mission.'}</Text><Text style={{color:'#D2EBDD',fontSize:16}}>Your secure professional workspace.</Text><Image source={admin?require('../../assets/login-admin-art.jpg'):require('../../assets/login-nutritionist-art.jpg')} resizeMode="contain" style={{width:'100%',height:Math.max(80,Math.min(180,height*0.20)),borderRadius:12,backgroundColor:'#FFFFFF'}}/>{(admin?['Manage customers and teams','Oversee wellness programs','Monitor platform activity']:['Manage your clients','Plan personalised nutrition','Track client progress']).map(item=><Text key={item} style={{color:'#D8F2DF',fontSize:15}}>✓  {item}</Text>)}</View></View> : null}

          {!!token && !admin ? <DashboardScreen token={token} apiUrl={API_URL} dark={darkMode} name={fullName} onLogout={signOut} /> : <View style={[themed('card', styles.card), isMobile && styles.cardMobile, !token && {flex:width>=850?1:undefined,padding:height<760?20:32,justifyContent:'center',borderRadius:22,borderWidth:2,borderColor:darkMode?'#58B98B':'#238B61',shadowColor:'#164D36',shadowOpacity:0.09,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:3,width:width>=850?0:'100%'}]}>
            <View style={styles.formContent}>
              {!token ? (
                <>
                  <Image
                    source={admin
                      ? require('../../assets/portal-admin-icon.png')
                      : require('../../assets/portal-nutritionist-icon.png')}
                    style={[styles.nutritionistIllustration, {
                      width: width<600?64:76,
                      height: width<600?64:76,
                      alignSelf: "center", marginTop:4, marginBottom:12,
                    }]}
                    resizeMode="contain"
                    accessibilityLabel={admin
                      ? 'Administrator managing the wellness platform on a laptop'
                      : 'Nutritionist holding a clipboard with fresh produce'}
                  />
                  <Text style={[themed('heading', styles.heading),{textAlign:'center'}]}>{title} Login</Text>
                  <Text style={themed('label', styles.label)}>Email address</Text>
                  <TextInput style={themed('input', styles.input)} value={email} onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor={darkMode ? '#A5BBAA' : '#88998D'} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
                  <Text style={themed('label', styles.label)}>Password</Text>
                  <PasswordField dark={darkMode} fieldStyle={themed('input', styles.input)} value={password} onChangeText={setPassword} placeholder="Enter password" placeholderTextColor={darkMode ? '#A5BBAA' : '#88998D'}  autoCapitalize="none" autoComplete="current-password" onSubmitEditing={signIn} />
                  <TouchableOpacity style={themed('forgot', styles.forgot)} onPress={() => setMessage('Password reset will be added in the next step.')}>
                    <Text style={themed('forgotText', styles.forgotText)}>Forgot password?</Text>
                  </TouchableOpacity>
                  {!!message && <Text accessibilityRole="alert" style={themed('message', styles.message)}>{message}</Text>}
                  <TouchableOpacity disabled={busy} onPress={signIn} style={[themed('button', styles.button), busy && themed('buttonDisabled', styles.buttonDisabled)]}>
                    {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={themed('buttonText', styles.buttonText)}>Sign in</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={themed('eyebrow', styles.eyebrow)}>NUTRIFITORA {title.toUpperCase()} PORTAL</Text>
                  <Text style={themed('heading', styles.heading)}>Welcome, {fullName}</Text>
                  <Text style={themed('subtitle', styles.subtitle)}>Your secure {title.toLowerCase()} dashboard</Text>
                  <View style={styles.staffTiles}>
                    {admin ? <>{tile('Customers', stats?.customers)}{tile('Nutritionists', stats?.nutritionists)}{tile('Active users', stats?.activeUsers)}</> : <>{tile('Assigned clients', stats?.assignedClients)}{tile('Appointments', stats?.appointments)}{tile('Pending reviews', stats?.pendingReviews)}</>}
                  </View>
                  {admin && <ClientAssignmentsScreen token={token} apiUrl={API_URL} dark={darkMode} />}
                  {!admin && <Text style={themed('subtitle', styles.subtitle)}>Dashboard metrics are placeholders until assignments and appointments are implemented.</Text>}
                </>
              )}
            </View>
          </View>}
          </View>
          {token ? sharedFooter : <AuthFooter dark={darkMode} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logout: { width: 52, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutIcon: { fontSize: 20, lineHeight: 23, fontWeight: '700' },
  logoutText: { fontSize: 11, fontWeight: '700' },
  nutritionistIllustration: { alignSelf: "center", marginBottom: 12 },
  staffTiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  staffTile: { flexGrow: 1, minWidth: 135, padding: 18, borderWidth: 1, borderRadius: 12, borderColor: "#E0EFE4" },
  staffTileDark: { borderColor: "#45604B" },
  staffTileValue: { fontSize: 25, fontWeight: "800" },
  staffTileLabel: { marginTop: 5 },
  staffReturn: { alignItems: "center", paddingVertical: 12, marginTop: 12 },
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
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
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
  forgotText: { color: '#A6E4BC' }, message: { color: '#FECACA', backgroundColor: '#451F24', borderColor: '#9F454B' },
  terms: { color: '#B5C9BA' }, privacyLink: { color: '#A6E4BC' },
  footer: { color: '#A0B7A6' },
};

const loginFit: Record<string, object> = { page:{paddingTop:10,paddingBottom:10}, tagline:{fontSize:22,lineHeight:26}, loginHeader:{marginBottom:2}, tabs:{marginBottom:8}, tab:{paddingVertical:8}, subtitle:{marginTop:3,marginBottom:5}, label:{marginTop:9,marginBottom:5,fontSize:14}, input:{height:46,fontSize:16}, forgot:{marginTop:7}, button:{height:46,marginTop:10}, termsContainer:{marginTop:7}, privacyButton:{minHeight:32,paddingVertical:5}, footer:{marginTop:4}, message:{marginTop:7,padding:7} };
