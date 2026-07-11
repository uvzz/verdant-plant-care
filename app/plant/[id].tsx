import { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { CareLogRow } from '@/components/CareLogRow';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  formatRelativeCare,
  getPlantLogs,
  getProgressPhotos,
  nextDueDate,
} from '@/lib/care';
import { usePlants } from '@/lib/PlantContext';

const { width } = Dimensions.get('window');

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const navigation = useNavigation();
  const { getPlant, logs, deletePlant } = usePlants();
  const plant = getPlant(id);
  const [tab, setTab] = useState<'log' | 'gallery'>('log');

  const plantLogs = useMemo(
    () => (plant ? getPlantLogs(logs, plant.id) : []),
    [logs, plant]
  );
  const photos = useMemo(
    () => (plant ? getProgressPhotos(logs, plant.id) : []),
    [logs, plant]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        plant ? (
          <Pressable
            onPress={() => {
              Alert.alert(
                'Remove plant?',
                `Delete ${plant.name} and its care history? This cannot be undone.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deletePlant(plant.id);
                      router.back();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: Fonts.bodySemi, fontSize: 15 }}>
              Delete
            </Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, plant, deletePlant, router]);

  if (!plant) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[Type.body, { color: c.textMuted }]}>Plant not found.</Text>
      </View>
    );
  }

  const waterDue = nextDueDate(plant, logs, 'water');
  const fertDue = nextDueDate(plant, logs, 'fertilize');
  const today = startOfDay(new Date());
  const waterDays = differenceInCalendarDays(waterDue, today);
  const fertDays = differenceInCalendarDays(fertDue, today);

  const galleryUris = [
    ...(plant.photoUri ? [{ uri: plant.photoUri, key: 'hero', label: 'Portrait' }] : []),
    ...photos
      .filter((p) => p.photoUri)
      .map((p) => ({
        uri: p.photoUri as string,
        key: p.id,
        label: format(parseISO(p.createdAt), 'MMM d, yyyy'),
      })),
  ];

  return (
    <>
      <Stack.Screen options={{ title: plant.name }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          {plant.photoUri ? (
            <Image source={{ uri: plant.photoUri }} style={styles.hero} contentFit="cover" />
          ) : (
            <View style={[styles.hero, styles.heroEmpty, { backgroundColor: c.surfaceAlt }]}>
              <Text style={{ fontSize: 64 }}>🪴</Text>
            </View>
          )}
          <View style={styles.heroOverlay}>
            <Text style={[Type.micro, { color: 'rgba(255,255,255,0.8)' }]}>
              {plant.category}
              {plant.location ? ` · ${plant.location}` : ''}
            </Text>
            <Text style={[Type.displayM, { color: '#fff', fontSize: 28, marginTop: 4 }]}>
              {plant.name}
            </Text>
            <Text style={[Type.latin, { color: 'rgba(255,255,255,0.9)', marginTop: 2 }]}>
              {plant.species || plant.category}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.dueRow}>
            <DueCard
              emoji="💧"
              title="Water"
              value={formatRelativeCare(waterDays)}
              accent={waterDays < 0 ? c.danger : waterDays === 0 ? c.growth : c.tint}
              bg={c.surface}
              border={c.border}
              muted={c.textMuted}
            />
            <DueCard
              emoji="🌿"
              title="Fertilize"
              value={formatRelativeCare(fertDays)}
              accent={fertDays < 0 ? c.danger : c.text}
              bg={c.surface}
              border={c.border}
              muted={c.textMuted}
            />
          </View>

          {plant.notes ? (
            <Text style={[Type.bodySmall, { color: c.textMuted }]}>{plant.notes}</Text>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              label="💧 Watered"
              onPress={() =>
                router.push({
                  pathname: '/plant/log',
                  params: { plantId: plant.id, type: 'water' },
                })
              }
              style={styles.actionBtn}
            />
            <PrimaryButton
              label="🌿 Fed"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/plant/log',
                  params: { plantId: plant.id, type: 'fertilize' },
                })
              }
              style={styles.actionBtn}
            />
          </View>
          <PrimaryButton
            label="Add note or photo"
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/plant/log',
                params: { plantId: plant.id, type: 'note' },
              })
            }
          />

          <View style={[styles.tabs, { backgroundColor: c.surfaceAlt }]}>
            <Pressable
              onPress={() => setTab('log')}
              style={[styles.tab, tab === 'log' && { backgroundColor: c.surface }]}
            >
              <Text style={[Type.meta, { color: c.text, fontFamily: Fonts.bodySemi }]}>
                Care log
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('gallery')}
              style={[styles.tab, tab === 'gallery' && { backgroundColor: c.surface }]}
            >
              <Text style={[Type.meta, { color: c.text, fontFamily: Fonts.bodySemi }]}>
                Progress
              </Text>
            </Pressable>
          </View>

          {tab === 'log' ? (
            plantLogs.length === 0 ? (
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 8 }]}>
                No care entries yet. Log watering, feeding, notes, and photos as you go.
              </Text>
            ) : (
              plantLogs.map((log) => <CareLogRow key={log.id} log={log} />)
            )
          ) : galleryUris.length === 0 ? (
            <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 8 }]}>
              Add a portrait or care photos to watch growth over time.
            </Text>
          ) : (
            <View style={styles.gallery}>
              {galleryUris.map((item) => (
                <View key={item.key} style={styles.galleryItem}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                  <Text style={[Type.meta, { color: c.textMuted, marginTop: 6, marginLeft: 2 }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function DueCard({
  emoji,
  title,
  value,
  bg,
  border,
  muted,
  accent,
}: {
  emoji: string;
  title: string;
  value: string;
  bg: string;
  border: string;
  muted: string;
  accent: string;
}) {
  return (
    <View style={[styles.dueCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={[Type.micro, { color: muted, marginTop: 2, letterSpacing: 0.8 }]}>
        {title}
      </Text>
      <Text style={[Type.title, { color: accent, fontSize: 14, marginTop: 4 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroWrap: {
    width: '100%',
    height: width * 0.95,
    position: 'relative',
  },
  hero: { width: '100%', height: '100%' },
  heroEmpty: { alignItems: 'center', justifyContent: 'center' },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(15,22,18,0.55)',
  },
  body: { padding: 16, gap: 12 },
  dueRow: { flexDirection: 'row', gap: 10 },
  dueCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, minHeight: 44 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  galleryItem: { width: (width - 42) / 2 },
  galleryImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
  },
});
