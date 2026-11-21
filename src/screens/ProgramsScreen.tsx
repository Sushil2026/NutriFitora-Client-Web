import React, { useCallback, useEffect, useState } from 'react';
import NutriPageHeader from './NutriPageHeader';
import NutriPageFooter from './NutriPageFooter';
import {
  ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, useWindowDimensions,
} from 'react-native';

type Program = {
  id: number;
  programCode: string;
  programName: string;
  durationWeeks: number;
  priceInr: number | null;
  description: string | null;
  goal: string | null;
  includes: string | string[] | null;
  bestFor: string | null;
  isPurchasable: boolean;
};

type Props = {
  darkMode?: boolean;
  onToggleTheme?: () => void;
  onBack: () => void;
  onLogout: () => void;
  customerName?: string;
};

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://nutrifitora-client-api.onrender.com').trim().replace(/\/+$/, '');

const icons: Record<string, string> = {
  SPARK4: '⚡', LEAN12: '♡', IGNITE12: '🔥',
  HORMONE16: '🌿', CALM8: '☘', VITAL12: '↻',
};

const money = (amount: number) => '₹' + amount.toLocaleString('en-IN');

// Neon may return inclusions as text; also support arrays and missing values.
const getProgramIncludes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && !!item.trim());
  }
  if (typeof value === 'string') {
    return value.split(/\r?\n|;/).map(item => item.trim()).filter(Boolean);
  }
  return [];
};

