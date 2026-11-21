import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onBack: () => void;
  darkMode?: boolean;
};

/**
 * Privacy Policy content placeholder.
 * Replace the sections below with your approved, actual Privacy Policy before publication.
 * This screen does not make claims about unverified data handling practices.
 */
export default function PrivacyPolicyScreen({ onBack, darkMode = false }: Props) {
  const colors = darkMode
    ? { background: '#101A16', card: '#1B2A23', border: '#45604B', text: '#F1F7F2', muted: '#B5C9BA', accent: '#A6E4BC' }
    : { background: '#F3FBF5', card: '#FFFFFF', border: '#C8DED0', text: '#1C3327', muted: '#697B70', accent: '#006746' };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.page}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.intro, { color: colors.muted }]}>
          Please insert your approved NutriFitora Privacy Policy here before publishing this page.
        </Text>
        {[
          ['Information we collect', 'Add your verified description of customer information collected.'],
          ['How information is used', 'Explain your actual purposes for using customer information.'],
          ['Storage and security', 'Describe the measures and providers you actually use.'],
          ['Sharing and retention', 'Describe your actual sharing practices and retention periods.'],
          ['Your choices and contact', 'Add the correct contact method and applicable privacy rights.'],
        ].map(([heading, content]) => (
          <View key={heading} style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>{heading}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  card: { width: '100%', maxWidth: 780, borderWidth: 1, borderRadius: 24, padding: 24 },
  backButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: 10 },
  backText: { fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  intro: { fontSize: 15, lineHeight: 23 },
  section: { marginTop: 24 },
  sectionHeading: { fontSize: 17, fontWeight: '700', marginBottom: 7 },
  body: { fontSize: 14, lineHeight: 22 },
});
