import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sprout } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';

interface Props {
  /** Lucide icon element, sized ~36 and coloured for the tinted orb. */
  icon?: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={[styles.orb, { backgroundColor: c.tint, shadowColor: c.tint }]}>
        {icon ?? <Sprout color="#FFFFFF" size={36} strokeWidth={1.8} />}
      </View>
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
            { backgroundColor: c.growth, opacity: pressed ? 0.9 : 1 },
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
  },
});
