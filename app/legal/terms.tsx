import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { useI18n } from '@/lib/i18n';

// Policy section titles/bodies are deliberately left English (not folded
// into the catalog): this is a legal document, and a machine/ad-hoc
// translation of terms-of-use text carries real accuracy/liability risk that
// ordinary UI copy doesn't — it needs a professional/certified translation
// pass of its own, out of scope for this string-localization task. Only the
// screen chrome (the Stack.Screen header title below) is localized.
// Recorded in the Task 7 report.
const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Agreement',
    body: 'By using Verdant you agree to these Terms of Use. If you do not agree, do not use the app.',
  },
  {
    title: 'The service',
    body: 'Verdant is a plant care journal with optional Premium features (unlimited plants, AI assist). Free features work offline as a local journal. Premium AI requires network access and a valid Premium entitlement.',
  },
  {
    title: 'Not professional advice',
    body: 'Care schedules, AI identify, guides, and coach replies are educational only. They are not botanical certification, pest diagnosis lab results, or veterinary advice. Always check soil and observe your plants; seek a local grower or professional when needed.',
  },
  {
    title: 'Subscriptions & purchases',
    body: 'Paid plans are billed by Apple or Google under their terms. Manage or cancel in system subscription settings. Demo unlocks in development builds are not store purchases.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not abuse AI features (spam, illegal content, or attempts to extract server secrets). Do not reverse-engineer or overload our edge API beyond normal app use.',
  },
  {
    title: 'Your content',
    body: 'You retain rights to photos and notes you add. You grant us a limited license to process content only as needed to provide the features you request — AI assists, and cloud backup/sync if you enable it. Your journal remains under your control: it stays on your device, and syncs only to your own account when you turn sync on.',
  },
  {
    title: 'Disclaimer of warranties',
    body: 'The app is provided “as is” without warranties of merchantability or fitness for a particular purpose, to the fullest extent permitted by law.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the fullest extent permitted by law, we are not liable for plant loss, indirect damages, or data loss. Maintain backups via export if your collection matters to you.',
  },
  {
    title: 'Contact',
    body: 'Support and legal notices: github.com/uvzz/verdant-plant-care issues, or the developer contact on the store listing.',
  },
];

export default function TermsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <>
      {/* This local Stack.Screen overrides app/_layout.tsx's
          `title: t('nav.terms')` for this route — it was hardcoded English
          here, so the header silently ignored the app language. Fixed by
          reusing the same nav.terms key rather than a duplicate. */}
      <Stack.Screen options={{ title: t('nav.terms') }} />
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
