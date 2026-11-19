
import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";

type Props = {
  onBack: () => void;
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide when registering, " +
      "such as your name, email address and phone number. " +
      "We may also collect nutrition-related information " +
      "that you choose to share when using our services.",
  },
  {
    title: "2. How We Use Information",
    content:
      "We use your information to manage your account, " +
      "provide nutrition services, communicate with you, " +
      "and maintain the security of the application.",
  },
  {
    title: "3. Data Security",
    content:
      "We implement technical and organizational safeguards " +
      "designed to protect personal information. " +
      "No system can guarantee absolute security.",
  },
  {
    title: "4. Data Sharing",
    content:
      "Information may be shared with authorized service " +
      "providers and nutrition professionals when necessary " +
      "to deliver the services you request, subject to " +
      "applicable privacy requirements.",
  },
  {
    title: "5. Your Rights",
    content:
      "You may contact us to request access to, correction " +
      "of, or deletion of your personal information, " +
      "subject to applicable law and retention obligations.",
  },
  {
    title: "6. Changes to This Policy",
    content:
      "We may update this policy as our services change. " +
      "The latest version will be available in the app.",
  },
];

export default function PrivacyPolicyScreen({
  onBack,
}: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          Privacy Policy
        </Text>

        <Text style={styles.subtitle}>
          Your privacy matters to NutriFitora.
        </Text>

        <Text style={styles.date}>
          Last updated: November 19, 2026
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.intro}>
          This Privacy Policy explains how NutriFitora
          handles personal information when you use
          our application.
        </Text>

        {sections.map((section) => (
          <View
            key={section.title}
            style={styles.card}
          >
            <Text style={styles.title}>
              {section.title}
            </Text>

            <Text style={styles.paragraph}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.title}>
            7. Contact Us
          </Text>

          <Text style={styles.paragraph}>
            For privacy questions, contact:
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:YOUR_PRIVACY_EMAIL"
              )
            }
          >
            <Text style={styles.email}>
              Contact Privacy Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },
  content: {
    paddingBottom: 35,
  },
  header: {
    backgroundColor: "#167B65",
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 30,
  },
  back: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 25,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#E2F4EB",
    fontSize: 15,
    marginTop: 10,
  },
  date: {
    color: "#D1E8DD",
    fontSize: 12,
    marginTop: 15,
  },
  body: {
    padding: 16,
  },
  intro: {
    fontSize: 15,
    color: "#34483E",
    lineHeight: 24,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#167B65",
    marginBottom: 9,
  },
  paragraph: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 23,
  },
  email: {
    color: "#167B65",
    fontWeight: "bold",
    marginTop: 10,
  },
});
