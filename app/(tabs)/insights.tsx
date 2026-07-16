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
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { AreaSparkline } from '@/components/AreaSparkline';
import { computeCollectionStats } from '@/lib/stats';
import { usePlants } from '@/lib/PlantContext';
import { generateCollectionInsight } from '@/lib/openrouter';

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants, logs, settings, consumeAiUse, canUseAi, aiUsesLeft } = usePlants();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = windowWidth - 64;
  const stats = useMemo(() => computeCollectionStats(plants, logs), [plants, logs]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runCollectionInsight = async () => {
    if (plants.length === 0) {
      Alert.alert('No plants yet', 'Add plants and care logs first.');
      return;
    }
    if (!canUseAi) {
      Alert.alert(
        'Premium required',
        'AI collection insights are included with Premium.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }
    setLoading(true);
    try {
      const quota = await consumeAiUse();
      if (!quota.ok) {
        Alert.alert('AI limit', quota.reason);
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
      setAiSummary(text);
    } catch (e) {
      Alert.alert('Insight failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[Type.micro, { color: c.tint }]}>{APP_NAME}</Text>
        <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>Insights</Text>
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
          Care history and AI collection coaching.
          {settings.isPremium
            ? ' Premium · server AI unlocked.'
            : ' Free · AI requires Premium.'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plants.length === 0 ? (
          <EmptyState
            icon={<ChartColumn color="#FFFFFF" size={36} strokeWidth={1.8} />}
            title="No data yet"
            body="Add plants and log care to unlock stats and AI insights."
            actionLabel="Add a plant"
            onAction={() => router.push('/plant/add')}
          />
        ) : (
          <>
            <View style={styles.grid}>
              <StatTile label="Plants" value={String(stats.plantCount)} c={c} index={0} />
              <StatTile label="Care logs" value={String(stats.totalLogs)} c={c} index={1} />
              <StatTile label="Streak" value={`${stats.careStreakDays}d`} c={c} index={2} />
              <StatTile
                label="Overdue"
                value={String(stats.overdueCount)}
                c={c}
                index={3}
                danger={stats.overdueCount > 0}
                onPress={
                  stats.overdueCount > 0
                    ? () => router.push('/(tabs)/calendar')
                    : undefined
                }
              />
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>Activity (14 days)</Text>
              <View style={{ marginTop: 12 }}>
                <AreaSparkline
                  values={stats.byDayLast14.map((d) => d.count)}
                  width={chartWidth}
                  height={72}
                  color={c.growth}
                />
              </View>
              <Text style={[Type.meta, { color: c.textMuted, marginTop: 8 }]}>
                Last 7 days: {stats.logsLast7Days} · Last 30 days: {stats.logsLast30Days}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>Breakdown</Text>
              <View style={styles.breakdownRow}>
                <BreakdownStat
                  icon={<Droplet color={c.tint} size={14} strokeWidth={2.2} />}
                  value={stats.waters}
                  label="water"
                  c={c}
                />
                <BreakdownStat
                  icon={<Sprout color={c.tint} size={14} strokeWidth={2.2} />}
                  value={stats.fertilizes}
                  label="feed"
                  c={c}
                />
                <BreakdownStat
                  icon={<NotebookPen color={c.tint} size={14} strokeWidth={2.2} />}
                  value={stats.notes}
                  label="notes"
                  c={c}
                />
                <BreakdownStat
                  icon={<Camera color={c.tint} size={14} strokeWidth={2.2} />}
                  value={stats.photos}
                  label="photos"
                  c={c}
                />
              </View>
              {stats.mostActivePlant ? (
                <Text style={[Type.bodySmall, { color: c.text, marginTop: 8 }]}>
                  Most active: {stats.mostActivePlant.name} ({stats.mostActivePlant.count} logs)
                </Text>
              ) : null}
              {stats.categoryBreakdown.length > 0 ? (
                <View style={{ marginTop: 10, gap: 4 }}>
                  {stats.categoryBreakdown.map((row) => (
                    <Text key={row.category} style={[Type.meta, { color: c.textMuted }]}>
                      {row.category} · {row.count}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Text style={[Type.meta, { color: c.tint, marginTop: 10 }]}>
                Due today: {stats.dueTodayCount}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: c.heroSurface, borderColor: c.heroSurface }]}>
              <Text style={[Type.title, { color: c.growth }]}>AI collection insight</Text>
              <Text
                style={[
                  Type.bodySmall,
                  { color: 'rgba(232,239,233,0.7)', marginTop: 4, marginBottom: 12 },
                ]}
              >
                {canUseAi
                  ? `A short coach note from your stats. Premium AI · ~${aiUsesLeft === 'unlimited' ? '∞' : aiUsesLeft} soft uses left today on this device.`
                  : 'Premium only — unlock in Settings for a calm coach note on your collection.'}
              </Text>
              {canUseAi ? (
                <PrimaryButton
                  label={loading ? 'Thinking…' : 'Generate insight'}
                  icon={<Sparkles color={c.growthInk} size={16} strokeWidth={2.2} />}
                  onPress={runCollectionInsight}
                  loading={loading}
                  accessibilityHint="Uses Premium AI for a short collection note"
                />
              ) : (
                <PrimaryButton
                  label="Unlock Premium for AI"
                  onPress={() => router.push('/(tabs)/settings')}
                  accessibilityHint="Opens Settings to unlock Premium"
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
}: {
  label: string;
  value: string;
  c: (typeof Colors)['light'];
  danger?: boolean;
  onPress?: () => void;
  index?: number;
}) {
  const body = (
    <>
      <Text style={[Type.displayM, { color: danger ? c.danger : c.text, fontSize: 26 }]}>
        {value}
      </Text>
      <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>{label}</Text>
      {onPress && danger ? (
        <Text style={[Type.meta, { color: c.tint, marginTop: 4, fontSize: 10 }]}>
          Tap for care list
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
        accessibilityLabel={`${label}: ${value}`}
        style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        {body}
      </AnimatedPressable>
    );
  }
  return (
    <Animated.View
      entering={entering}
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }]}
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
