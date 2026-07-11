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
import { format, parseISO } from 'date-fns';

import Colors from '@/constants/Colors';
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
import { differenceInCalendarDays, startOfDay } from 'date-fns';

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
      title: plant?.name ?? 'Plant',
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
            <Text style={{ color: c.danger, fontSize: 16 }}>Delete</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, plant, deletePlant, router, c.danger]);

  if (!plant) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.textMuted }}>Plant not found.</Text>
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
          <View style={[styles.heroOverlay, { backgroundColor: 'rgba(0,0,0,0.28)' }]}>
            <Text style={styles.heroName}>{plant.name}</Text>
            <Text style={styles.heroSpecies}>
              {plant.species || plant.category}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <MetaChip label={plant.category} bg={c.surfaceAlt} color={c.text} />
            {plant.location ? (
              <MetaChip label={plant.location} bg={c.surfaceAlt} color={c.textMuted} />
            ) : null}
            <MetaChip
              label={`Since ${format(parseISO(plant.acquiredDate), 'MMM yyyy')}`}
              bg={c.surfaceAlt}
              color={c.textMuted}
            />
          </View>

          <View style={styles.dueRow}>
            <DueCard
              emoji="💧"
              title="Water"
              value={formatRelativeCare(waterDays)}
              bg={c.surface}
              border={c.border}
              text={c.text}
              muted={c.textMuted}
              accent={waterDays < 0 ? c.danger : c.sky}
            />
            <DueCard
              emoji="🌿"
              title="Fertilize"
              value={formatRelativeCare(fertDays)}
              bg={c.surface}
              border={c.border}
              text={c.text}
              muted={c.textMuted}
              accent={fertDays < 0 ? c.danger : c.tint}
            />
          </View>

          {plant.notes ? (
            <Text style={[styles.notes, { color: c.textMuted }]}>{plant.notes}</Text>
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
              label="🌿 Fertilized"
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
              style={[
                styles.tab,
                tab === 'log' && { backgroundColor: c.surface },
              ]}
            >
              <Text style={{ color: c.text, fontWeight: '600' }}>Care log</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('gallery')}
              style={[
                styles.tab,
                tab === 'gallery' && { backgroundColor: c.surface },
              ]}
            >
              <Text style={{ color: c.text, fontWeight: '600' }}>Progress</Text>
            </Pressable>
          </View>

          {tab === 'log' ? (
            plantLogs.length === 0 ? (
              <Text style={[styles.empty, { color: c.textMuted }]}>
                No care entries yet. Log watering, feeding, notes, and photos as you go.
              </Text>
            ) : (
              plantLogs.map((log) => <CareLogRow key={log.id} log={log} />)
            )
          ) : galleryUris.length === 0 ? (
            <Text style={[styles.empty, { color: c.textMuted }]}>
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
                  <Text style={[styles.galleryLabel, { color: c.textMuted }]}>
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

function MetaChip({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 13, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function DueCard({
  emoji,
  title,
  value,
  bg,
  border,
  text,
  muted,
  accent,
}: {
  emoji: string;
  title: string;
  value: string;
  bg: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}) {
  return (
    <View style={[styles.dueCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={styles.dueEmoji}>{emoji}</Text>
      <Text style={[styles.dueTitle, { color: muted }]}>{title}</Text>
      <Text style={[styles.dueValue, { color: accent || text }]}>{value}</Text>
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
  },
  heroName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSpecies: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 2,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  dueRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dueCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 2,
  },
  dueEmoji: { fontSize: 18 },
  dueTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  dueValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  notes: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  galleryItem: {
    width: (width - 42) / 2,
  },
  galleryImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  galleryLabel: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },
});
