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
    const map = new Map<string, string>();
    for (const item of items) {
      if (!map.has(item.plant.id)) {
        const label =
          item.type === 'water'
            ? `💧 ${formatRelativeCare(item.daysUntil)}`
            : `🌿 ${formatRelativeCare(item.daysUntil)}`;
        map.set(item.plant.id, label);
      }
    }
    return map;
  }, [plants, logs]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[styles.kicker, { color: c.tint }]}>{APP_NAME}</Text>
          <Text style={[styles.title, { color: c.text }]}>My Plants</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
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
            styles.addBtn,
            { backgroundColor: c.tint, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </Pressable>
      </View>

      {plants.length === 0 ? (
        <EmptyState
          emoji="🌿"
          title="Your garden is empty"
          body="Add your first plant with a photo. Track care, growth, and quiet progress over time."
        />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <PlantCard plant={item} subtitle={dueMap.get(item.id)} />
            </View>
          )}
          ListFooterComponent={
            !canAddPlant ? (
              <Link href="/(tabs)/settings" asChild>
                <Pressable
                  style={[styles.upgradeBanner, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <Text style={[styles.upgradeTitle, { color: c.text }]}>
                    Plant limit reached
                  </Text>
                  <Text style={[styles.upgradeBody, { color: c.textMuted }]}>
                    Upgrade to Premium for unlimited plants, deeper history, and care guides.
                  </Text>
                </Pressable>
              </Link>
            ) : null
          }
        />
      )}

      {plants.length === 0 ? (
        <View style={styles.emptyCta}>
          <Pressable
            onPress={() => router.push('/plant/add')}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: c.tint, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>Add your first plant</Text>
          </Pressable>
        </View>
      ) : null}
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
    marginTop: 4,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#F7F4EE',
    fontSize: 28,
    marginTop: -2,
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrap: {
    flex: 1,
  },
  emptyCta: {
    padding: 24,
  },
  cta: {
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#F7F4EE',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeBanner: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  upgradeBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
