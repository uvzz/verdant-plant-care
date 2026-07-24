import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { careColor, onHue, statusColor } from '@/constants/Palette';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { EmptyState } from '@/components/EmptyState';
import { WeekStrip } from '@/components/WeekStrip';
import { CareIcon } from '@/components/CareIcon';
import { SwipeToComplete } from '@/components/SwipeToComplete';
import { CalendarDays } from 'lucide-react-native';
import { tapLight, tapSuccess } from '@/lib/haptics';
import { getCareDueItems, relativeCareLabel } from '@/lib/care';
import { careVerbLabel, intervalHintLabel } from '@/lib/calendarLabels';
import { scheduleGentleReminders } from '@/lib/notifications';
import { usePlants } from '@/lib/PlantContext';
import { useI18n } from '@/lib/i18n';
import { translateLabel } from '@/lib/i18n/core';
import { MOISTURE_SNOOZE_DAYS, type CareDueItem } from '@/lib/types';

export default function CalendarScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { plants, logs, settings, addCareLog } = usePlants();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dueItems = useMemo(() => getCareDueItems(plants, logs), [plants, logs]);
  // Once the user has logged a handful of care actions they know the routine —
  // collapse the philosophy card to a one-line reminder.
  const experienced = logs.length >= 5;
  const overdue = dueItems.filter((d) => d.overdue);
  const today = dueItems.filter((d) => d.daysUntil === 0);
  const upcoming = dueItems.filter((d) => d.daysUntil > 0).slice(0, 20);

  useEffect(() => {
    scheduleGentleReminders(dueItems, settings.notificationsEnabled).catch(() => {});
  }, [dueItems, settings.notificationsEnabled]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
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
        t(item.type === 'water' ? 'calendar.toastWatered' : 'calendar.toastFed', {
          name: item.plant.name,
        })
      );
    } catch {
      flash(t('calendar.toastError'));
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
      flash(
        t('calendar.toastSnoozed', {
          name: item.plant.name,
          days: MOISTURE_SNOOZE_DAYS,
        })
      );
    } catch {
      flash(t('calendar.toastError'));
    } finally {
      setBusyId(null);
    }
  };

  const openPlant = (item: CareDueItem) => {
    router.push(`/plant/${item.plant.id}`);
  };

  const openLog = (item: CareDueItem) => {
    router.push({
      pathname: '/plant/log',
      params: { plantId: item.plant.id, type: item.type },
    });
  };

  const renderRow = (item: CareDueItem, tint: string, sectionKey: string) => {
    const busy =
      busyId === `${item.plant.id}-${item.type}` || busyId === `${item.plant.id}-check`;
    const careVerb = translateLabel(t, careVerbLabel(item.type));
    const relative = translateLabel(t, relativeCareLabel(item.daysUntil));
    const intervalHint = translateLabel(t, intervalHintLabel(item));
    const meta = item.plant.location
      ? t('calendar.rowMetaWithLocation', {
          careVerb,
          relative,
          location: item.plant.location,
        })
      : t('calendar.rowMeta', { careVerb, relative });

    return (
      <Animated.View
        entering={FadeInDown.springify().damping(16)}
        key={`${item.plant.id}-${item.type}-${sectionKey}`}
      >
      <SwipeToComplete
        onComplete={() => onWatered(item)}
        label={item.type === 'water' ? t('domain.careType.water') : t('calendar.swipeFed')}
        type={item.type}
        // The swipe panel wears the care colour, so the gesture reveals blue
        // for a watering and amber for a feed — the action is identifiable
        // before the label is even readable.
        bg={careColor(item.type, scheme)}
        fg={onHue(careColor(item.type, scheme))}
        disabled={busy}
      >
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Pressable
          onPress={() => openPlant(item)}
          onLongPress={() => openLog(item)}
          accessibilityRole="button"
          accessibilityLabel={t('calendar.rowA11yLabel', {
            name: item.plant.name,
            careVerb,
            relative,
          })}
          style={styles.cardTop}
        >
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <View style={styles.rowBody}>
            <Text style={[Type.title, { color: c.text, fontSize: 15 }]}>
              {item.plant.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <CareIcon type={item.type} color={tint} size={13} />
              <Text style={[Type.meta, { color: c.textMuted }]}>{meta}</Text>
            </View>
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 2, fontSize: 10 }]}>
              {intervalHint}
            </Text>
          </View>
          <Text style={[Type.meta, { color: c.textMuted, fontFamily: Fonts.bodySemi }]}>
            {format(item.dueDate, 'MMM d')}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <ActionChip
            label={item.type === 'water' ? t('domain.careType.water') : t('domain.careType.fertilize')}
            bg={careColor(item.type, scheme)}
            fg={onHue(careColor(item.type, scheme))}
            disabled={busy}
            onPress={() => onWatered(item)}
          />
          {item.type === 'water' ? (
            <ActionChip
              label={t('calendar.actionStillMoist')}
              bg={c.surfaceAlt}
              fg={c.text}
              border={c.border}
              disabled={busy}
              onPress={() => onStillMoist(item)}
            />
          ) : null}
          <ActionChip
            label={t('calendar.actionLog')}
            bg={c.surface}
            fg={c.tint}
            border={c.border}
            disabled={busy}
            onPress={() => openLog(item)}
          />
          <ActionChip
            label={t('calendar.actionDetails')}
            bg={c.surface}
            fg={c.tint}
            border={c.border}
            disabled={busy}
            onPress={() => openPlant(item)}
          />
        </View>
      </View>
      </SwipeToComplete>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[Type.micro, { color: c.tint }]}>{t('calendar.eyebrow')}</Text>
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>
          {t('calendar.title')}
        </Text>
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6, maxWidth: 340 }]}>
          {t('calendar.subtitle')}
        </Text>
        {plants.length > 0 ? (
          <WeekStrip due={dueItems.map((d) => ({ date: d.dueDate, type: d.type }))} />
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {toast ? (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[styles.toast, { backgroundColor: c.heroSurface }]}
            accessibilityLiveRegion="polite"
          >
            <Text style={[Type.meta, { color: c.growth, fontFamily: Fonts.bodySemi }]}>
              {toast}
            </Text>
          </Animated.View>
        ) : null}

        {plants.length === 0 ? (
          <EmptyState
            icon={<CalendarDays color="#FFFFFF" size={36} strokeWidth={1.8} />}
            title={t('calendar.emptyStateTitle')}
            body={t('calendar.emptyStateBody')}
            actionLabel={t('calendar.emptyStateAction')}
            onAction={() => router.push('/plant/add')}
          />
        ) : (
          <>
            {experienced ? (
              <View style={[styles.philosophyChip, { borderColor: c.border }]}>
                <CareIcon type="check" color={c.tint} size={12} />
                <Text style={[Type.meta, { color: c.textMuted, fontSize: 11 }]}>
                  {t('calendar.philosophyCollapsed')}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.philosophy,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={[Type.meta, { color: c.tint, fontFamily: Fonts.bodySemi }]}>
                  {t('calendar.philosophyTitle')}
                </Text>
                <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4 }]}>
                  {t('calendar.philosophyBody', { days: MOISTURE_SNOOZE_DAYS })}
                </Text>
              </View>
            )}

            {/* Overdue rows stay coral regardless of care type — lateness
                outranks "what kind of care". Everything else is coloured by
                the action it is asking for. */}
            <Section
              title={t('calendar.sectionOverdue')}
              color={statusColor('overdue', scheme)}
              emptyLabel={t('calendar.emptyOverdue')}
            >
              {overdue.map((item) => renderRow(item, statusColor('overdue', scheme), 'o'))}
            </Section>

            <Section
              title={t('calendar.sectionToday')}
              color={statusColor('dueToday', scheme)}
              emptyLabel={t('calendar.emptyToday')}
            >
              {today.map((item) => renderRow(item, careColor(item.type, scheme), 't'))}
            </Section>

            <Section
              title={t('calendar.sectionUpcoming')}
              color={c.textMuted}
              emptyLabel={t('calendar.emptyUpcoming')}
            >
              {upcoming.map((item) => renderRow(item, careColor(item.type, scheme), 'u'))}
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
  philosophyChip: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
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
