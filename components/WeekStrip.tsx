import { StyleSheet, Text, View } from 'react-native';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Horizontal 7-day strip anchoring the care calendar (Planta-style).
 * Days with due care get a dot: danger if overdue relative to today.
 */
export function WeekStrip({ dueDates }: { dueDates: Date[] }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <View style={styles.row} accessibilityLabel="Next seven days">
      {days.map((day, i) => {
        const isToday = i === 0;
        const dueCount = dueDates.filter((d) => isSameDay(d, day)).length;
        return (
          <View
            key={day.toISOString()}
            style={[
              styles.pill,
              {
                backgroundColor: isToday ? c.emphasis : c.surface,
                borderColor: isToday ? c.emphasis : c.border,
              },
            ]}
            accessibilityLabel={`${format(day, 'EEEE d')}${
              dueCount ? `, ${dueCount} due` : ''
            }`}
          >
            <Text
              style={[
                Type.meta,
                {
                  fontSize: 10,
                  color: isToday ? c.onEmphasis : c.textMuted,
                  fontFamily: Fonts.bodySemi,
                },
              ]}
            >
              {format(day, 'EEEEE')}
            </Text>
            <Text
              style={[
                Type.title,
                {
                  fontSize: 15,
                  marginTop: 2,
                  color: isToday ? c.onEmphasis : c.text,
                },
              ]}
            >
              {format(day, 'd')}
            </Text>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: dueCount
                    ? isToday
                      ? c.growth
                      : c.tint
                    : 'transparent',
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 12 },
  pill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
});
