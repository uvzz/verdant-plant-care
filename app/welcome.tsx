import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Droplet, Leaf, Lock, Sparkles } from 'lucide-react-native';

import Colors, { APP_NAME } from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { setOnboardingDone } from '@/lib/onboarding';
import { tapLight } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Fixed night-mode hero regardless of system scheme — use the dark palette.
  const c = Colors.dark;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    if (p !== page) {
      tapLight();
      setPage(p);
    }
  };

  const goToPrivacy = () => {
    scrollRef.current?.scrollTo({ x: width, animated: true });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.orbA, { backgroundColor: c.growth }]} />
      <View style={[styles.orbB, { backgroundColor: c.tint }]} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.flex}
      >
        <ValuePane c={c} onContinue={goToPrivacy} />
        <PrivacyPane c={c} />
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? c.growth : 'rgba(255,255,255,0.25)',
                width: i === page ? 22 : 7,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function ValuePane({
  c,
  onContinue,
}: {
  c: (typeof Colors)['dark'];
  onContinue: () => void;
}) {
  const { t } = useI18n();
  return (
    <View style={styles.pane}>
      <Animated.Text entering={FadeIn.duration(400)} style={[Type.micro, styles.mark, { color: c.growth }]}>
        {APP_NAME}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(80).duration(500)}
        style={[Type.displayHero, styles.headline, { color: '#EEF3EF' }]}
      >
        {t('welcome.valueHeadline')}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(180).duration(500)}
        style={[Type.body, styles.sub, { color: '#A8B5AE' }]}
      >
        {t('welcome.valueSub')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(280).duration(500)} style={[styles.preview, { borderColor: 'rgba(255,255,255,0.1)' }]}>
        <LinearGradient
          colors={['#3D5C48', '#22352A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumb}
        >
          <Leaf color={c.growth} size={26} strokeWidth={1.8} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[Type.title, { color: '#EEF3EF', fontFamily: 'Fraunces_600SemiBold', fontSize: 16 }]}>
            Moonlight
          </Text>
          <Text style={[Type.latin, { color: '#A8B5AE', marginTop: 2 }]}>
            Philodendron hederaceum
          </Text>
          <View style={styles.previewMeta}>
            <Droplet color={c.growth} size={12} strokeWidth={2.4} />
            <Text style={[Type.meta, { color: '#A8B5AE', fontSize: 11 }]}>
              {t('welcome.previewWater')}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [
          styles.btnPrimary,
          { backgroundColor: c.growth, opacity: pressed ? 0.9 : 1, marginTop: 'auto' },
        ]}
      >
        <Text style={[Type.button, { color: c.growthInk }]}>{t('welcome.continue')}</Text>
      </Pressable>
    </View>
  );
}

function PrivacyPane({ c }: { c: (typeof Colors)['dark'] }) {
  const router = useRouter();
  const { t } = useI18n();

  const finish = async (goAdd: boolean) => {
    await setOnboardingDone();
    router.replace('/(tabs)');
    if (goAdd) setTimeout(() => router.push('/plant/add'), 80);
  };

  // Finish onboarding and land on Settings, where sign-in / backup lives.
  const finishToSettings = async () => {
    await setOnboardingDone();
    router.replace('/(tabs)');
    setTimeout(() => router.push('/(tabs)/settings'), 80);
  };

  return (
    <View style={styles.pane}>
      <Text style={[Type.micro, styles.mark, { color: c.growth }]}>{t('welcome.privacyMark')}</Text>
      <Text style={[Type.displayHero, styles.headline, { color: '#EEF3EF', fontSize: 40 }]}>
        {t('welcome.privacyHeadline')}
      </Text>

      <View style={styles.features}>
        <Feature
          icon={<Leaf color={c.growth} size={18} strokeWidth={2.2} />}
          title={t('welcome.offlineTitle')}
          body={t('welcome.offlineBody')}
          c={c}
        />
        <Feature
          icon={<Lock color={c.growth} size={18} strokeWidth={2.2} />}
          title={t('welcome.syncTitle')}
          body={t('welcome.syncBody')}
          c={c}
        />
        <Feature
          icon={<Sparkles color={c.growth} size={18} strokeWidth={2.2} />}
          title={t('welcome.aiTitle')}
          body={t('welcome.aiBody')}
          c={c}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => finish(true)}
          style={({ pressed }) => [
            styles.btnPrimary,
            { backgroundColor: c.growth, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[Type.button, { color: c.growthInk }]}>{t('welcome.startCollection')}</Text>
        </Pressable>
        <Pressable
          onPress={finishToSettings}
          style={({ pressed }) => [styles.signInRow, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Lock color={c.growth} size={14} strokeWidth={2.4} />
          <Text style={[Type.button, { color: c.growth, fontSize: 15 }]}>
            {t('welcome.signInSync')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => finish(false)}
          style={({ pressed }) => [styles.btnGhost, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[Type.button, { color: '#A8B5AE', fontSize: 15 }]}>
            {t('welcome.haveePlants')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Feature({
  icon,
  title,
  body,
  c,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  c: (typeof Colors)['dark'];
}) {
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: 'rgba(198,212,90,0.12)' }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[Type.title, { color: '#EEF3EF', fontSize: 15 }]}>{title}</Text>
        <Text style={[Type.bodySmall, { color: '#A8B5AE', marginTop: 2 }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1612', overflow: 'hidden' },
  flex: { flex: 1 },
  pane: { width, flex: 1, paddingHorizontal: 20 },
  orbA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -40,
    right: -60,
    opacity: 0.28,
  },
  orbB: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 160,
    left: -50,
    opacity: 0.35,
  },
  mark: { marginTop: 12 },
  headline: { marginTop: 16 },
  sub: { marginTop: 12, maxWidth: 300 },
  preview: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  features: { marginTop: 28, gap: 18 },
  feature: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { marginTop: 'auto', gap: 10 },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 44,
  },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dot: { height: 7, borderRadius: 4 },
});
