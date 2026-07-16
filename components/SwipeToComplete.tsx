import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Droplet, Sprout } from 'lucide-react-native';

import { Fonts, Type } from '@/constants/Typography';
import { tapSuccess } from '@/lib/haptics';

/**
 * Swipe a care row rightward to complete it (Planta/Greg-style). The left
 * action panel is revealed on swipe; releasing past threshold fires onComplete
 * and snaps closed.
 */
export function SwipeToComplete({
  children,
  onComplete,
  label,
  type,
  bg,
  fg,
  disabled,
}: {
  children: ReactNode;
  onComplete: () => void;
  label: string;
  type: 'water' | 'fertilize';
  bg: string;
  fg: string;
  disabled?: boolean;
}) {
  const ref = useRef<SwipeableMethods>(null);
  /** willOpen can fire more than once before close settles — guard once. */
  const firedRef = useRef(false);

  // Completing sets `disabled` (busy) on the parent, which unmounts the
  // Swipeable below — killing the close spring, so onSwipeableClose never
  // fires and can't be trusted to clear the guard. firedRef lives on THIS
  // component, which does not unmount, so a stuck `true` would kill the
  // gesture forever on any row whose React key doesn't change (every
  // Upcoming row). Reset when the busy state clears instead.
  useEffect(() => {
    if (!disabled) firedRef.current = false;
  }, [disabled]);

  if (disabled) return <>{children}</>;

  const Icon = type === 'water' ? Droplet : Sprout;

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.8}
      leftThreshold={64}
      overshootLeft={false}
      renderLeftActions={() => (
        <View style={[styles.action, { backgroundColor: bg }]}>
          <Icon color={fg} size={20} strokeWidth={2.4} />
          <Text style={[Type.meta, { color: fg, fontFamily: Fonts.bodySemi, marginTop: 4 }]}>
            {label}
          </Text>
        </View>
      )}
      onSwipeableWillOpen={(direction) => {
        if (direction !== 'left') return;
        // Always snap shut — returning early before close() left the action
        // panel jammed open whenever the guard was set.
        ref.current?.close();
        if (firedRef.current) return;
        firedRef.current = true;
        tapSuccess();
        onComplete();
      }}
      onSwipeableClose={() => {
        firedRef.current = false;
      }}
      containerStyle={styles.container}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, overflow: 'hidden' },
  action: {
    flex: 1,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
