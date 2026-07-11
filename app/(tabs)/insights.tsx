import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME } from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { computeCollectionStats } from '@/lib/stats';
import { usePlants } from '@/lib/PlantContext';
import { getOpenRouterKey } from '@/lib/secrets';

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { plants, logs, settings, consumeAiUse, canUseAi, aiUsesLeft } = usePlants();
  const stats = useMemo(() => computeCollectionStats(plants, logs), [plants, logs]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxDay = Math.max(1, ...stats.byDayLast14.map((d) => d.count));

  const runCollectionInsight = async () => {
    if (plants.length === 0) {
      Alert.alert('No plants yet', 'Add plants and care logs first.');
      return;
    }
    if (!canUseAi) {
      Alert.alert('AI limit reached', 'Upgrade to Premium for unlimited AI assists.');
      return;
    }
    const key = await getOpenRouterKey();
    if (!key) {
      Alert.alert('API key needed', 'Add your OpenRouter key in Settings → AI assistant.');
      return;
    }
    setLoading(true);
    try {
      const quota = await consumeAiUse();
      if (!quota.ok) {
        Alert.alert('AI limit', quota.reason);
        return;
      }
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/uvzz/verdant-plant-care',
          'X-Title': 'Verdant Plant Care',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          temperature: 0.5,
          messages: [
            {
              role: 'system',
              content:
                'You are Verdant, a calm plant-collection coach. Give a short (3–6 sentences) encouraging insight about the user\'s collection stats. No markdown headings. Educational only.',
            },
            {
              role: 'user',
              content: `Collection stats JSON: ${JSON.stringify({
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
              })}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 160)}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      setAiSummary(data.choices?.[0]?.message?.content?.trim() || 'No insight returned.');
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
          {settings.isPremium ? ' Premium · unlimited AI.' : ` AI left: ${aiUsesLeft}.`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plants.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="No data yet"
            body="Add plants and log care to unlock stats and AI insights."
          />
        ) : (
          <>
            <View style={styles.grid}>
              <StatTile label="Plants" value={String(stats.plantCount)} c={c} />
              <StatTile label="Care logs" value={String(stats.totalLogs)} c={c} />
              <StatTile label="Streak" value={`${stats.careStreakDays}d`} c={c} />
              <StatTile label="Overdue" value={String(stats.overdueCount)} c={c} danger={stats.overdueCount > 0} />
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>Activity (14 days)</Text>
              <View style={styles.bars}>
                {stats.byDayLast14.map((d) => (
                  <View key={d.date} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: 8 + (d.count / maxDay) * 56,
                          backgroundColor: d.count ? c.growth : c.surfaceAlt,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <Text style={[Type.meta, { color: c.textMuted, marginTop: 8 }]}>
                Last 7 days: {stats.logsLast7Days} · Last 30 days: {stats.logsLast30Days}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[Type.title, { color: c.text }]}>Breakdown</Text>
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
                💧 {stats.waters} water · 🌿 {stats.fertilizes} feed · 📝 {stats.notes} notes · 📷{' '}
                {stats.photos} photos
              </Text>
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

            <View style={[styles.card, { backgroundColor: c.night, borderColor: c.night }]}>
              <Text style={[Type.title, { color: c.growth }]}>AI collection insight</Text>
              <Text
                style={[
                  Type.bodySmall,
                  { color: 'rgba(232,239,233,0.7)', marginTop: 4, marginBottom: 12 },
                ]}
              >
                A short coach note based on your stats. Uses one AI credit on free plan.
              </Text>
              <PrimaryButton
                label={loading ? 'Thinking…' : '✨ Generate insight'}
                onPress={runCollectionInsight}
                loading={loading}
              />
              {loading ? <ActivityIndicator color={c.growth} style={{ marginTop: 12 }} /> : null}
              {aiSummary ? (
                <Text style={[Type.body, { color: '#EEF3EF', marginTop: 14, lineHeight: 22 }]}>
                  {aiSummary}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({
  label,
  value,
  c,
  danger,
}: {
  label: string;
  value: string;
  c: (typeof Colors)['light'];
  danger?: boolean;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[Type.displayM, { color: danger ? c.danger : c.text, fontSize: 26 }]}>
        {value}
      </Text>
      <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>{label}</Text>
    </View>
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
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 72,
    marginTop: 12,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 8 },
});
