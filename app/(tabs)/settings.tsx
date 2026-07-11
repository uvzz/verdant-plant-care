import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME, APP_VERSION, FREE_PLANT_LIMIT } from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ensureNotificationPermissions } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';
import { getAiProxyUrl } from '@/lib/aiConfig';
import { exportCollectionBackup } from '@/lib/export';
import { pickBackupJsonFile } from '@/lib/backupFile';
import {
  fetchStoreProducts,
  PREMIUM_DISPLAY,
  PREMIUM_PRODUCT_IDS,
  premiumSourceLabel,
  purchasePremium,
  restorePurchases,
  type StoreProductInfo,
} from '@/lib/billing';
import { getCareDueItems } from '@/lib/care';
import { shareCareSheet, shareFamilyInvite } from '@/lib/family';

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
    label: 'Check-before-water calendar',
    free: 'Included',
    premium: 'Included',
    live: true,
  },
  {
    label: 'Family household & care sheets',
    free: 'Included',
    premium: 'Included',
    live: true,
  },
  {
    label: 'AI plant identify + coach',
    free: '—',
    premium: 'Server AI',
    live: true,
  },
  {
    label: 'Export / import backup',
    free: 'Included',
    premium: 'Included',
    live: true,
  },
];

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    plants,
    logs,
    settings,
    setPremium,
    setNotificationsEnabled,
    setHouseholdName,
    addFamilyMember,
    removeFamilyMember,
    importBackup,
    familyMembers,
  } = usePlants();
  const isPremium = settings.isPremium;
  const aiUrl = getAiProxyUrl();
  const [exporting, setExporting] = useState(false);
  const [buying, setBuying] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [householdDraft, setHouseholdDraft] = useState(
    settings.householdName ?? ''
  );
  const [importJson, setImportJson] = useState('');
  const [storeProducts, setStoreProducts] = useState<StoreProductInfo[]>([]);

  useEffect(() => {
    fetchStoreProducts().then(setStoreProducts).catch(() => {});
  }, []);

  const yearlyPrice =
    storeProducts.find((p) => p.id === PREMIUM_PRODUCT_IDS.yearly)?.price ||
    PREMIUM_DISPLAY.yearlyPriceHint;

  const onExport = async () => {
    setExporting(true);
    try {
      const result = await exportCollectionBackup({
        plants,
        logs,
        settings,
        familyMembers,
        householdName: settings.householdName,
      });
      if (!result.ok) {
        Alert.alert('Export failed', result.reason);
        return;
      }
      if (result.path !== 'cancelled') {
        Alert.alert(
          'Backup ready',
          plants.length
            ? `Shared JSON for ${plants.length} plant${plants.length === 1 ? '' : 's'}.`
            : 'Empty collection exported.'
        );
      }
    } finally {
      setExporting(false);
    }
  };

  const onBuy = async () => {
    setBuying(true);
    try {
      const result = await purchasePremium('yearly');
      if (!result.ok) {
        Alert.alert('Purchase unavailable', result.reason);
        return;
      }
      await setPremium(true, {
        source: result.source,
        productId: result.productId ?? PREMIUM_PRODUCT_IDS.yearly,
      });
      Alert.alert(
        'Premium unlocked',
        result.source === 'demo'
          ? 'Development demo unlock. Store products go live with EAS production builds + App Store / Play SKUs.'
          : 'Thank you — Premium is active.'
      );
    } finally {
      setBuying(false);
    }
  };

  const onRestore = async () => {
    const result = await restorePurchases();
    if (!result.ok) {
      Alert.alert('Restore', result.reason);
      return;
    }
    if (result.restored) {
      await setPremium(true, { source: 'restore' });
      Alert.alert('Restored', 'Your Premium purchase was restored.');
    } else {
      Alert.alert(
        'No purchases found',
        'No active Verdant Premium subscription on this store account yet.'
      );
    }
  };

  const onAddMember = async () => {
    if (!memberName.trim()) {
      Alert.alert('Name needed', 'Enter a family member name.');
      return;
    }
    await addFamilyMember(memberName.trim());
    setMemberName('');
  };

  const runImport = async (raw: string, mode: 'merge' | 'replace') => {
    const result = await importBackup(raw.trim(), mode);
    if (!result.ok) {
      Alert.alert('Import failed', result.reason);
      return;
    }
    setImportJson('');
    Alert.alert('Import complete', result.message);
  };

  const onImport = async (mode: 'merge' | 'replace') => {
    if (!importJson.trim()) {
      Alert.alert(
        'No backup text',
        'Pick a JSON file or paste the backup into the field first.'
      );
      return;
    }
    if (mode === 'replace') {
      Alert.alert(
        'Replace collection?',
        'This overwrites plants and care logs on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => runImport(importJson, mode),
          },
        ]
      );
    } else {
      await runImport(importJson, mode);
    }
  };

  const onPickBackupFile = async () => {
    const picked = await pickBackupJsonFile();
    if (!picked.ok) {
      if (!picked.cancelled) Alert.alert('Could not open file', picked.reason);
      return;
    }
    setImportJson(picked.text);
    Alert.alert(
      'Backup loaded',
      `${picked.name} · choose Merge or Replace to apply.`
    );
  };

  const inputStyle = [
    styles.input,
    {
      color: c.text,
      backgroundColor: c.background,
      borderColor: c.border,
      fontFamily: Fonts.body,
    },
  ];

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
            {isPremium ? 'Premium' : 'Free'} ·{' '}
            {premiumSourceLabel(settings.premiumSource)}
          </Text>
          <PrimaryButton
            label={exporting ? 'Exporting…' : 'Export backup (JSON)'}
            variant="secondary"
            onPress={onExport}
            loading={exporting}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Billing */}
        <View style={[styles.card, { backgroundColor: c.night, borderColor: c.night }]}>
          <Text style={[Type.micro, { color: c.growth }]}>Premium</Text>
          <Text style={[Type.displayM, { color: '#EEF3EF', marginTop: 6, fontSize: 22 }]}>
            {isPremium ? 'Premium active' : 'Unlock Premium'}
          </Text>
          <Text
            style={[
              Type.bodySmall,
              { color: 'rgba(232,239,233,0.7)', marginTop: 6, marginBottom: 12 },
            ]}
          >
            Unlimited plants + server AI. Product IDs ready for App Store / Play
            ({PREMIUM_PRODUCT_IDS.yearly}).
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
              <Text
                style={[
                  styles.compareLabel,
                  Type.meta,
                  { color: '#EEF3EF', fontFamily: Fonts.bodyMedium },
                ]}
              >
                {b.label}
              </Text>
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

          {!isPremium ? (
            <>
              <PrimaryButton
                label={`${PREMIUM_DISPLAY.yearlyLabel} · ${yearlyPrice}`}
                onPress={onBuy}
                loading={buying}
                style={{ marginTop: 16 }}
              />
              <PrimaryButton
                label="Restore purchases"
                variant="secondary"
                onPress={onRestore}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <PrimaryButton
              label={
                settings.premiumSource === 'demo'
                  ? 'Switch to Free (demo)'
                  : 'Manage plan in system Settings'
              }
              variant="secondary"
              onPress={() => {
                if (settings.premiumSource === 'demo' || __DEV__) {
                  setPremium(false);
                } else {
                  Alert.alert(
                    'Manage subscription',
                    'Cancel or change Premium in iOS Settings → Apple ID → Subscriptions, or Google Play → Payments & subscriptions.'
                  );
                }
              }}
              style={{ marginTop: 16 }}
            />
          )}
          <Text
            style={[
              Type.meta,
              { color: 'rgba(232,239,233,0.4)', textAlign: 'center', marginTop: 10 },
            ]}
          >
            {__DEV__
              ? 'Dev: purchase uses demo unlock until StoreKit / Play is linked in EAS builds.'
              : 'Purchases process through Apple / Google when store products are live.'}
          </Text>
        </View>

        {/* Family */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>Family sharing</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            Local household — assign caretakers, share care sheets, import backups.
            No cloud account required.
          </Text>
          <Text style={[Type.micro, { color: c.textMuted, marginTop: 12 }]}>
            Household name
          </Text>
          <TextInput
            value={householdDraft}
            onChangeText={setHouseholdDraft}
            onBlur={() => setHouseholdName(householdDraft)}
            placeholder="e.g. Our glasshouse"
            placeholderTextColor={c.textMuted}
            style={[inputStyle, { marginTop: 6 }]}
          />
          <Text style={[Type.micro, { color: c.textMuted, marginTop: 14 }]}>
            Members
          </Text>
          {familyMembers.length === 0 ? (
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 6 }]}>
              No members yet — add partners, roommates, or kids who help water.
            </Text>
          ) : (
            familyMembers.map((m) => (
              <View key={m.id} style={styles.memberRow}>
                <Text style={[Type.bodySmall, { color: c.text, flex: 1 }]}>
                  {m.name}
                  <Text style={{ color: c.textMuted }}> · {m.role}</Text>
                </Text>
                <PrimaryButton
                  label="Remove"
                  variant="ghost"
                  onPress={() =>
                    Alert.alert('Remove member?', m.name, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeFamilyMember(m.id),
                      },
                    ])
                  }
                  style={{ minHeight: 36, paddingHorizontal: 8 }}
                />
              </View>
            ))
          )}
          <View style={styles.memberAdd}>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Name"
              placeholderTextColor={c.textMuted}
              style={[inputStyle, { flex: 1 }]}
            />
            <PrimaryButton label="Add" onPress={onAddMember} style={{ minWidth: 72 }} />
          </View>
          <PrimaryButton
            label="Share care sheet"
            variant="secondary"
            onPress={async () => {
              const due = getCareDueItems(plants, logs);
              const r = await shareCareSheet({
                dueItems: due,
                members: familyMembers,
              });
              if (!r.ok) Alert.alert('Share failed', r.reason);
            }}
            style={{ marginTop: 12 }}
          />
          <PrimaryButton
            label="Invite family (instructions)"
            variant="ghost"
            onPress={() => shareFamilyInvite(settings.householdName || 'our plants')}
            style={{ marginTop: 8 }}
          />
          <Text style={[Type.micro, { color: c.textMuted, marginTop: 16 }]}>
            Import shared backup
          </Text>
          <PrimaryButton
            label="Choose backup file…"
            variant="secondary"
            onPress={onPickBackupFile}
            style={{ marginTop: 8 }}
          />
          <TextInput
            value={importJson}
            onChangeText={setImportJson}
            placeholder="Or paste Verdant backup JSON…"
            placeholderTextColor={c.textMuted}
            multiline
            style={[inputStyle, styles.importBox, { marginTop: 8 }]}
          />
          <View style={styles.memberAdd}>
            <PrimaryButton
              label="Merge"
              variant="secondary"
              onPress={() => onImport('merge')}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Replace"
              variant="secondary"
              onPress={() => onImport('replace')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>AI assistant</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            Premium AI via DeepSeek V4 Flash (server-side OpenRouter key). Photos for ID use a
            vision model.
          </Text>
          <Text style={[Type.meta, { color: c.textMuted, marginTop: 10 }]}>
            Status: {isPremium ? 'Premium · AI unlocked' : 'Free · upgrade for AI'}
            {'\n'}Endpoint: {aiUrl}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[Type.title, { color: c.text }]}>Gentle notifications</Text>
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
                Local reminders to check soil when care is due.
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

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>About</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {APP_NAME} v{APP_VERSION}{'\n'}
            Local-first plant journal · branded icon · EAS-ready builds.
          </Text>
          <PrimaryButton
            label="Privacy policy"
            variant="ghost"
            onPress={() => router.push('/legal/privacy')}
            style={{ marginTop: 10 }}
          />
          <PrimaryButton
            label="Terms of use"
            variant="ghost"
            onPress={() => router.push('/legal/terms')}
          />
          <PrimaryButton
            label="Open privacy (web)"
            variant="ghost"
            onPress={() =>
              Linking.openURL(
                'https://github.com/uvzz/verdant-plant-care/blob/main/docs/legal/PRIVACY.md'
              )
            }
          />
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
  compareLabel: { flex: 1.4, paddingRight: 6 },
  compareCol: { flex: 1, textAlign: 'left' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 42,
  },
  importBox: { minHeight: 90, textAlignVertical: 'top' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  memberAdd: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    alignItems: 'center',
  },
});
