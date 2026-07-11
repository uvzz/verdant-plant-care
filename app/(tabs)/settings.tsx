import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME, APP_VERSION, FREE_PLANT_LIMIT } from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ensureNotificationPermissions } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';
import { clearOpenRouterKey, getOpenRouterKey, setOpenRouterKey } from '@/lib/secrets';
import { FREE_AI_USES_PER_MONTH } from '@/lib/types';

type Benefit = {
  label: string;
  free: string;
  premium: string;
  live: boolean;
};

const BENEFITS: Benefit[] = [
  {
    label: 'Plants in your collection',
    free: `Up to ${FREE_PLANT_LIMIT}`,
    premium: 'Unlimited',
    live: true,
  },
  {
    label: 'AI plant identify',
    free: `${FREE_AI_USES_PER_MONTH}/mo shared`,
    premium: 'Unlimited',
    live: true,
  },
  {
    label: 'AI care guide & coach',
    free: `${FREE_AI_USES_PER_MONTH}/mo shared`,
    premium: 'Unlimited',
    live: true,
  },
  {
    label: 'Photo care logs & gallery',
    free: 'Included',
    premium: 'Included',
    live: true,
  },
  {
    label: 'Care calendar & reminders',
    free: 'Included',
    premium: 'Included',
    live: true,
  },
  {
    label: 'Family sharing',
    free: '—',
    premium: 'Coming soon',
    live: false,
  },
];

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { plants, settings, setPremium, setNotificationsEnabled, aiUsesLeft } =
    usePlants();
  const isPremium = settings.isPremium;

  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [keySaving, setKeySaving] = useState(false);

  useEffect(() => {
    getOpenRouterKey().then((k) => {
      setHasKey(!!k);
      // Don't prefill full secret; leave empty for re-entry
      setApiKey('');
    });
  }, []);

  const saveKey = async () => {
    setKeySaving(true);
    try {
      await setOpenRouterKey(apiKey);
      const k = await getOpenRouterKey();
      setHasKey(!!k);
      setApiKey('');
      Alert.alert(
        k ? 'API key saved' : 'API key cleared',
        k
          ? 'Stored securely on this device. AI identify, guides, and coach are ready.'
          : 'OpenRouter key removed.'
      );
    } catch (e) {
      Alert.alert('Could not save key', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setKeySaving(false);
    }
  };

  const clearKey = async () => {
    await clearOpenRouterKey();
    setHasKey(false);
    setApiKey('');
    Alert.alert('API key removed');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[Type.micro, { color: c.tint }]}>{APP_NAME}</Text>
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>Your collection</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {plants.length} of {isPremium ? '∞' : FREE_PLANT_LIMIT} plants ·{' '}
            {isPremium ? 'Premium' : 'Free'} plan
          </Text>
        </View>

        {/* AI / OpenRouter */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>AI assistant (OpenRouter)</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            Status: {hasKey ? 'Key on device' : 'No key yet'} · AI left this month:{' '}
            {aiUsesLeft === 'unlimited' ? 'Unlimited' : aiUsesLeft}
          </Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
            Paste your OpenRouter API key (sk-or-…). Used for plant identify, care guides, and
            coach. Stored in the device keychain — not uploaded to Verdant servers.
          </Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder={hasKey ? 'Enter new key to replace…' : 'sk-or-v1-…'}
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={[
              styles.keyInput,
              {
                color: c.text,
                backgroundColor: c.surfaceAlt,
                borderColor: c.border,
                fontFamily: Fonts.body,
              },
            ]}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PrimaryButton
              label={keySaving ? 'Saving…' : 'Save key'}
              onPress={saveKey}
              loading={keySaving}
              style={{ flex: 1 }}
            />
            {hasKey ? (
              <PrimaryButton
                label="Clear"
                variant="secondary"
                onPress={clearKey}
                style={{ flex: 0.6 }}
              />
            ) : null}
          </View>
          <Text style={[Type.meta, { color: c.textMuted, marginTop: 10 }]}>
            Get a key at openrouter.ai · Free: {FREE_AI_USES_PER_MONTH} AI uses/month · Premium:
            unlimited
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[Type.title, { color: c.text }]}>Gentle notifications</Text>
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
                Local reminders when care is due today or tomorrow.
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={async (v) => {
                if (v) {
                  const ok = await ensureNotificationPermissions();
                  if (!ok) {
                    Alert.alert(
                      'Notifications disabled',
                      'Enable notifications in system settings to receive gentle reminders.'
                    );
                  }
                }
                await setNotificationsEnabled(v);
              }}
              trackColor={{ true: c.tint, false: c.border }}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.night, borderColor: c.night }]}>
          <Text style={[Type.micro, { color: c.growth }]}>
            {isPremium ? 'Your plan' : 'Plans'}
          </Text>
          <Text style={[Type.displayM, { color: '#EEF3EF', marginTop: 6, fontSize: 22 }]}>
            {isPremium ? 'Premium active' : 'What Premium unlocks'}
          </Text>
          <Text
            style={[
              Type.bodySmall,
              { color: 'rgba(232,239,233,0.7)', marginTop: 6, marginBottom: 16 },
            ]}
          >
            Free is for a small collection with limited AI. Premium removes caps.
          </Text>

          <View style={styles.compareHeader}>
            <Text style={[styles.compareLabel, { color: 'rgba(232,239,233,0.45)' }]}>
              Feature
            </Text>
            <Text style={[styles.compareCol, { color: 'rgba(232,239,233,0.45)' }]}>Free</Text>
            <Text style={[styles.compareCol, { color: c.growth }]}>Premium</Text>
          </View>

          {BENEFITS.map((b, i) => (
            <View
              key={b.label}
              style={[
                styles.compareRow,
                i < BENEFITS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: 'rgba(255,255,255,0.08)',
                },
              ]}
            >
              <View style={styles.compareLabel}>
                <Text style={[Type.meta, { color: '#EEF3EF', fontFamily: Fonts.bodyMedium }]}>
                  {b.label}
                </Text>
                {!b.live ? (
                  <Text
                    style={[
                      Type.meta,
                      { color: 'rgba(232,239,233,0.4)', fontSize: 10, marginTop: 2 },
                    ]}
                  >
                    Coming soon
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.compareCol, Type.meta, { color: 'rgba(232,239,233,0.55)' }]}>
                {b.free}
              </Text>
              <Text
                style={[
                  styles.compareCol,
                  Type.meta,
                  { color: c.growth, fontFamily: Fonts.bodySemi },
                ]}
              >
                {b.premium}
              </Text>
            </View>
          ))}

          <PrimaryButton
            label={isPremium ? 'Switch to Free (demo)' : 'Try Premium (demo)'}
            onPress={() => setPremium(!isPremium)}
            style={{ marginTop: 16 }}
          />
          <Text
            style={[
              Type.meta,
              { color: 'rgba(232,239,233,0.4)', textAlign: 'center', marginTop: 10 },
            ]}
          >
            Demo plan toggle — store billing not connected yet
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>About</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {APP_NAME} v{APP_VERSION}{'\n'}
            Photos stay on device. AI calls go to OpenRouter with your key.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  keyInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 8,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  compareLabel: { flex: 1.4, paddingRight: 6 },
  compareCol: { flex: 1, textAlign: 'left' },
});
