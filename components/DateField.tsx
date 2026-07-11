import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, isValid } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';

function parseDate(value: string): Date {
  try {
    const d = parseISO(value);
    if (isValid(d)) return d;
  } catch {
    /* fallthrough */
  }
  return new Date();
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [open, setOpen] = useState(false);
  const date = parseDate(value);

  return (
    <View style={styles.wrap}>
      <Text style={[Type.micro, { color: c.textMuted, letterSpacing: 0.8 }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <Text style={[Type.body, { color: c.text, fontFamily: Fonts.body }]}>
          {format(date, 'MMM d, yyyy')}
        </Text>
        <Text style={{ color: c.textMuted }}>📅</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            if (Platform.OS === 'android') setOpen(false);
            if (selected) onChange(format(selected, 'yyyy-MM-dd'));
          }}
          themeVariant={scheme === 'dark' ? 'dark' : 'light'}
        />
      ) : null}
      {open && Platform.OS === 'ios' ? (
        <Pressable onPress={() => setOpen(false)} style={styles.done}>
          <Text style={[Type.meta, { color: c.tint, fontFamily: Fonts.bodySemi }]}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 6 },
  field: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  done: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 4 },
});
