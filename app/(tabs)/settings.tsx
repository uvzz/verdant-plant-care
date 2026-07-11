import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME, APP_VERSION, FREE_PLANT_LIMIT } from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ensureNotificationPermissions } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';

type Benefit = {
  label: string;
  free: string;
  premium: string;
  /** true = premium feature is live in the app today */
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
    label: 'Full care history & stats',
    free: 'Basic log only',
    premium: 'Charts, streaks, insights',
    live: false,
  },
  {
    label: 'Species care guides',
    free: '—',
    premium: 'Rare plant & orchid guides',
    live: false,
  },
  {
    label: 'Family sharing',
    free: '—',
    premium: 'Share a household garden',
    live: false,
  },
  {
    label: 'Premium plant profiles',
    free: '—',
    premium: 'One-time expert profiles',
    live: false,
  },
];

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { plants, settings, setPremium, setNotificationsEnabled } = usePlants();
  const isPremium = settings.isPremium;

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

        {/* Premium comparison — what you get */}
        <View style={[styles.card, { backgroundColor: c.night, borderColor: c.night }]}>
          <Text style={[Type.micro, { color: c.growth }]}>
            {isPremium ? 'Your plan' : 'Plans'}
          </Text>
          <Text
            style={[
              Type.displayM,
              { color: '#EEF3EF', marginTop: 6, fontSize: 22 },
            ]}
          >
            {isPremium ? 'Premium active' : 'What Premium unlocks'}
          </Text>
          <Text
            style={[
              Type.bodySmall,
              { color: 'rgba(232,239,233,0.7)', marginTop: 6, marginBottom: 16 },
            ]}
          >
            Free is for a small collection. Premium is for collectors who want no
            plant cap and deeper tools.
          </Text>

          <View style={styles.compareHeader}>
            <Text style={[styles.compareLabel, { color: 'rgba(232,239,233,0.45)' }]}>
              Feature
            </Text>
            <Text style={[styles.compareCol, { color: 'rgba(232,239,233,0.45)' }]}>
              Free
            </Text>
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
                {!b.live && b.premium !== 'Included' && b.premium !== '—' ? (
                  <Text style={[Type.meta, { color: 'rgba(232,239,233,0.4)', fontSize: 10, marginTop: 2 }]}>
                    Coming soon
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  styles.compareCol,
                  Type.meta,
                  { color: 'rgba(232,239,233,0.55)' },
                ]}
              >
                {b.free}
              </Text>
              <Text
                style={[
                  styles.compareCol,
                  Type.meta,
                  {
                    color: b.live ? c.growth : 'rgba(198,212,90,0.55)',
                    fontFamily: Fonts.bodySemi,
                  },
                ]}
              >
                {b.premium}
              </Text>
            </View>
          ))}

          <View style={[styles.liveNote, { borderColor: 'rgba(198,212,90,0.25)' }]}>
            <Text style={[Type.meta, { color: c.growth }]}>Works today</Text>
            <Text
              style={[
                Type.bodySmall,
                { color: 'rgba(232,239,233,0.75)', marginTop: 4 },
              ]}
            >
              Right now Premium only removes the {FREE_PLANT_LIMIT}-plant limit.
              Guides, stats, and family sharing are listed as “Coming soon.”
            </Text>
          </View>

          <PrimaryButton
            label={isPremium ? 'Switch to Free (demo)' : 'Try Premium (demo)'}
            onPress={() => setPremium(!isPremium)}
            style={{ marginTop: 16 }}
          />
          <Text
            style={[
              Type.meta,
              {
                color: 'rgba(232,239,233,0.4)',
                textAlign: 'center',
                marginTop: 10,
              },
            ]}
          >
            Demo toggle — real App Store / Play billing not connected yet
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>About</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {APP_NAME} v{APP_VERSION}{'\n'}
            Photos and data stay on your device.
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
  compareLabel: {
    flex: 1.4,
    paddingRight: 6,
  },
  compareCol: {
    flex: 1,
    textAlign: 'left',
  },
  liveNote: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198,212,90,0.08)',
  },
});