export default function ProgramsScreen({
  darkMode = false, onToggleTheme, onBack, onLogout, customerName,
}: Props) {
  const { width } = useWindowDimensions();
  const small = width < 600;
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/programs`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Unable to load programs (HTTP ${response.status}).`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected API response.');
      setPrograms(data as Program[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load programs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const palette = darkMode ? {
    bg: '#101A16', card: '#1B2A23', header: '#22352A',
    text: '#F1F7F2', muted: '#B2C4B7', border: '#34483B',
    accent: '#8DD5A9', badge: '#2B3C32', button: '#30845B',
    buttonText: '#FFFFFF', inactive: '#34574D',
  } : {
    bg: '#F3FBF5', card: '#FFFFFF', header: '#E8F8EA',
    text: '#123B2C', muted: '#647D6D', border: '#C8DED0',
    accent: '#006746', badge: '#DDF9D1', button: '#006746',
    buttonText: '#FFFFFF', inactive: '#E5E9E7',
  };

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[styles.page, { paddingHorizontal: small ? 14 : 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <View style={[styles.container, { maxWidth: 780 }]}>
        <NutriPageHeader darkMode={darkMode} onToggleTheme={onToggleTheme} onLogout={onLogout} customerName={customerName} navigationLabel="← Assessment" onNavigate={onBack} />

        <View style={[styles.mainPanel, { backgroundColor: palette.card, borderColor: palette.border }, small && styles.mainPanelMobile]}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>NUTRIFITORA WELLNESS PROGRAMS</Text>
          <Text style={[styles.heading, { color: palette.text }]}>Explore Programs</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>Choose a wellness program that suits your goals. Tap any plan to view its details.</Text>

        {loading && <ActivityIndicator size="large" color={palette.accent} style={{ marginTop: 30 }} />}
        {!!error && (
          <View style={[styles.notice, { borderColor: palette.border }]}>
            <Text style={{ color: palette.text }}>{error}</Text>
            <TouchableOpacity onPress={() => void load()}>
              <Text style={{ color: palette.accent, fontWeight: '700', marginTop: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!loading && !error && programs.length === 0 && (
          <Text style={{ color: palette.muted, marginTop: 20 }}>No programs are available yet.</Text>
        )}

        {!loading && programs.map(program => {
          const open = expandedId === program.id;
          const hasPrice = typeof program.priceInr === 'number' && Number.isFinite(program.priceInr);
          const inclusions = getProgramIncludes(program.includes);

          return (
            <View key={program.id}
              style={[styles.card, { backgroundColor: palette.card, borderColor: open ? palette.accent : palette.border }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => setExpandedId(open ? null : program.id)}
                style={[styles.cardHead, open && { backgroundColor: palette.header }]}
              >
                <View style={[styles.iconTile, { backgroundColor: palette.badge }]}>
                  <Text style={styles.programIcon}>{icons[program.programCode] || '🌱'}</Text>
                </View>
                <View style={styles.programNameArea}>
                  <Text style={[styles.name, { color: palette.text }]} numberOfLines={2}>
                    {program.programName}
                  </Text>
                  <Text style={[styles.duration, { color: palette.muted }]}>
                    {program.durationWeeks} weeks
                  </Text>
                </View>
                <View style={[styles.priceBadge, { backgroundColor: hasPrice ? palette.badge : (darkMode ? '#355F50' : '#E5E9E7') }]}>
                  <Text style={[styles.price, { color: hasPrice ? palette.text : (darkMode ? '#FFFFFF' : '#345B47') }]}>
                    {hasPrice ? money(program.priceInr!) : 'Coming Soon'}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: palette.accent }]}>{open ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>

              {open && (
                <View style={styles.details}>
                  <Text style={[styles.detailsHeading, { color: palette.text }]}>{program.programName}</Text>
                  <View style={[styles.durationPill, { backgroundColor: palette.badge }]}>
                    <Text style={[styles.durationPillText, { color: palette.text }]}>{program.durationWeeks} weeks</Text>
                  </View>
                  <Text style={[styles.description, { color: palette.text }]}>
                    {program.description || 'Program description coming soon.'}
                  </Text>
                  {!!program.goal && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, { color: palette.text }]}>Your goal</Text>
                      <Text style={[styles.detailLine, { color: palette.muted }]}>{program.goal}</Text>
                    </View>
                  )}
                  {(inclusions.length > 0 || !program.includes) && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, { color: palette.text }]}>What's included</Text>
                      {inclusions.length === 0 && <Text style={[styles.detailLine, { color: palette.muted }]}>Program inclusions will be updated soon.</Text>}
                      {inclusions.map((item, index) => (
                        <View key={`${program.id}-${index}`} style={[styles.inclusionRow, { borderBottomColor: palette.border }]}>
                          <Text style={[styles.checkmark, { color: palette.accent }]}>✓</Text>
                          <Text style={[styles.inclusionText, { color: palette.text }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!!program.bestFor && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, { color: palette.text }]}>Best for</Text>
                      <Text style={[styles.detailLine, { color: palette.muted }]}>{program.bestFor}</Text>
                    </View>
                  )}
                  <View style={[styles.checkoutRow, { borderColor: palette.border, backgroundColor: palette.header }]}>
                    <Text style={[styles.checkoutPrice, { color: palette.text }]}>
                      {hasPrice ? money(program.priceInr!) : 'Price Coming Soon'}
                    </Text>
                    <TouchableOpacity disabled accessibilityRole="button"
                      accessibilityState={{ disabled: true }}
                      style={[styles.checkoutButton, { backgroundColor: darkMode ? '#355F50' : '#E5E9E7' }]}>
                      <Text style={[styles.checkoutButtonText, { color: darkMode ? '#FFFFFF' : '#345B47' }]}>{hasPrice ? 'Buy Soon' : 'Coming Soon'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.note, { color: palette.muted }]}>
                    Checkout is not connected yet. No payment will be collected.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        </View>
        <NutriPageFooter darkMode={darkMode} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', paddingTop: 28, paddingBottom: 56 },
  container: { width: '100%', maxWidth: 780, alignSelf: 'center' },
  headerPanel: { width: '100%', borderWidth: 1, borderRadius: 20, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, marginBottom: 18 },
  headerMobile: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10 },
  headerTop: { width: '100%', minHeight: 86, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoBadge: { width: 180, height: 82, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 14, fontWeight: '600' },
  navButton: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  navText: { fontSize: 13, fontWeight: '700' },
  themeButton: { width: 52, height: 28, borderRadius: 16, borderWidth: 1, borderColor: '#79C96E', backgroundColor: '#F9FFF8', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 2 },
  themeButtonDark: { backgroundColor: '#123D35', borderColor: '#4BAA95', justifyContent: 'flex-start' },
  themeThumb: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  themeIcon: { fontSize: 15, lineHeight: 19 },
  logoutButton: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#006746' },
  logoutButtonDark: { backgroundColor: '#F4F8F4' },
  logoutDoor: { position: 'absolute', left: 22, top: 9, width: 16, height: 22, borderWidth: 2, borderRightWidth: 0, borderColor: '#FFFFFF', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
  logoutDoorDark: { borderColor: '#246B4A' },
  logoutArrow: { position: 'absolute', left: 29, top: 5, fontSize: 26, lineHeight: 29, color: '#FFFFFF', fontWeight: '700' },
  logoutArrowDark: { color: '#246B4A' },
  logoutLabel: { position: 'absolute', bottom: 8, color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  logoutLabelDark: { color: '#246B4A' },
  mainPanel: { width: '100%', padding: 34, borderRadius: 30, borderWidth: 1, shadowColor: '#1A4530', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  mainPanelMobile: { padding: 20, borderRadius: 19 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  top: { width: '100%', minHeight: 90, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, marginBottom: 26 },
  back: { width: 38, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 36, lineHeight: 42 },
  logo: { width: 180, height: 80 },
  logoSmall: { width: 150, height: 70 },
  toggle: { width: 52, height: 28, borderWidth: 1, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontSize: 18, fontWeight: '700' },
  heading: { fontSize: 27, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 22 },
  notice: { borderWidth: 1, padding: 16, borderRadius: 16 },
  card: { borderWidth: 1, borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  cardHead: { minHeight: 92, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  iconTile: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  programIcon: { fontSize: 27 },
  programNameArea: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '800' },
  duration: { fontSize: 13, marginTop: 5 },
  priceBadge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8 },
  price: { fontSize: 12, fontWeight: '800' },
  chevron: { fontSize: 25, fontWeight: '700', width: 18, textAlign: 'center' },
  details: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 },
  durationPill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, marginBottom: 14 },
  durationPillText: { fontSize: 12, fontWeight: '700' },
  detailSection: { marginBottom: 16 },
  detailSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  inclusionRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', borderBottomWidth: 1, paddingVertical: 9 },
  checkmark: { fontSize: 17, fontWeight: '800', width: 18 },
  inclusionText: { fontSize: 13, lineHeight: 20, flex: 1 },
  checkoutRow: { borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  checkoutPrice: { fontSize: 19, fontWeight: '800', flexShrink: 1 },
  checkoutButton: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginLeft: 8 },
  checkoutButtonText: { color: '#52645A', fontWeight: '800', fontSize: 13 },
  detailsHeading: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  detailLine: { fontSize: 14, lineHeight: 23, marginBottom: 6 },
  buy: { marginTop: 18, borderRadius: 25, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buyText: { fontSize: 15, fontWeight: '800' },
  note: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});

