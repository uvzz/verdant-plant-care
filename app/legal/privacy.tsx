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
    body: 'Plant profiles, photos, care logs, settings, family household members, and Premium status are stored locally (AsyncStorage / app documents). Photos you add are copied into the app’s document storage on device. No account is required to use Verdant, and if you never sign in, this data never leaves your phone.',
  },
  {
    title: 'Cloud sync (optional, off by default)',
    body: 'If you turn on sync and sign in with Apple or Google, Verdant backs up and syncs your plants, care history, and photos so they appear on your other devices. Your provider returns a signed identity token; our server verifies it and derives a per-account sync identifier from it. We keep only your provider, email (if shared), and that sync id — never the raw token. Your collection is stored on Verdant’s infrastructure (Cloudflare) under that sync id and transferred encrypted in transit (HTTPS). Signing out pauses sync on that device; your local data stays.',
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
    title: 'Your choices',
    body: 'Use Verdant fully offline with no account. Turn cloud sync on or off at any time in Settings. Sign out to stop syncing while keeping your local journal. Deleting a plant or the app removes local data; contact us to remove synced data.',
  },
  {
    title: 'Children',
    body: 'Verdant is not directed at children under 13. Do not use Premium AI with personal information of children.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy? Email the developer address listed on the App Store / Google Play listing. The full policy is also published at verdant-bk5.pages.dev/privacy.',
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
        <Text style={[Type.meta, { color: c.textMuted }]}>Last updated: 2026-07-13</Text>
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
