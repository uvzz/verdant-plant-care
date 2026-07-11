import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { APP_NAME } from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { EmptyState } from '@/components/EmptyState';
import { PlantCard } from '@/components/PlantCard';
import { formatRelativeCare, getCareDueItems } from '@/lib/care';
import { usePlants } from '@/lib/PlantContext';

export default function MyPlantsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants, logs, loading, canAddPlant, freeLimit, settings } = usePlants();

  const dueMap = useMemo(() => {
    const items = getCareDueItems(plants, logs);
    const map = new Map<
      string,
      { label: string; colorKey: 'ok' | 'today' | 'late'; width: `${number}%` }
    >();
    for (const item of items) {
      if (!map.has(item.plant.id)) {
        const prefix = item.type === 'water' ? '💧' : '🌿';
        const colorKey =
          item.daysUntil < 0 ? 'late' : item.daysUntil === 0 ? 'today' : 'ok';
        const width: `${number}%` =
          item.daysUntil < 0
            ? '100%'
            : item.daysUntil === 0
              ? '95%'
              : (`${Math.max(20, 100 - item.daysUntil * 8)}%` as `${number}%`);
        map.set(item.plant.id, {
          label: `${prefix} ${formatRelativeCare(item.daysUntil)}`,
          colorKey,
          width,
        });
      }
    }
    return map;
  }, [plants, logs]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.growth} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[Type.micro, { color: c.tint }]}>{APP_NAME}</Text>
          <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>My Plants</Text>
          <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>
            {plants.length} plant{plants.length === 1 ? '' : 's'}
            {!settings.isPremium ? ` · Free up to ${freeLimit}` : ' · Premium'}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (!canAddPlant) {
              router.push('/(tabs)/settings');
              return;
            }
            router.push('/plant/add');
          }}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: c.growth, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ color: c.growthInk, fontSize: 28, marginTop: -2 }}>＋</Text>
        </Pressable>
      </View>

      {plants.length === 0 ? (
        <>
          <EmptyState
            emoji="🌿"
            title="Your glasshouse is quiet"
            body="Add a plant with a portrait. Care logs and progress photos will live here."
          />
          <View style={styles.emptyCta}>
            <Pressable
              onPress={() => router.push('/plant/add')}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: c.growth, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[Type.button, { color: c.growthInk }]}>Add your first plant</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const due = dueMap.get(item.id);
            const filamentColor =
              due?.colorKey === 'late'
                ? c.danger
                : due?.colorKey === 'today'
                  ? c.growth
                  : c.tint;
            return (
              <View style={styles.cardWrap}>
                <PlantCard
                  plant={item}
                  subtitle={due?.label}
                  filamentColor={filamentColor}
                  filamentWidth={due?.width ?? '60%'}
                />
              </View>
            );
          }}
          ListFooterComponent={
            !canAddPlant ? (
              <Link href="/(tabs)/settings" asChild>
                <Pressable
                  style={[styles.upgradeBanner, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <Text style={[Type.title, { color: c.text, fontSize: 15 }]}>
                    Plant limit reached
                  </Text>
                  <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>
                    Upgrade to Premium for unlimited plants, deeper history, and care guides.
                  </Text>
                </Pressable>
              </Link>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 14, paddingBottom: 40 },
  row: { gap: 10, marginBottom: 10 },
  cardWrap: { flex: 1 },
  emptyCta: { padding: 24, marginTop: 'auto' },
  cta: {
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBanner: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
