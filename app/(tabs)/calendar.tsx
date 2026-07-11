import React, { useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { EmptyState } from '@/components/EmptyState';
import { formatRelativeCare, getCareDueItems } from '@/lib/care';
import { scheduleGentleReminders } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';

export default function CalendarScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants, logs, settings } = usePlants();

  const dueItems = useMemo(() => getCareDueItems(plants, logs), [plants, logs]);

  const overdue = dueItems.filter((d) => d.overdue);
  const today = dueItems.filter((d) => d.daysUntil === 0);
  const upcoming = dueItems.filter((d) => d.daysUntil > 0).slice(0, 20);

  useEffect(() => {
    scheduleGentleReminders(dueItems, settings.notificationsEnabled).catch(
      () => {}
    );
  }, [dueItems, settings.notificationsEnabled]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.kicker, { color: c.tint }]}>Care calendar</Text>
        <Text style={[styles.title, { color: c.text }]}>Gentle reminders</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Soft nudges based on each plant’s watering and feeding rhythm.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plants.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Nothing scheduled yet"
            body="Add plants with water and fertilize intervals to build a calm care calendar."
          />
        ) : (
          <>
            <Section title="Overdue" color={c.danger} emptyLabel="You're all caught up">
              {overdue.map((item) => (
                <CareRow
                  key={`${item.plant.id}-${item.type}-overdue`}
                  title={item.plant.name}
                  meta={`${item.type === 'water' ? '💧 Water' : '🌿 Fertilize'} · ${formatRelativeCare(item.daysUntil)}`}
                  date={format(item.dueDate, 'MMM d')}
                  tint={c.danger}
                  surface={c.surface}
                  border={c.border}
                  text={c.text}
                  muted={c.textMuted}
                  onPress={() =>
                    router.push({
                      pathname: '/plant/log',
                      params: { plantId: item.plant.id, type: item.type },
                    })
                  }
                />
              ))}
            </Section>

            <Section title="Today" color={c.tint} emptyLabel="No care due today">
              {today.map((item) => (
                <CareRow
                  key={`${item.plant.id}-${item.type}-today`}
                  title={item.plant.name}
                  meta={`${item.type === 'water' ? '💧 Water' : '🌿 Fertilize'} · Due today`}
                  date={format(item.dueDate, 'MMM d')}
                  tint={c.tint}
                  surface={c.surface}
                  border={c.border}
                  text={c.text}
                  muted={c.textMuted}
                  onPress={() =>
                    router.push({
                      pathname: '/plant/log',
                      params: { plantId: item.plant.id, type: item.type },
                    })
                  }
                />
              ))}
            </Section>

            <Section title="Upcoming" color={c.sky} emptyLabel="No upcoming care">
              {upcoming.map((item) => (
                <CareRow
                  key={`${item.plant.id}-${item.type}-up`}
                  title={item.plant.name}
                  meta={`${item.type === 'water' ? '💧 Water' : '🌿 Fertilize'} · ${formatRelativeCare(item.daysUntil)}`}
                  date={format(item.dueDate, 'MMM d')}
                  tint={c.sky}
                  surface={c.surface}
                  border={c.border}
                  text={c.text}
                  muted={c.textMuted}
                  onPress={() =>
                    router.push({
                      pathname: '/plant/log',
                      params: { plantId: item.plant.id, type: item.type },
                    })
                  }
                />
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  color,
  children,
  emptyLabel,
}: {
  title: string;
  color: string;
  children: React.ReactNode[];
  emptyLabel: string;
}) {
  const has = children.filter(Boolean).length > 0;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {has ? children : <Text style={styles.emptySection}>{emptyLabel}</Text>}
    </View>
  );
}

function CareRow({
  title,
  meta,
  date,
  tint,
  surface,
  border,
  text,
  muted,
  onPress,
}: {
  title: string;
  meta: string;
  date: string;
  tint: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: surface,
          borderColor: border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: text }]}>{title}</Text>
        <Text style={[styles.rowMeta, { color: muted }]}>{meta}</Text>
      </View>
      <Text style={[styles.rowDate, { color: muted }]}>{date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 340,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginTop: 18,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 4,
  },
  emptySection: {
    color: '#8A8580',
    fontSize: 14,
    marginLeft: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowMeta: { fontSize: 13 },
  rowDate: { fontSize: 12, fontWeight: '500' },
});
