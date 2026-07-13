import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/** Pulsing placeholder block. Compose into card/list-shaped loaders. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
  }, [pulse]);

  const animated = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: c.surfaceAlt },
        animated,
        style,
      ]}
    />
  );
}

/** Grid-card shaped skeleton for the plants screen while hydrating. */
export function PlantCardSkeleton() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Skeleton height={150} radius={0} />
      <View style={styles.cardBody}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={10} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={10} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/** Paragraph-shaped skeleton for AI answers being written. */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: 8, marginTop: 12 }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? '55%' : '100%'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flex: 1,
  },
  cardBody: { padding: 12 },
});
