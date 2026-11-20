import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Answers = {
  age: string; heightCm: string; weightKg: string;
  goal: string; activity: string; diet: string;
  meals: string; water: string; sleep: string; allergies: string; notes: string;
};

type Props = { customerName?: string; onLogout: () => void };
const initial: Answers = { age: '', heightCm: '', weightKg: '', goal: '', activity: '', diet: '', meals: '', water: '', sleep: '', allergies: '', notes: '' };
const goals = ['Improve general health', 'Manage weight', 'Build strength', 'Improve energy', 'Improve eating habits'];
const activities = ['Mostly sitting', 'Lightly active', 'Moderately active', 'Very active'];
const diets = ['No preference', 'Vegetarian', 'Vegan', 'Eggetarian', 'Non-vegetarian', 'Other'];
const stages = ['About you', 'Your goals', 'Daily habits', 'Review'];
type NumericKey = 'age' | 'heightCm' | 'weightKg' | 'meals' | 'water' | 'sleep';
const numericRules: Record<NumericKey, { integer: boolean; min: number; max: number; unit: string }> = {
  age: { integer: true, min: 18, max: 120, unit: 'years' },
  heightCm: { integer: false, min: 80, max: 250, unit: 'cm' },
  weightKg: { integer: false, min: 20, max: 400, unit: 'kg' },
  meals: { integer: true, min: 1, max: 12, unit: 'meals' },
  water: { integer: false, min: 0.1, max: 15, unit: 'litres' },
  sleep: { integer: false, min: 0.5, max: 24, unit: 'hours' },
};
function sanitizeNumeric(value: string, integer: boolean): string {
  // Accept digits only; decimal fields allow one decimal separator.
  const cleaned = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  if (integer) return cleaned.replace(/\./g, '');
  const [whole, ...fractions] = cleaned.split('.');
  return fractions.length ? `${whole}.${fractions.join('')}` : whole;
}
function validateNumeric(key: NumericKey, value: string): string | null {
  if (!value) return null;
  const rule = numericRules[key];
  const number = Number(value);
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(value) || !Number.isFinite(number) ||
      (rule.integer && !Number.isInteger(number)) || number < rule.min || number > rule.max) {
    return `Enter a valid ${key === 'heightCm' ? 'height' : key === 'weightKg' ? 'weight' : key} (${rule.min}–${rule.max} ${rule.unit}).`;
  }
  return null;
}

