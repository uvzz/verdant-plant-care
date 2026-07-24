import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import Colors, { APP_NAME, APP_VERSION, FREE_PLANT_LIMIT } from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ensureNotificationPermissions } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';
import { useI18n } from '@/lib/i18n';
import { getAiProxyUrl } from '@/lib/aiConfig';
import { CloudSyncCard } from '@/components/CloudSyncCard';
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
};

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage, languages } = useI18n();

  const benefits: Benefit[] = [
    {
      label: t('settings.benefitPlants'),
      free: t('settings.valueUpTo', { limit: FREE_PLANT_LIMIT }),
      premium: t('settings.valueUnlimited'),
    },
    {
      label: t('settings.benefitCalendar'),
      free: t('settings.valueIncluded'),
      premium: t('settings.valueIncluded'),
    },
    {
      label: t('settings.benefitFamily'),
      free: t('settings.valueIncluded'),
      premium: t('settings.valueIncluded'),
    },
    {
      label: t('settings.benefitAi'),
      free: t('settings.valueNone'),
      premium: t('settings.valueServerAi'),
    },
    {
      label: t('settings.benefitSync'),
      free: t('settings.valueNone'),
      premium: t('settings.valueAutomatic'),
    },
  ];
  const {
    plants,
    logs,
    settings,
    setPremium,
    setNotificationsEnabled,
    setHouseholdName,
    addFamilyMember,
    removeFamilyMember,
    familyMembers,
  } = usePlants();
  const isPremium = settings.isPremium;
  const aiUrl = getAiProxyUrl();
  const [buying, setBuying] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [householdDraft, setHouseholdDraft] = useState(
    settings.householdName ?? ''
  );
  const [storeProducts, setStoreProducts] = useState<StoreProductInfo[]>([]);

  useEffect(() => {
    fetchStoreProducts().then(setStoreProducts).catch(() => {});
  }, []);

  // Keep draft in sync when settings hydrate from storage
  useEffect(() => {
    setHouseholdDraft(settings.householdName ?? '');
  }, [settings.householdName]);

  const yearlyPrice =
    storeProducts.find((p) => p.id === PREMIUM_PRODUCT_IDS.yearly)?.price ||
    PREMIUM_DISPLAY.yearlyPriceHint;

  const onBuy = async () => {
    setBuying(true);
    try {
      const result = await purchasePremium('yearly');
      if (!result.ok) {
        Alert.alert(t('settings.purchaseUnavailable'), result.reason);
        return;
      }
      await setPremium(true, {
        source: result.source,
        productId: result.productId ?? PREMIUM_PRODUCT_IDS.yearly,
      });
      Alert.alert(
        t('settings.premiumUnlockedTitle'),
        result.source === 'demo'
          ? t('settings.premiumUnlockedDemo')
          : t('settings.premiumUnlockedThanks')
      );
    } finally {
      setBuying(false);
    }
  };

  const onRestore = async () => {
    const result = await restorePurchases();
    if (!result.ok) {
      Alert.alert(t('settings.restoreTitle'), result.reason);
      return;
    }
    if (result.restored) {
      await setPremium(true, { source: 'restore' });
      Alert.alert(t('settings.restoredTitle'), t('settings.restoredBody'));
    } else {
      Alert.alert(
        t('settings.noPurchasesTitle'),
        t('settings.noPurchasesBody')
      );
    }
  };

  const onAddMember = async () => {
    if (!memberName.trim()) {
      Alert.alert(t('settings.nameNeededTitle'), t('settings.nameNeededBody'));
      return;
    }
    await addFamilyMember(memberName.trim());
    setMemberName('');
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
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>{t('settings.collectionTitle')}</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {t('settings.collectionSummary', {
              count: plants.length,
              limit: isPremium ? '∞' : FREE_PLANT_LIMIT,
              tier: isPremium ? t('settings.tierPremium') : t('settings.tierFree'),
              source: premiumSourceLabel(settings.premiumSource),
            })}
          </Text>
        </View>

        {/* Billing */}
        <View style={[styles.card, { backgroundColor: c.heroSurface, borderColor: c.heroSurface }]}>
          <Text style={[Type.micro, { color: c.growth }]}>{t('settings.premiumBadge')}</Text>
          <Text style={[Type.displayM, { color: '#EEF3EF', marginTop: 6, fontSize: 22 }]}>
            {isPremium ? t('settings.premiumActive') : t('settings.premiumUnlock')}
          </Text>
          <Text
            style={[
              Type.bodySmall,
              { color: 'rgba(232,239,233,0.7)', marginTop: 6, marginBottom: 12 },
            ]}
          >
            {t('settings.premiumBlurb', { productId: PREMIUM_PRODUCT_IDS.yearly })}
          </Text>

          <View style={styles.compareHeader}>
            <Text style={[styles.compareLabel, { color: 'rgba(232,239,233,0.45)' }]}>
              {t('settings.colFeature')}
            </Text>
            <Text style={[styles.compareCol, { color: 'rgba(232,239,233,0.45)' }]}>
              {t('settings.colFree')}
            </Text>
            <Text style={[styles.compareCol, { color: c.growth }]}>
              {t('settings.colPremium')}
            </Text>
          </View>
          {benefits.map((b, i) => (
            <View
              key={b.label}
              style={[
                styles.compareRow,
                i < benefits.length - 1 && {
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
                label={t('settings.buyYearlyCta', { price: yearlyPrice })}
                onPress={onBuy}
                loading={buying}
                style={{ marginTop: 16 }}
              />
              <PrimaryButton
                label={t('settings.restore')}
                variant="secondary"
                onPress={onRestore}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <PrimaryButton
              label={
                settings.premiumSource === 'demo'
                  ? t('settings.switchFreeDemo')
                  : t('settings.managePlan')
              }
              variant="secondary"
              onPress={() => {
                if (settings.premiumSource === 'demo' || __DEV__) {
                  setPremium(false);
                } else {
                  Alert.alert(
                    t('settings.manageSubTitle'),
                    t('settings.manageSubBody')
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
              ? t('settings.storeFootnoteDev')
              : t('settings.storeFootnoteProd')}
          </Text>
        </View>

        {/* Family */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>{t('settings.familyTitle')}</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {t('settings.familyBlurb')}
          </Text>
          <Text style={[Type.micro, { color: c.textMuted, marginTop: 12 }]}>
            {t('settings.householdName')}
          </Text>
          <TextInput
            value={householdDraft}
            onChangeText={setHouseholdDraft}
            onBlur={() => setHouseholdName(householdDraft)}
            placeholder={t('settings.householdPlaceholder')}
            placeholderTextColor={c.textMuted}
            style={[inputStyle, { marginTop: 6 }]}
          />
          <Text style={[Type.micro, { color: c.textMuted, marginTop: 14 }]}>
            {t('settings.members')}
          </Text>
          {familyMembers.length === 0 ? (
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 6 }]}>
              {t('settings.membersEmpty')}
            </Text>
          ) : (
            familyMembers.map((m) => (
              <View key={m.id} style={styles.memberRow}>
                <Text style={[Type.bodySmall, { color: c.text, flex: 1 }]}>
                  {m.name}
                  <Text style={{ color: c.textMuted }}>
                    {' · '}
                    {m.role === 'owner'
                      ? t('settings.roleOwner')
                      : t('settings.roleMember')}
                  </Text>
                </Text>
                <PrimaryButton
                  label={t('settings.remove')}
                  variant="ghost"
                  onPress={() =>
                    Alert.alert(t('settings.removeMemberTitle'), m.name, [
                      { text: t('settings.cancel'), style: 'cancel' },
                      {
                        text: t('settings.remove'),
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
              placeholder={t('settings.namePlaceholder')}
              placeholderTextColor={c.textMuted}
              style={[inputStyle, { flex: 1 }]}
            />
            <PrimaryButton label={t('settings.add')} onPress={onAddMember} style={{ minWidth: 72 }} />
          </View>
          <PrimaryButton
            label={t('settings.shareCareSheet')}
            variant="secondary"
            onPress={async () => {
              const due = getCareDueItems(plants, logs);
              const r = await shareCareSheet({
                dueItems: due,
                members: familyMembers,
              });
              if (!r.ok) Alert.alert(t('settings.shareFailed'), r.reason);
            }}
            style={{ marginTop: 12 }}
          />
          <PrimaryButton
            label={t('settings.inviteFamily')}
            variant="ghost"
            onPress={() => shareFamilyInvite(settings.householdName || 'our plants')}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>{t('settings.aiTitle')}</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {t('settings.aiBlurb')}
          </Text>
          <Text style={[Type.meta, { color: c.textMuted, marginTop: 10 }]}>
            {isPremium ? t('settings.aiStatusPremium') : t('settings.aiStatusFree')}
            {__DEV__ ? `\n${t('settings.aiEndpoint', { url: aiUrl })}` : ''}
          </Text>
        </View>

        {/* Backup & sync — Apple/Google sign-in, automatic sync */}
        <CloudSyncCard />

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[Type.title, { color: c.text }]}>{t('settings.notificationsTitle')}</Text>
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
                {t('settings.notificationsBlurb')}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={async (v) => {
                if (v) {
                  const ok = await ensureNotificationPermissions();
                  if (!ok) {
                    Alert.alert(
                      t('settings.notificationsDisabledTitle'),
                      t('settings.notificationsDisabledBody')
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
          <Text style={[Type.title, { color: c.text }]}>{t('settings.languageTitle')}</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4, marginBottom: 6 }]}>
            {t('settings.languageBlurb')}
          </Text>
          {languages.map((lang, i) => {
            const selected = lang.code === language;
            return (
              <Pressable
                key={lang.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.languageRow,
                  i < languages.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      Type.bodySmall,
                      {
                        color: c.text,
                        fontFamily: selected ? Fonts.bodySemi : Fonts.body,
                      },
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                  {lang.nativeName !== lang.englishName && (
                    <Text style={[Type.meta, { color: c.textMuted, marginTop: 1 }]}>
                      {lang.englishName}
                    </Text>
                  )}
                </View>
                {selected && <Check color={c.tint} size={18} strokeWidth={2.4} />}
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[Type.title, { color: c.text }]}>{t('settings.aboutTitle')}</Text>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
            {t('settings.aboutBody', { appName: APP_NAME, version: APP_VERSION })}
          </Text>
          <PrimaryButton
            label={t('settings.privacyPolicy')}
            variant="ghost"
            onPress={() => router.push('/legal/privacy')}
            style={{ marginTop: 10 }}
          />
          <PrimaryButton
            label={t('settings.termsOfUse')}
            variant="ghost"
            onPress={() => router.push('/legal/terms')}
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
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
});
