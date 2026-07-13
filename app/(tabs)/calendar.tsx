import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { EmptyState } from '@/components/EmptyState';
import { WeekStrip } from '@/components/WeekStrip';
import { CareIcon } from '@/components/CareIcon';
import { tapLight, tapSuccess } from '@/lib/haptics';
import {
  effectiveWaterIntervalDays,
  formatRelativeCare,
  getCareDueItems,
} from '@/lib/care';
import { scheduleGentleReminders } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';
import { MOISTURE_SNOOZE_DAYS, type CareDueItem } from '@/lib/types';

export default function CalendarScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants, logs, settings, addCareLog } = usePlants();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dueItems = useMemo(() => getCareDueItems(plants, logs), [plants, logs]);
  const overdue = dueItems.filter((d) => d.overdue);
  const today = dueItems.filter((d) => d.daysUntil === 0);
  const upcoming = dueItems.filter((d) => d.daysUntil > 0).slice(0, 20);

  useEffect(() => {
    scheduleGentleReminders(dueItems, settings.notificationsEnabled).catch(() => {});
  }, [dueItems, settings.notificationsEnabled]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const onWatered = async (item: CareDueItem) => {
    const key = `${item.plant.id}-${item.type}`;
    setBusyId(key);
    try {
      await addCareLog({
        plantId: item.plant.id,
        type: item.type,
        note: item.type === 'water' ? 'Logged from calendar' : 'Fertilized from calendar',
      });
      tapSuccess();
      flash(
        item.type === 'water'
          ? `Watered ${item.plant.name}`
          : `Fed ${item.plant.name}`
      );
    } catch {
      flash('Could not save — try again');
    } finally {
      setBusyId(null);
    }
  };

  const onStillMoist = async (item: CareDueItem) => {
    if (item.type !== 'water') return;
    const key = `${item.plant.id}-check`;
    setBusyId(key);
    try {
      await addCareLog({
        plantId: item.plant.id,
        type: 'check',
        note: `Still moist — snoozed ${MOISTURE_SNOOZE_DAYS} days (check before water)`,
      });
      tapSuccess();
      flash(`${item.plant.name} · snoozed ${MOISTURE_SNOOZE_DAYS}d`);
    } catch {
      flash('Could not save — try again');
    } finally {
      setBusyId(null);
    }
  };

  const openLog = (item: CareDueItem) => {
    router.push({
      pathname: '/plant/log',
      params: { plantId: item.plant.id, type: item.type },
    });
  };

  const renderRow = (item: CareDueItem, tint: string, sectionKey: string) => {
    const checkFirst = item.type === 'water' && item.plant.checkBeforeWater !== false;
    const busy =
      busyId === `${item.plant.id}-${item.type}` || busyId === `${item.plant.id}-check`;
    const intervalHint =
      item.type === 'water'
        ? `~every ${effectiveWaterIntervalDays(item.plant)}d (light/pot-aware)`
        : `every ${item.effectiveIntervalDays}d`;

    return (
      <View
        key={`${item.plant.id}-${item.type}-${sectionKey}`}
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <Pressable
          onPress={() => openLog(item)}
          onLongPress={() => router.push(`/plant/${item.plant.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${item.plant.name}, ${item.type}, ${formatRelativeCare(item.daysUntil)}. Tap to log, long-press for plant.`}
          style={styles.cardTop}
        >
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <View style={styles.rowBody}>
            <Text style={[Type.title, { color: c.text, fontSize: 15 }]}>
              {item.plant.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <CareIcon type={item.type} color={tint} size={13} />
              <Text style={[Type.meta, { color: c.textMuted }]}>
                {item.type === 'water' ? 'Water' : 'Fertilize'} ·{' '}
                {formatRelativeCare(item.daysUntil)}
                {item.plant.location ? ` · ${item.plant.location}` : ''}
              </Text>
            </View>
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 2, fontSize: 10 }]}>
              {intervalHint}
              {checkFirst ? ' · check soil first' : ''}
            </Text>
          </View>
          <Text style={[Type.meta, { color: c.textMuted, fontFamily: Fonts.bodySemi }]}>
            {format(item.dueDate, 'MMM d')}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <ActionChip
            label={item.type === 'water' ? 'Watered' : 'Fertilized'}
            bg={c.growth}
            fg={c.growthInk}
            disabled={busy}
            onPress={() => onWatered(item)}
          />
          {item.type === 'water' ? (
            <ActionChip
              label="Still moist"
              bg={c.surfaceAlt}
              fg={c.text}
              border={c.border}
              disabled={busy}
              onPress={() => onStillMoist(item)}
            />
          ) : null}
          <ActionChip
            label="Details"
            bg={c.surface}
            fg={c.tint}
            border={c.border}
            disabled={busy}
            onPress={() => router.push(`/plant/${item.plant.id}`)}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[Type.micro, { color: c.tint }]}>Care calendar</Text>
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>Gentle reminders</Text>
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6, maxWidth: 340 }]}>
          Soft nudges to check your plants — not orders to water.
        </Text>
        {plants.length > 0 ? (
          <WeekStrip dueDates={dueItems.map((d) => d.dueDate)} />
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {toast ? (
          <View
            style={[styles.toast, { backgroundColor: c.heroSurface }]}
            accessibilityLiveRegion="polite"
          >
            <Text style={[Type.meta, { color: c.growth, fontFamily: Fonts.bodySemi }]}>
              {toast}
            </Text>
          </View>
        ) : null}

        {plants.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Nothing scheduled yet"
            body="Add plants with water and fertilize intervals to build a calm care calendar."
            actionLabel="Add a plant"
            onAction={() => router.push('/plant/add')}
          />
        ) : (
          <>
            <View
              style={[
                styles.philosophy,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Text style={[Type.meta, { color: c.tint, fontFamily: Fonts.bodySemi }]}>
                Check before water
              </Text>
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
                Stick a finger in the soil. If it’s still damp, tap Still moist (+
                {MOISTURE_SNOOZE_DAYS}d). Intervals also adapt to pot size and light.
              </Text>
            </View>

            <Section title="Overdue" color={c.danger} emptyLabel="You're all caught up">
              {overdue.map((item) => renderRow(item, c.danger, 'o'))}
            </Section>

            <Section title="Today" color={c.tint} emptyLabel="No care due today">
              {today.map((item) => renderRow(item, c.growth, 't'))}
            </Section>

            <Section title="Upcoming" color={c.textMuted} emptyLabel="No upcoming care">
              {upcoming.map((item) => renderRow(item, c.tint, 'u'))}
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ActionChip({
  label,
  bg,
  fg,
  border,
  disabled,
  onPress,
}: {
  label: string;
  bg: string;
  fg: string;
  border?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: border ?? bg,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text style={[Type.meta, { color: fg, fontFamily: Fonts.bodySemi, fontSize: 12 }]}>
        {label}
      </Text>
    </Pressable>
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
      <Text style={[Type.micro, { color, marginBottom: 8, marginLeft: 2 }]}>{title}</Text>
      {has ? (
        children
      ) : (
        <Text style={[Type.meta, { color: '#8A8580', marginLeft: 2, marginBottom: 4 }]}>
          {emptyLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  toast: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  philosophy: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  section: { marginTop: 18, gap: 8 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowBody: { flex: 1 },
});
