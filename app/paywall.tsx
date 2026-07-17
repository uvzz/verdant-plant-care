import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  CloudUpload,
  Infinity as InfinityIcon,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react-native';

import Colors, { FREE_PLANT_LIMIT } from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { usePlants } from '@/lib/PlantContext';
import { useI18n } from '@/lib/i18n';
import { tapLight, tapSuccess } from '@/lib/haptics';
import {
  fetchStoreProducts,
  PREMIUM_DISPLAY,
  PREMIUM_HAS_TRIAL,
  PREMIUM_PRODUCT_IDS,
  purchasePremium,
  restorePurchases,
  type StoreProductInfo,
} from '@/lib/billing';

/** Optional `reason` param tailors the sub-headline to where the user came from. */
type Reason = 'limit' | 'ai' | 'sync' | 'insights';

export default function PaywallScreen() {
  // Always dark — a focused, premium moment regardless of system scheme.
  const c = Colors.dark;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { setPremium } = usePlants();
  const { reason } = useLocalSearchParams<{ reason?: Reason }>();

  const [buying, setBuying] = useState<null | 'yearly' | 'lifetime'>(null);
  const [products, setProducts] = useState<StoreProductInfo[]>([]);

  useEffect(() => {
    fetchStoreProducts().then(setProducts).catch(() => {});
  }, []);

  const priceFor = (which: 'yearly' | 'lifetime', fallback: string) =>
    products.find((p) => p.id === PREMIUM_PRODUCT_IDS[which])?.price || fallback;
  const yearlyPrice = priceFor('yearly', PREMIUM_DISPLAY.yearlyPriceHint);
  const lifetimePrice = priceFor('lifetime', PREMIUM_DISPLAY.lifetimePriceHint);

  const close = () => router.back();

  const reasonLine =
    reason === 'limit'
      ? t('paywall.reasonLimit', { limit: FREE_PLANT_LIMIT })
      : reason === 'ai'
        ? t('paywall.reasonAi')
        : reason === 'sync'
          ? t('paywall.reasonSync')
          : reason === 'insights'
            ? t('paywall.reasonInsights')
            : t('paywall.subtitle');

  const buy = async (which: 'yearly' | 'lifetime') => {
    tapLight();
    setBuying(which);
    try {
      const result = await purchasePremium(which);
      if (!result.ok) {
        if (!result.cancelled) {
          // Surface the store reason without leaving the paywall.
          Alert.alert(t('paywall.unavailableTitle'), result.reason);
        }
        return;
      }
      await setPremium(true, {
        source: result.source,
        productId: result.productId ?? PREMIUM_PRODUCT_IDS[which],
      });
      tapSuccess();
      Alert.alert(
        t('paywall.unlockedTitle'),
        result.source === 'demo'
          ? t('paywall.unlockedDemo')
          : t('paywall.unlockedBody')
      );
      close();
    } finally {
      setBuying(null);
    }
  };

  const onRestore = async () => {
    const result = await restorePurchases();
    if (result.ok && result.restored) {
      await setPremium(true, { source: 'restore' });
      Alert.alert(t('paywall.restoredTitle'), t('paywall.restoredBody'));
      close();
    } else {
      Alert.alert(t('paywall.noPurchasesTitle'), t('paywall.noPurchasesBody'));
    }
  };

  const benefits = [
    {
      icon: <InfinityIcon color={c.growth} size={20} strokeWidth={2.2} />,
      title: t('paywall.benefitUnlimited'),
      body: t('paywall.benefitUnlimitedBody'),
    },
    {
      icon: <Sparkles color={c.growth} size={20} strokeWidth={2.2} />,
      title: t('paywall.benefitAi'),
      body: t('paywall.benefitAiBody'),
    },
    {
      icon: <CloudUpload color={c.growth} size={20} strokeWidth={2.2} />,
      title: t('paywall.benefitSync'),
      body: t('paywall.benefitSyncBody'),
    },
    {
      icon: <TrendingUp color={c.growth} size={20} strokeWidth={2.2} />,
      title: t('paywall.benefitInsights'),
      body: t('paywall.benefitInsightsBody'),
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.orbA, { backgroundColor: c.growth }]} />
      <View style={[styles.orbB, { backgroundColor: c.tint }]} />

      <Pressable
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={12}
        style={[styles.close, { top: insets.top + 8 }]}
      >
        <X color="rgba(238,243,239,0.8)" size={22} strokeWidth={2.2} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={[Type.micro, { color: c.growth, marginTop: 24 }]}
        >
          {t('paywall.eyebrow')}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(80).duration(500)}
          style={[Type.displayHero, { color: '#F3F7F2', fontSize: 40, marginTop: 10 }]}
        >
          {t('paywall.title')}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(160).duration(500)}
          style={[Type.body, { color: '#AEBBB2', marginTop: 14, maxWidth: 320 }]}
        >
          {reasonLine}
        </Animated.Text>

        <View style={styles.benefits}>
          {benefits.map((b, i) => (
            <Animated.View
              key={b.title}
              entering={FadeInDown.delay(220 + i * 70).duration(500)}
              style={styles.benefit}
            >
              <View style={styles.benefitIcon}>{b.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={[Type.title, { color: '#EEF3EF', fontSize: 16 }]}>
                  {b.title}
                </Text>
                <Text style={[Type.bodySmall, { color: '#9FB0A5', marginTop: 2 }]}>
                  {b.body}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Plans pinned to the bottom */}
      <View style={[styles.plans, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={() => buy('yearly')}
          disabled={buying !== null}
          style={({ pressed }) => [
            styles.yearly,
            {
              backgroundColor: c.growth,
              opacity: buying !== null ? 0.6 : pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          {PREMIUM_HAS_TRIAL ? (
            <>
              <Text style={[Type.button, { color: c.growthInk }]}>
                {buying === 'yearly' ? '…' : t('paywall.yearlyTrialCta')}
              </Text>
              <Text style={[Type.meta, { color: c.growthInk, opacity: 0.75, marginTop: 2 }]}>
                {t('paywall.yearlyTrialSub', { price: yearlyPrice })}
              </Text>
            </>
          ) : (
            <Text style={[Type.button, { color: c.growthInk }]}>
              {buying === 'yearly'
                ? '…'
                : t('paywall.yearlyCta', { price: yearlyPrice })}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => buy('lifetime')}
          disabled={buying !== null}
          style={({ pressed }) => [
            styles.lifetime,
            { borderColor: 'rgba(255,255,255,0.2)', opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[Type.button, { color: '#EEF3EF', fontSize: 15 }]}>
            {buying === 'lifetime'
              ? '…'
              : t('paywall.lifetimeCta', { price: lifetimePrice })}
          </Text>
        </Pressable>

        <Pressable onPress={onRestore} hitSlop={8} style={styles.restore}>
          <Text style={[Type.meta, { color: '#8A998F' }]}>{t('paywall.restore')}</Text>
        </Pressable>
        <Text style={[Type.meta, { color: '#6B7A70', textAlign: 'center', fontSize: 10 }]}>
          {t('paywall.legal')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1612', overflow: 'hidden' },
  orbA: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -70,
    right: -70,
    opacity: 0.18,
  },
  orbB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 180,
    left: -70,
    opacity: 0.16,
  },
  close: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scroll: { paddingHorizontal: 24 },
  benefits: { marginTop: 30, gap: 18 },
  benefit: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(198,212,90,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plans: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  yearly: {
    minHeight: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifetime: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  restore: { alignItems: 'center', paddingVertical: 8 },
});
