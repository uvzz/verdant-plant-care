import { StyleSheet, Text, View } from 'react-native';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';

import Colors from '@/constants/Colors';
import { careColor } from '@/constants/Palette';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { useI18n } from '@/lib/i18n';
import type { CareLogType } from '@/lib/types';

export interface WeekStripItem {
  date: Date;
  type: CareLogType;
}

/**
 * Horizontal 7-day strip anchoring the care calendar.
 *
 * Each day shows one dot PER KIND of care due that day, in that care's colour
 * — so the week reads as "blue Tuesday, blue+amber Friday" at a glance. Dots
 * are deduplicated by type rather than counted: five waterings on one day is
 * still one errand, and five identical dots would just look like noise.
 */
export function WeekStrip({ due }: { due: WeekStripItem[] }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { t } = useI18n();
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <View style={styles.row} accessibilityLabel={t('calendar.weekStripA11y')}>
      {days.map((day, i) => {
        const isToday = i === 0;
        const onDay = due.filter((d) => isSameDay(d.date, day));
        const dueCount = onDay.length;
        const types = Array.from(new Set(onDay.map((d) => d.type))).slice(0, 3);
        const date = format(day, 'EEEE d');
        const dayA11yLabel =
          dueCount === 0
            ? t('calendar.weekStripDayNone', { date })
            : dueCount === 1
              ? t('calendar.weekStripDayOne', { date })
              : t('calendar.weekStripDayMany', { date, count: dueCount });
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
            accessibilityLabel={dayA11yLabel}
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
            <View style={styles.dotRow}>
              {types.length ? (
                types.map((type) => (
                  <View
                    key={type}
                    style={[
                      styles.dot,
                      {
                        // Today's pill is a dark (light mode) / light (dark
                        // mode) fill, where mid-tone care hues muddy. Swap to
                        // the on-fill colour there so the dots stay visible.
                        backgroundColor: isToday ? c.onEmphasis : careColor(type, scheme),
                      },
                    ]}
                  />
                ))
              ) : (
                <View style={[styles.dot, { backgroundColor: 'transparent' }]} />
              )}
            </View>
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
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 4, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