export default function AssessmentScreen({ customerName, onLogout }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const update = (key: keyof Answers, value: string) => { setAnswers(prev => ({ ...prev, [key]: value })); setError(''); };
  const numeric = (key: NumericKey, label: string, placeholder: string, optional = false) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} keyboardType={numericRules[key].integer ? 'number-pad' : 'decimal-pad'} placeholder={placeholder} value={answers[key]} onChangeText={value => update(key, sanitizeNumeric(value, numericRules[key].integer))} maxLength={8} accessibilityLabel={label} />
    </View>
  );
  const textField = (key: keyof Answers, label: string, placeholder: string, multiline = false) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.multiline]} multiline={multiline} placeholder={placeholder} value={answers[key]} onChangeText={value => update(key, value)} />
    </View>
  );
  const choice = (key: keyof Answers, label: string, options: string[]) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>{options.map(option => (
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: answers[key] === option }} key={option} style={[styles.choice, answers[key] === option && styles.choiceSelected]} onPress={() => update(key, option)}>
          <Text style={[styles.choiceText, answers[key] === option && styles.choiceTextSelected]}>{option}</Text>
        </TouchableOpacity>
      ))}</View>
    </View>
  );
  const validate = () => {
    if (step === 0) {
      for (const key of ['age', 'heightCm', 'weightKg'] as NumericKey[]) {
        if (!answers[key]) { setError('Age, height and weight are required.'); return false; }
        const validationError = validateNumeric(key, answers[key]);
        if (validationError) { setError(validationError); return false; }
      }
    }
    if (step === 2) {
      for (const key of ['meals', 'water', 'sleep'] as NumericKey[]) {
        const validationError = validateNumeric(key, answers[key]);
        if (validationError) { setError(validationError); return false; }
      }
    }
    if (step === 1 && (!answers.goal || !answers.activity || !answers.diet)) {
      setError('Please select your goal, activity level, and dietary preference.'); return false;
    }
    return true;
  };
  const next = () => { if (validate()) { setError(''); setStep(s => Math.min(s + 1, 3)); } };
  // BMI is calculated only from valid height and weight inputs.
  const heightError = validateNumeric('heightCm', answers.heightCm);
  const weightError = validateNumeric('weightKg', answers.weightKg);
  const heightMeters = Number(answers.heightCm) / 100;
  const bmi = answers.heightCm && answers.weightKg && !heightError && !weightError && heightMeters > 0
    ? Number(answers.weightKg) / (heightMeters * heightMeters)
    : null;
  const bmiCategory = bmi === null ? '' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obesity';
  const bmiColor = bmi === null ? '#246B4A' : bmi < 18.5 ? '#8A5A16' : bmi < 25 ? '#246B4A' : bmi < 30 ? '#A65C12' : '#A42C2C';
  const bmiPanel = bmi !== null ? (
    <View style={styles.bmiPanel} accessibilityRole="summary">
      <Text style={styles.bmiHeading}>YOUR BODY MASS INDEX (BMI)</Text>
      <Text style={[styles.bmiNumber, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
      <Text style={[styles.bmiCategory, { color: bmiColor }]}>{bmiCategory}</Text>
      <Text style={styles.bmiNote}>Calculated from your height and weight. BMI is a screening measure, not a diagnosis, and may not reflect individual body composition.</Text>
    </View>
  ) : null;
  const rows: Array<[string, string]> = [
    ['Age', `${answers.age} years`], ['Height', `${answers.heightCm} cm`], ['Weight', `${answers.weightKg} kg`], ['BMI', bmi !== null ? `${bmi.toFixed(1)} (${bmiCategory})` : 'Not available'],
    ['Goal', answers.goal], ['Activity', answers.activity], ['Diet', answers.diet],
    ['Meals per day', answers.meals || 'Not provided'], ['Water per day', answers.water ? `${answers.water} litres` : 'Not provided'],
    ['Sleep', answers.sleep ? `${answers.sleep} hours` : 'Not provided'], ['Allergies / restrictions', answers.allergies || 'Not provided'],
    ['Additional notes', answers.notes || 'Not provided'],
  ];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.top}><View><Text style={styles.brand}>Nutri Fitora</Text><Text style={styles.greeting}>Hello{customerName ? `, ${customerName}` : ''}!</Text></View>
        <TouchableOpacity onPress={onLogout} accessibilityRole="button"><Text style={styles.logout}>Sign out</Text></TouchableOpacity></View>
      <View style={styles.card}>
        {complete ? <>
          <Text style={styles.eyebrow}>ASSESSMENT COMPLETE</Text>
          <Text style={styles.title}>Thank you for sharing!</Text>
          {bmiPanel}
          <Text style={styles.description}>Your assessment is complete for this session. Your answers have not yet been saved to the server. A nutritionist can use this information once assessment storage is connected.</Text>
          <TouchableOpacity style={styles.primary} onPress={() => { setComplete(false); setStep(3); }}><Text style={styles.primaryText}>Review answers</Text></TouchableOpacity>
        </> : <>
          <Text style={styles.eyebrow}>CUSTOMER NUTRITION ASSESSMENT</Text>
          <Text style={styles.title}>{stages[step]}</Text>
          <Text style={styles.description}>Step {step + 1} of 4 · Help us understand your nutrition needs.</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(step + 1) * 25}%` }]} /></View>
          {step === 0 && <>
            <Text style={styles.section}>Your basic information</Text>
            {numeric('age', 'Age (18+)', 'e.g. 28')}
            {numeric('heightCm', 'Height (cm)', 'e.g. 165')}
            {numeric('weightKg', 'Weight (kg)', 'e.g. 65')}
            {bmiPanel}
            <Text style={styles.hint}>These details are for assessment context, not a medical diagnosis.</Text>
          </>}
          {step === 1 && <>
            {choice('goal', 'What is your primary goal?', goals)}
            {choice('activity', 'How active are you?', activities)}
            {choice('diet', 'Dietary preference', diets)}
          </>}
          {step === 2 && <>
            {numeric('meals', 'Meals per day (optional)', 'e.g. 3', true)}
            {numeric('water', 'Daily water intake in litres (optional)', 'e.g. 2.5', true)}
            {numeric('sleep', 'Typical sleep in hours (optional)', 'e.g. 7.5', true)}
            {textField('allergies', 'Food allergies or restrictions (optional)', 'e.g. peanuts, lactose', true)}
            {textField('notes', 'Anything else for your nutritionist? (optional)', 'Share your routine or preferences', true)}
          </>}
          {step === 3 && <>
            <Text style={styles.section}>Review your answers</Text>
            {bmiPanel}
            {rows.map(([label, value]) => <View key={label} style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text></View>)}
            <Text style={styles.hint}>Completing this form does not submit information to the API yet.</Text>
          </>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            {step > 0 && <TouchableOpacity style={styles.secondary} onPress={() => { setError(''); setStep(s => s - 1); }}><Text style={styles.secondaryText}>Back</Text></TouchableOpacity>}
            <TouchableOpacity style={[styles.primary, { flex: 1 }]} onPress={step === 3 ? () => setComplete(true) : next}>
              <Text style={styles.primaryText}>{step === 3 ? 'Complete assessment' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        </>}
      </View>
      <Text style={styles.footer}>Your wellness, one choice at a time.</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F3' }, page: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 32, paddingBottom: 50 },
  top: { width: '100%', maxWidth: 620, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand: { fontSize: 23, fontWeight: '800', color: '#18392C' }, greeting: { marginTop: 4, color: '#66786C' }, logout: { color: '#246B4A', fontWeight: '700' },
  card: { width: '100%', maxWidth: 620, padding: 25, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2EAE4' },
  eyebrow: { color: '#246B4A', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, title: { fontSize: 27, fontWeight: '800', color: '#1C3327', marginTop: 9 },
  description: { color: '#697B70', marginTop: 8, lineHeight: 21, marginBottom: 20 },
  progressTrack: { height: 7, borderRadius: 7, backgroundColor: '#E8F0EA', marginBottom: 25, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#246B4A', borderRadius: 7 },
  section: { fontSize: 17, fontWeight: '700', color: '#1C3327', marginBottom: 15 }, field: { marginBottom: 20 },
  label: { color: '#304438', fontSize: 14, fontWeight: '700', marginBottom: 9 }, input: { minHeight: 49, borderWidth: 1, borderColor: '#DCE5DE', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#FCFDFC', color: '#20382A' },
  multiline: { minHeight: 85, textAlignVertical: 'top' }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  choice: { borderWidth: 1, borderColor: '#DCE5DE', paddingVertical: 11, paddingHorizontal: 13, borderRadius: 10, backgroundColor: '#FCFDFC' },
  choiceSelected: { backgroundColor: '#E7F3EB', borderColor: '#246B4A' }, choiceText: { color: '#3B5143' }, choiceTextSelected: { color: '#246B4A', fontWeight: '700' },
  hint: { color: '#7B8980', fontSize: 12, lineHeight: 19, marginBottom: 15 }, error: { color: '#A42C2C', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 }, primary: { minHeight: 49, borderRadius: 11, backgroundColor: '#246B4A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, primaryText: { color: '#FFFFFF', fontWeight: '800' },
  secondary: { minHeight: 49, borderRadius: 11, borderWidth: 1, borderColor: '#CADACF', paddingHorizontal: 23, justifyContent: 'center' }, secondaryText: { color: '#246B4A', fontWeight: '700' },
  reviewRow: { borderBottomWidth: 1, borderBottomColor: '#EFF3EF', paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  reviewLabel: { color: '#697B70', flex: 1 }, reviewValue: { color: '#1C3327', fontWeight: '600', flex: 1, textAlign: 'right' },
  bmiPanel: { borderWidth: 2, borderColor: '#B6D8C1', borderRadius: 16, backgroundColor: '#EDF8F0', padding: 18, marginBottom: 20, alignItems: 'center' },
  bmiHeading: { color: '#365E45', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  bmiNumber: { fontSize: 44, fontWeight: '900', marginTop: 6 },
  bmiCategory: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  bmiNote: { color: '#65796B', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  footer: { color: '#9AA69D', fontSize: 12, marginTop: 20, textAlign: 'center' },
});
