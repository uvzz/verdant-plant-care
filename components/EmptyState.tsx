import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
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
      <View style={[styles.orb, { backgroundColor: c.tint, shadowColor: c.tint }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[Type.displayM, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[Type.bodySmall, { color: c.textMuted, textAlign: 'center', maxWidth: 280 }]}>
        {body}
      </Text>
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
  emoji: { fontSize: 36 },
});
