import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { gradientPair, lighten } from '@/constants/Palette';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';

interface Props {
  /** Lucide icon element, sized ~36 and coloured for the tinted orb. */
  icon?: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Accent for the orb. Defaults to the brand lichen tint. */
  hue?: string;
}

export function EmptyState({ icon, title, body, actionLabel, onAction, hue }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const accent = hue ?? c.tint;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {/* A lit orb rather than a flat disc: the gradient runs light -> hue on
          the diagonal, and the glow picks up the accent so empty screens feel
          like a held breath instead of a dead end. */}
      <LinearGradient
        colors={gradientPair(accent, scheme)}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.orb, { shadowColor: accent }]}
      >
        {icon ?? <Sprout color="#FFFFFF" size={36} strokeWidth={1.8} />}
      </LinearGradient>
      <Text style={[Type.displayM, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[Type.bodySmall, { color: c.textMuted, textAlign: 'center', maxWidth: 300 }]}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: c.growth,
              opacity: pressed ? 0.9 : 1,
              shadowColor: lighten(c.growth, 0.1),
            },
          ]}
        >
          <Text style={[Type.button, { color: c.growthInk }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 8,
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  cta: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },
});
