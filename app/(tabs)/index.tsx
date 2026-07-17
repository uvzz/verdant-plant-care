import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, Sparkles, Sprout } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PlantCardSkeleton } from '@/components/Skeleton';

import Colors, { APP_NAME } from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { EmptyState } from '@/components/EmptyState';
import { PlantCard } from '@/components/PlantCard';
import { formatRelativeCare, getCareDueItems, listRooms } from '@/lib/care';
import { usePlants } from '@/lib/PlantContext';
import type { PlantCategory } from '@/lib/types';
import { PLANT_CATEGORIES } from '@/lib/types';

export default function MyPlantsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plants, logs, loading, canAddPlant, freeLimit, settings } = usePlants();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlantCategory | 'All'>('All');
  const [room, setRoom] = useState<string | 'All'>('All');

  const rooms = useMemo(() => listRooms(plants), [plants]);

  const dueMap = useMemo(() => {
    const items = getCareDueItems(plants, logs);
    const map = new Map<
      string,
      {
        label: string;
        colorKey: 'ok' | 'today' | 'late';
        progress: number;
        type: 'water' | 'fertilize';
      }
    >();
    for (const item of items) {
      if (!map.has(item.plant.id)) {
        const colorKey =
          item.daysUntil < 0 ? 'late' : item.daysUntil === 0 ? 'today' : 'ok';
        const progress =
          item.daysUntil <= 0
            ? 1
            : Math.min(1, Math.max(0.12, 1 - item.daysUntil / 14));
        map.set(item.plant.id, {
          label: formatRelativeCare(item.daysUntil),
          colorKey,
          progress,
          type: item.type,
        });
      }
    }
    return map;
  }, [plants, logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (room !== 'All' && (p.location || '').trim() !== room) return false;
      if (!q) return true;
      return (
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.species ?? '').toLowerCase().includes(q) ||
        (p.location ?? '').toLowerCase().includes(q) ||
        (p.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [plants, query, category, room]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Type.micro, { color: c.tint }]}>{APP_NAME}</Text>
            <Text style={[Type.displayL, { color: c.text, marginTop: 4 }]}>My Plants</Text>
          </View>
        </View>
        <View style={styles.skeletonGrid}>
          <View style={styles.row}>
            <PlantCardSkeleton />
            <PlantCardSkeleton />
          </View>
          <View style={styles.row}>
            <PlantCardSkeleton />
            <PlantCardSkeleton />
          </View>
        </View>
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
            {filtered.length !== plants.length ? ` · showing ${filtered.length}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (!canAddPlant) {
              router.push({ pathname: '/paywall', params: { reason: 'limit' } });
              return;
            }
            router.push('/plant/add');
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: c.growth,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
        >
          <Plus color={c.growthInk} size={26} strokeWidth={2.4} />
        </Pressable>
      </View>

      {plants.length > 0 ? (
        <View style={styles.searchWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, species, room…"
            placeholderTextColor={c.textMuted}
            style={[
              styles.search,
              {
                color: c.text,
                backgroundColor: c.surface,
                borderColor: c.border,
                fontFamily: Fonts.body,
              },
            ]}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <FlatList
            horizontal
            data={['All', ...PLANT_CATEGORIES] as const}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => {
              const active = item === category;
              return (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[
                    styles.chip,
                    {
                      // Active pill inverts the page so it's high-contrast in
                      // BOTH themes. A raw `night` fill == background in dark
                      // mode and made the selected chip vanish.
                      backgroundColor: active ? c.emphasis : c.surface,
                      borderColor: active ? c.emphasis : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      {
                        color: active ? c.onEmphasis : c.text,
                        fontFamily: Fonts.bodySemi,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
          {rooms.length > 0 ? (
            <FlatList
              horizontal
              data={['All', ...rooms] as const}
              keyExtractor={(item) => `room-${item}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => {
                const active = item === room;
                return (
                  <Pressable
                    onPress={() => setRoom(item)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.tint : c.surface,
                        borderColor: active ? c.tint : c.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Type.meta,
                        {
                          color: active ? '#FFFFFF' : c.text,
                          fontFamily: Fonts.bodySemi,
                        },
                      ]}
                    >
                      {item === 'All' ? 'All rooms' : item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : null}
        </View>
      ) : null}

      {plants.length === 0 ? (
        <>
          <EmptyState
            icon={<Sprout color="#FFFFFF" size={36} strokeWidth={1.8} />}
            title="Your glasshouse is quiet"
            body="Add a plant with a portrait. Use AI identify to fill species and care intervals — then set room, light, and pot so schedules stay smart."
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search color="#FFFFFF" size={36} strokeWidth={1.8} />}
          title="No matches"
          body="Try another search, category, or room filter."
          actionLabel="Clear filters"
          onAction={() => {
            setQuery('');
            setCategory('All');
            setRoom('All');
          }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const due = dueMap.get(item.id);
            const filamentColor =
              due?.colorKey === 'late'
                ? c.danger
                : due?.colorKey === 'today'
                  ? c.growth
                  : c.tint;
            // Odd last item: keep half-width so it doesn't stretch full row
            const isOddLast =
              filtered.length % 2 === 1 && index === filtered.length - 1;
            return (
              <Animated.View
                entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(16)}
                style={[styles.cardWrap, isOddLast && styles.cardWrapHalf]}
              >
                <PlantCard
                  plant={item}
                  subtitle={due?.label}
                  dueType={due?.type}
                  dueProgress={due?.progress}
                  overdue={due?.colorKey === 'late'}
                  filamentColor={filamentColor}
                />
              </Animated.View>
            );
          }}
          ListFooterComponent={
            canAddPlant && filtered.length === plants.length ? (
              <Pressable
                onPress={() => router.push('/plant/add')}
                accessibilityRole="button"
                accessibilityLabel="Add a plant"
                style={({ pressed }) => [
                  styles.ghostAdd,
                  {
                    borderColor: c.border,
                    backgroundColor: c.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Plus color={c.tint} size={20} strokeWidth={2.2} />
                <Text style={[Type.meta, { color: c.textMuted, marginTop: 6 }]}>
                  Add a plant
                </Text>
              </Pressable>
            ) : !canAddPlant ? (
              <Link href={{ pathname: "/paywall", params: { reason: "limit" } }} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Upgrade to Premium for unlimited plants"
                  style={[
                    styles.upgradeBanner,
                    { backgroundColor: c.heroSurface, borderColor: c.heroSurface },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Sparkles color={c.growth} size={16} strokeWidth={2.2} />
                    <Text style={[Type.title, { color: '#EEF3EF', fontSize: 15 }]}>
                      You’ve filled your {freeLimit} free plants
                    </Text>
                  </View>
                  <Text style={[Type.meta, { color: 'rgba(232,239,233,0.7)', marginTop: 4 }]}>
                    Go Premium for unlimited plants, AI, and cloud sync →
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
    paddingBottom: 8,
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
  searchWrap: { paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  chips: { gap: 8, paddingVertical: 2, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  list: { paddingHorizontal: 14, paddingBottom: 40 },
  row: { gap: 10, marginBottom: 10 },
  cardWrap: { flex: 1, maxWidth: '50%' },
  // The odd last card must not stretch across the row — but `flex: 1` above
  // sets flexBasis: 0%, so overriding only flexGrow left basis 0 with no grow
  // and collapsed the card to zero width (a 1-plant grid rendered EMPTY).
  // Give it an explicit basis.
  cardWrapHalf: { maxWidth: '48%', flexGrow: 0, flexBasis: '48%' },
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
  skeletonGrid: { paddingHorizontal: 14, gap: 10, marginTop: 8 },
  ghostAdd: {
    marginTop: 2,
    marginBottom: 24,
    borderRadius: 18,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },
});
