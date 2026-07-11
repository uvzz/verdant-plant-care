import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { CARE_TYPE_EMOJI, CARE_TYPE_LABELS, type CareLog } from '@/lib/types';

export function CareLogRow({ log }: { log: CareLog }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.badge, { backgroundColor: c.surfaceAlt }]}>
        <Text style={styles.emoji}>{CARE_TYPE_EMOJI[log.type]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>
          {CARE_TYPE_LABELS[log.type]}
        </Text>
        <Text style={[styles.date, { color: c.textMuted }]}>
          {format(parseISO(log.createdAt), 'MMM d, yyyy · h:mm a')}
        </Text>
        {log.note ? (
          <Text style={[styles.note, { color: c.text }]} numberOfLines={3}>
            {log.note}
          </Text>
        ) : null}
      </View>
      {log.photoUri ? (
        <Image source={{ uri: log.photoUri }} style={styles.thumb} contentFit="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
});
