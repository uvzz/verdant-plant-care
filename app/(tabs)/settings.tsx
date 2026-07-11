import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME, APP_VERSION, FREE_PLANT_LIMIT } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ensureNotificationPermissions } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const {
    plants,
    settings,
    setPremium,
    setNotificationsEnabled,
  } = usePlants();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.kicker, { color: c.tint }]}>{APP_NAME}</Text>
        <Text style={[styles.title, { color: c.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Your collection</Text>
          <Text style={[styles.cardBody, { color: c.textMuted }]}>
            {plants.length} plant{plants.length === 1 ? '' : 's'} stored on this device.
            {!settings.isPremium
              ? ` Free plan allows ${FREE_PLANT_LIMIT}.`
              : ' Premium: unlimited plants.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.cardTitle, { color: c.text }]}>Gentle notifications</Text>
              <Text style={[styles.cardBody, { color: c.textMuted }]}>
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

        <View
          style={[
            styles.card,
            {
              backgroundColor: settings.isPremium ? c.night : c.night,
              borderColor: settings.isPremium ? c.night : c.night,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: c.growth }]}>
            {settings.isPremium ? 'Premium active' : 'Verdant Premium'}
          </Text>
          <Text
            style={[
              styles.cardBody,
              {
                color: 'rgba(232,239,233,0.75)',
                marginBottom: 14,
              },
            ]}
          >
            Unlimited plants, deep history, care guides, and family sharing. Billing ships later —
            this toggle unlocks the UI for demos.
          </Text>
          <PrimaryButton
            label={settings.isPremium ? 'Revert to Free (demo)' : 'Unlock Premium'}
            variant="primary"
            onPress={() => setPremium(!settings.isPremium)}
          />
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>About</Text>
          <Text style={[styles.cardBody, { color: c.textMuted }]}>
            {APP_NAME} v{APP_VERSION}{'\n'}
            Multi-niche plant care tracker for iOS & Android.{'\n'}
            Photos and data stay on your device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
});
