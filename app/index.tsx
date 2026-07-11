import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { isOnboardingDone } from '@/lib/onboarding';

/** Entry gate: welcome once, then main tabs */
export default function IndexGate() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    isOnboardingDone().then((v) => {
      setDone(v);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.night }}>
        <ActivityIndicator color={c.growth} />
      </View>
    );
  }

  if (!done) return <Redirect href="/welcome" />;
  return <Redirect href="/(tabs)" />;
}
