import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { HeroOrigin } from '@/lib/heroTransition';

/**
 * Renders a photo overlay that rises from the tapped card's rect (window
 * coordinates) up into the detail hero, then fades out to reveal the real
 * hero underneath. Forward-only; unmounts itself via onDone.
 */
export function HeroTransitionOverlay({
  origin,
  targetWidth,
  targetHeight,
  onDone,
}: {
  origin: HeroOrigin;
  targetWidth: number;
  targetHeight: number;
  onDone: () => void;
}) {
  const x = useSharedValue(origin.x);
  const y = useSharedValue(origin.y);
  const w = useSharedValue(origin.width);
  const h = useSharedValue(origin.height);
  const radius = useSharedValue(origin.radius);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const D = 340;
    const ease = Easing.out(Easing.cubic);
    x.value = withTiming(0, { duration: D, easing: ease });
    y.value = withTiming(0, { duration: D, easing: ease });
    w.value = withTiming(targetWidth, { duration: D, easing: ease });
    h.value = withTiming(targetHeight, { duration: D, easing: ease });
    radius.value = withTiming(0, { duration: D, easing: ease });
    // Hold on the hero, then cross-fade to the real one and unmount.
    opacity.value = withDelay(
      D,
      withTiming(0, { duration: 110 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
    borderRadius: radius.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, style]}>
      <Image
        source={{ uri: origin.uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 100,
    backgroundColor: '#0f1612',
  },
});
