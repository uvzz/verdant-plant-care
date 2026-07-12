import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { CareIcon } from '@/components/CareIcon';
import { CARE_TYPE_LABELS, type CareLog } from '@/lib/types';

export function CareLogRow({
  log,
  onDelete,
}: {
  log: CareLog;
  onDelete?: (id: string) => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert('Delete entry?', 'Remove this care log item.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(log.id),
      },
    ]);
  };

  return (
    <Pressable
      onLongPress={onDelete ? confirmDelete : undefined}
      style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View style={[styles.badge, { backgroundColor: c.surfaceAlt }]}>
        <CareIcon type={log.type} color={c.tint} size={17} />
      </View>
      <View style={styles.content}>
        <Text style={[Type.title, { color: c.text, fontSize: 15 }]}>
          {CARE_TYPE_LABELS[log.type] ?? 'Care'}
        </Text>
        <Text style={[Type.meta, { color: c.textMuted }]}>
          {format(parseISO(log.createdAt), 'MMM d · h:mm a')}
        </Text>
        {log.note ? (
          <Text style={[Type.bodySmall, { color: c.text, marginTop: 4 }]} numberOfLines={3}>
            {log.note}
          </Text>
        ) : null}
        {onDelete ? (
          <Text style={[Type.meta, { color: c.textMuted, marginTop: 4, fontSize: 10 }]}>
            Long-press to delete
          </Text>
        ) : null}
      </View>
      {log.photoUri ? (
        <Image source={{ uri: log.photoUri }} style={styles.thumb} contentFit="cover" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
});
