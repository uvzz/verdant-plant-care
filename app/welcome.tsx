import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME } from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { setOnboardingDone } from '@/lib/onboarding';

export default function WelcomeScreen() {
  // Welcome is a fixed night-mode hero (dark #0F1612 backdrop) regardless of
  // system scheme — use the dark palette so accents stay legible on it.
  const c = Colors.dark;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const finish = async (goAdd: boolean) => {
    await setOnboardingDone();
    if (goAdd) {
      router.replace('/(tabs)');
      setTimeout(() => router.push('/plant/add'), 80);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      {/* Ambient orbs */}
      <View style={[styles.orbA, { backgroundColor: c.growth }]} />
      <View style={[styles.orbB, { backgroundColor: c.tint }]} />

      <Text style={[Type.micro, styles.mark, { color: c.growth }]}>{APP_NAME}</Text>
      <Text style={[Type.displayHero, styles.headline, { color: '#EEF3EF' }]}>
        Care you can{'\n'}see grow.
      </Text>
      <Text style={[Type.body, styles.sub, { color: '#A8B5AE' }]}>
        A local-first plant journal that asks you to check soil before watering —
        not blind schedules. Photos stay on your phone. Premium AI never puts an
        API key on your device.
      </Text>

      <View style={styles.preview}>
        <View style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={[Type.title, { color: '#EEF3EF', fontFamily: 'Fraunces_600SemiBold', fontSize: 16 }]}>
            Moonlight
          </Text>
          <Text style={[Type.latin, { color: '#A8B5AE', marginTop: 2 }]}>
            Philodendron hederaceum
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => finish(true)}
          style={({ pressed }) => [
            styles.btnPrimary,
            { backgroundColor: c.growth, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[Type.button, { color: c.growthInk }]}>Start your collection</Text>
        </Pressable>
        <Pressable
          onPress={() => finish(false)}
          style={({ pressed }) => [
            styles.btnGhost,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[Type.button, { color: '#A8B5AE', fontSize: 15 }]}>
            I already have plants
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1612',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
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
  mark: {
    marginTop: 12,
  },
  headline: {
    marginTop: 16,
  },
  sub: {
    marginTop: 12,
    maxWidth: 280,
  },
  preview: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#3D5C48',
  },
  actions: {
    marginTop: 'auto',
    gap: 10,
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
});
