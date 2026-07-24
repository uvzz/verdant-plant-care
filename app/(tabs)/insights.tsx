import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ChartColumn, Droplet, NotebookPen, Sparkles, Sprout } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TextSkeleton } from '@/components/Skeleton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

import Colors, { APP_NAME } from '@/constants/Colors';
import {
  careColor,
  categoryColor,
  softBorder,
  softFill,
  statusColor,
} from '@/constants/Palette';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { AreaSparkline } from '@/components/AreaSparkline';
import { computeCollectionStats } from '@/lib/stats';
import { usePlants } from '@/lib/PlantContext';
import { generateCollectionInsight } from '@/lib/openrouter';
import { useI18n } from '@/lib/i18n';
import type { TFunction } from '@/lib/i18n/core';

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { plants, logs, settings, consumeAiUse, canUseAi, aiUsesLeft } = usePlants();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = windowWidth - 64;
  const stats = useMemo(() => computeCollectionStats(plants, logs), [plants, logs]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runCollectionInsight = async () => {
    if (plants.length === 0) {
      Alert.alert(t('insights.alertNoPlantsTitle'), t('insights.alertNoPlantsBody'));
      return;
    }
    if (!canUseAi) {
      router.push({ pathname: '/paywall', params: { reason: 'insights' } });
      return;
    }
    setLoading(true);
    try {
      const quota = await consumeAiUse();
      if (!quota.ok) {
        // quota.reason comes from lib/PlantContext's local AI-quota gate, not
        // this screen — out of scope for the insights.tsx localization pass.
        Alert.alert(t('insights.alertAiLimitTitle'), quota.reason);
        return;
      }
      const text = await generateCollectionInsight(
        JSON.stringify({
          plants: stats.plantCount,
          totalLogs: stats.totalLogs,
          waters: stats.waters,
          fertilizes: stats.fertilizes,
          overdue: stats.overdueCount,
          dueToday: stats.dueTodayCount,
          streakDays: stats.careStreakDays,
          last7Days: stats.logsLast7Days,
          categories: stats.categoryBreakdown,
          mostActive: stats.mostActivePlant,
        })
      );
      // The AI's returned text is model output, shown verbatim — not
      // translated (Constraint 9).
      setAiSummary(text);
    } catch (e) {
      Alert.alert(
        t('insights.alertInsightFailedTitle'),
        e instanceof Error ? e.message : t('insights.alertUnknownError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[Type.micro, { color: c.tint }]}>{APP_NAME}</Text>
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>
          {t('insights.title')}
        </Text>
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
          {t('insights.subtitle', {
            tail: t(settings.isPremium ? 'insights.subtitleTailPremium' : 'insights.subtitleTailFree'),
          })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plants.length === 0 ? (
          <EmptyState
            icon={<ChartColumn color="#FFFFFF" size={36} strokeWidth={1.8} />}
            title={t('insights.emptyTitle')}
            body={t('insights.emptyBody')}
            actionLabel={t('insights.emptyAction')}
            onAction={() => router.push('/plant/add')}
          />
        ) : (
          <>
            <View style={styles.grid}>
              <StatTile
                label={t('insights.statPlants')}
                value={String(stats.plantCount)}
                c={c}
                index={0}
                hue={statusColor('healthy', scheme)}
                scheme={scheme}
                t={t}
              />
              <StatTile
                label={t('insights.statCareLogs')}
                value={String(stats.totalLogs)}
                c={c}
                index={1}
                hue={careColor('water', scheme)}
                scheme={scheme}
                t={t}
              />
              <StatTile
                label={t('insights.statStreak')}
                value={t('insights.streakValue', { count: stats.careStreakDays })}
                c={c}
                index={2}
                hue={careColor('fertilize', scheme)}
                scheme={scheme}
                t={t}
              />
              <StatTile
                label={t('insights.statOverdue')}
                value={String(stats.overdueCount)}
                c={c}
                index={3}
                scheme={scheme}
                t={t}
                // Only burn the alarm colour when something IS overdue —
                // a permanently red "0" trains the user to ignore it.
                hue={
                  stats.overdueCount > 0
                    ? statusColor('overdue', scheme)
                    : statusColor('healthy', scheme)
                }
                danger={stats.overdueCount > 0}
                onPress={
                  stats.overdueCount > 0
                    ? () => router.push('/(tabs)/calendar')
                    : undefined
                }
              />
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>{t('insights.activityTitle')}</Text>
              <View style={{ marginTop: 12 }}>
                <AreaSparkline
                  values={stats.byDayLast14.map((d) => d.count)}
                  width={chartWidth}
                  height={72}
                  color={c.growth}
                />
              </View>
              <Text style={[Type.meta, { color: c.textMuted, marginTop: 8 }]}>
                {t('insights.last7and30', {
                  sevenDays: stats.logsLast7Days,
                  thirtyDays: stats.logsLast30Days,
                })}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>{t('insights.breakdownTitle')}</Text>
              <View style={styles.breakdownRow}>
                <BreakdownStat
                  icon={
                    <Droplet color={careColor('water', scheme)} size={14} strokeWidth={2.2} />
                  }
                  value={stats.waters}
                  label={t('insights.breakdownWater')}
                  c={c}
                />
                <BreakdownStat
                  icon={
                    <Sprout color={careColor('fertilize', scheme)} size={14} strokeWidth={2.2} />
                  }
                  value={stats.fertilizes}
                  label={t('insights.breakdownFeed')}
                  c={c}
                />
                <BreakdownStat
                  icon={
                    <NotebookPen color={careColor('note', scheme)} size={14} strokeWidth={2.2} />
                  }
                  value={stats.notes}
                  label={t('insights.breakdownNotes')}
                  c={c}
                />
                <BreakdownStat
                  icon={
                    <Camera color={careColor('photo', scheme)} size={14} strokeWidth={2.2} />
                  }
                  value={stats.photos}
                  label={t('insights.breakdownPhotos')}
                  c={c}
                />
              </View>
              {stats.mostActivePlant ? (
                <Text style={[Type.bodySmall, { color: c.text, marginTop: 8 }]}>
                  {stats.mostActivePlant.count === 1
                    ? t('insights.mostActiveOne', { name: stats.mostActivePlant.name })
                    : t('insights.mostActiveMany', {
                        name: stats.mostActivePlant.name,
                        count: stats.mostActivePlant.count,
                      })}
                </Text>
              ) : null}
              {stats.categoryBreakdown.length > 0 ? (
                <View style={{ marginTop: 10, gap: 6 }}>
                  {stats.categoryBreakdown.map((row) => (
                    <View key={row.category} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: categoryColor(row.category, scheme) },
                        ]}
                      />
                      <Text style={[Type.meta, { color: c.textMuted }]}>
                        {t('insights.categoryRow', {
                          category: t(`domain.category.${row.category}`),
                          count: row.count,
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <Text style={[Type.meta, { color: c.tint, marginTop: 10 }]}>
                {t('insights.dueToday', { count: stats.dueTodayCount })}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: c.heroSurface, borderColor: c.heroSurface }]}>
              <Text style={[Type.title, { color: c.growth }]}>{t('insights.aiTitle')}</Text>
              <Text
                style={[
                  Type.bodySmall,
                  { color: 'rgba(232,239,233,0.7)', marginTop: 4, marginBottom: 12 },
                ]}
              >
                {canUseAi
                  ? t('insights.aiBodyPremium', {
                      usesLeft: aiUsesLeft === 'unlimited' ? '∞' : aiUsesLeft,
                    })
                  : t('insights.aiBodyFree')}
              </Text>
              {canUseAi ? (
                <PrimaryButton
                  label={loading ? t('insights.aiButtonThinking') : t('insights.aiButtonGenerate')}
                  icon={<Sparkles color={c.growthInk} size={16} strokeWidth={2.2} />}
                  onPress={runCollectionInsight}
                  loading={loading}
                  accessibilityHint={t('insights.aiHintGenerate')}
                />
              ) : (
                <PrimaryButton
                  label={t('insights.aiButtonUnlock')}
                  icon={<Sparkles color={c.growthInk} size={16} strokeWidth={2.2} />}
                  onPress={() => router.push({ pathname: '/paywall', params: { reason: 'insights' } })}
                  accessibilityHint={t('insights.aiHintUnlock')}
                />
              )}
              {loading && !aiSummary ? <TextSkeleton lines={3} /> : null}
              {aiSummary ? (
                <Animated.View entering={FadeInDown.duration(220)}>
                  <Text
                    style={[Type.body, { color: '#EEF3EF', marginTop: 14, lineHeight: 22 }]}
                    accessibilityLiveRegion="polite"
                  >
                    {aiSummary}
                  </Text>
                </Animated.View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function BreakdownStat({
  icon,
  value,
  label,
  c,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  c: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.breakdownStat}>
      {icon}
      <Text style={[Type.bodySmall, { color: c.text }]}>
        {value} <Text style={{ color: c.textMuted }}>{label}</Text>
      </Text>
    </View>
  );
}

function StatTile({
  label,
  value,
  c,
  danger,
  onPress,
  index = 0,
  hue,
  scheme,
  t,
}: {
  label: string;
  value: string;
  c: (typeof Colors)['light'];
  danger?: boolean;
  onPress?: () => void;
  index?: number;
  /** Accent for the tile. Tints the fill, the border and the number. */
  hue: string;
  scheme: 'light' | 'dark';
  t: TFunction;
}) {
  const tileStyle = {
    backgroundColor: softFill(hue, scheme),
    borderColor: softBorder(hue, scheme),
  };
  const a11yLabel = t('insights.statA11yLabel', { label, value });
  const body = (
    <>
      <Text style={[Type.displayM, { color: hue, fontSize: 26 }]}>{value}</Text>
      <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>{label}</Text>
      {onPress && danger ? (
        <Text style={[Type.meta, { color: hue, marginTop: 4, fontSize: 10 }]}>
          {t('insights.tapForCareList')}
        </Text>
      ) : null}
    </>
  );
  const entering = FadeInDown.delay(index * 70)
    .springify()
    .damping(15);
  if (onPress) {
    return (
      <AnimatedPressable
        entering={entering}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        style={[styles.tile, tileStyle]}
      >
        {body}
      </AnimatedPressable>
    );
  }
  return (
    <Animated.View
      entering={entering}
      accessibilityLabel={a11yLabel}
      style={[styles.tile, tileStyle]}
    >
      {body}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  tile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  breakdownStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
