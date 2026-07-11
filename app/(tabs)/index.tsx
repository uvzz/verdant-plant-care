import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (room !== 'All' && (p.location || '').trim() !== room) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
      );
    });
  }, [plants, query, category, room]);

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
            {filtered.length !== plants.length ? ` · showing ${filtered.length}` : ''}
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
                      backgroundColor: active ? c.night : c.surface,
                      borderColor: active ? c.night : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      {
                        color: active ? c.background : c.text,
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
            emoji="🌿"
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
          emoji="🔎"
          title="No matches"
          body="Try another search, category, or room filter."
        />
      ) : (
        <FlatList
          data={filtered}
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
                  style={[
                    styles.upgradeBanner,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Text style={[Type.title, { color: c.text, fontSize: 15 }]}>
                    Plant limit reached
                  </Text>
                  <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>
                    Upgrade to Premium for unlimited plants and AI assists.
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
