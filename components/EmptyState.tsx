import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface Props {
  emoji?: string;
  title: string;
  body: string;
}

export function EmptyState({ emoji = '🌱', title, body }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.orb,
          {
            backgroundColor: c.tint,
            shadowColor: c.tint,
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Text style={[styles.body, { color: c.textMuted }]}>{body}</Text>
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
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
});
