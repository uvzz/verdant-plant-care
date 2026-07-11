import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Overview',
    body: 'Verdant (“we”, “the app”) is a local-first plant care journal. This policy explains what data stays on your device, what is sent for Premium AI, and what we do not do.',
  },
  {
    title: 'Data stored on your device',
    body: 'Plant profiles, photos, care logs, settings, family household members, and Premium status are stored locally (AsyncStorage / app documents). Photos you add are copied into the app’s document storage on device. We do not operate a Verdant account system that uploads your collection by default.',
  },
  {
    title: 'Premium AI (optional)',
    body: 'If you use Premium AI features (identify, care guide, coach, insights), the app sends the minimum needed content (text prompts and, for identify/photo coach, image data) to Verdant’s edge proxy, which forwards the request to OpenRouter / model providers. The OpenRouter API key is held only on our server — never in the app binary as a user-entered secret. Do not include personal data you would not want processed by AI providers.',
  },
  {
    title: 'Purchases',
    body: 'In-app purchases are processed by Apple or Google. We receive entitlement status from the store APIs; we do not receive your full payment card details.',
  },
  {
    title: 'Analytics & advertising',
    body: 'Verdant does not include third-party advertising SDKs or sell your plant photos for ads. We may use standard platform crash / performance tools in future store builds; those will be disclosed here when enabled.',
  },
  {
    title: 'Backups you export',
    body: 'Export creates a JSON file you control. If you share or import a backup, you choose who receives it. Imported backups are stored locally like other journal data.',
  },
  {
    title: 'Children',
    body: 'Verdant is not directed at children under 13. Do not use Premium AI with personal information of children.',
  },
  {
    title: 'Contact',
    body: 'Questions: open an issue at github.com/uvzz/verdant-plant-care or email the developer address listed on the App Store / Play listing when published.',
  },
  {
    title: 'Changes',
    body: 'We may update this policy. The “Last updated” date below reflects the latest revision shipped with the app.',
  },
];

export default function PrivacyScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy policy' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        <Text style={[Type.meta, { color: c.textMuted }]}>Last updated: 2026-07-11</Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.block}>
            <Text style={[Type.title, { color: c.text }]}>{s.title}</Text>
            <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6, lineHeight: 22 }]}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 4 },
  block: { marginTop: 16 },
});
