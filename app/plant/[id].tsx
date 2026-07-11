import { useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { CareLogRow } from '@/components/CareLogRow';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  formatRelativeCare,
  getPlantLogs,
  getProgressPhotos,
  nextDueDate,
} from '@/lib/care';
import { createId } from '@/lib/storage';
import {
  askCareCoach,
  generateCareGuide,
  identifyPlantFromPhoto,
  type CareCoachResult,
  type CareGuideResult,
} from '@/lib/openrouter';
import { usePlants } from '@/lib/PlantContext';
import { MAX_COACH_HISTORY, type StoredCoachEntry } from '@/lib/types';
import { plantAgeDays } from '@/lib/stats';

const { width } = Dimensions.get('window');

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const navigation = useNavigation();
  const {
    getPlant,
    logs,
    deletePlant,
    deleteCareLog,
    updatePlant,
    consumeAiUse,
    canUseAi,
  } = usePlants();
  const plant = getPlant(id);
  const [tab, setTab] = useState<'log' | 'gallery' | 'ai'>('log');
  const [question, setQuestion] = useState(
    'How is this plant doing? What should I do next?'
  );
  const [coachLoading, setCoachLoading] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [coach, setCoach] = useState<CareCoachResult | null>(null);
  const [lightbox, setLightbox] = useState<{ uri: string; label: string } | null>(
    null
  );

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
          <View style={{ flexDirection: 'row', gap: 14, marginRight: 4 }}>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/plant/edit', params: { plantId: plant.id } })
              }
            >
              <Text style={{ color: '#FFFFFF', fontFamily: Fonts.bodySemi, fontSize: 15 }}>
                Edit
              </Text>
            </Pressable>
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
              <Text style={{ color: '#FFB4A8', fontFamily: Fonts.bodySemi, fontSize: 15 }}>
                Delete
              </Text>
            </Pressable>
          </View>
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

  const guide: CareGuideResult | null = plant.aiGuide
    ? {
        title: plant.aiGuide.title,
        light: plant.aiGuide.light,
        water: plant.aiGuide.water,
        humidity: plant.aiGuide.humidity,
        soil: plant.aiGuide.soil,
        tips: plant.aiGuide.tips,
        disclaimer: plant.aiGuide.disclaimer,
      }
    : null;

  const waterDue = nextDueDate(plant, logs, 'water');
  const fertDue = nextDueDate(plant, logs, 'fertilize');
  const today = startOfDay(new Date());
  const waterDays = differenceInCalendarDays(waterDue, today);
  const fertDays = differenceInCalendarDays(fertDue, today);
  const ageDays = plantAgeDays(plant);

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

  const ensureAiQuota = async () => {
    if (!canUseAi) {
      Alert.alert(
        'Premium required',
        'AI assist is included with Premium. Unlock Premium in Settings.'
      );
      return false;
    }
    const quota = await consumeAiUse();
    if (!quota.ok) {
      Alert.alert('AI limit', quota.reason);
      return false;
    }
    return true;
  };

  const runCoach = async () => {
    setCoachLoading(true);
    try {
      if (!(await ensureAiQuota())) return;
      const result = await askCareCoach({
        plant,
        logs: plantLogs,
        question: question.trim() || 'How is this plant doing?',
        photoUri: plant.photoUri,
      });
      setCoach(result);
      const entry: StoredCoachEntry = {
        id: createId(),
        question: question.trim() || 'How is this plant doing?',
        assessment: result.assessment,
        recommendations: result.recommendations,
        urgency: result.urgency,
        disclaimer: result.disclaimer,
        createdAt: new Date().toISOString(),
      };
      const history = [entry, ...(plant.aiCoachHistory ?? [])].slice(
        0,
        MAX_COACH_HISTORY
      );
      await updatePlant(plant.id, { aiCoachHistory: history });
    } catch (e) {
      Alert.alert('Care coach failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setCoachLoading(false);
    }
  };

  const runGuide = async () => {
    setGuideLoading(true);
    try {
      if (!(await ensureAiQuota())) return;
      const result = await generateCareGuide(plant);
      await updatePlant(plant.id, {
        aiGuide: {
          ...result,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (e) {
      Alert.alert('Care guide failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setGuideLoading(false);
    }
  };

  const runReIdentify = async () => {
    if (!plant.photoUri) {
      Alert.alert('Photo needed', 'Add a plant photo first (Edit).');
      return;
    }
    setIdLoading(true);
    try {
      if (!(await ensureAiQuota())) return;
      const result = await identifyPlantFromPhoto(plant.photoUri);
      await updatePlant(plant.id, {
        species: result.scientificName || plant.species,
        category: result.category,
        waterIntervalDays: result.waterIntervalDays,
        fertilizeIntervalDays: result.fertilizeIntervalDays,
        aiIdentityConfidence: result.confidence,
        notes: result.careSummary
          ? plant.notes.includes(result.careSummary)
            ? plant.notes
            : `${plant.notes ? plant.notes + '\n\n' : ''}AI: ${result.careSummary}`
          : plant.notes,
      });
      Alert.alert(
        'Updated from AI',
        `${result.commonName}${result.scientificName ? ` · ${result.scientificName}` : ''}\nConfidence: ${result.confidence}`
      );
    } catch (e) {
      Alert.alert('Identify failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIdLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: plant.name }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() =>
            plant.photoUri &&
            setLightbox({ uri: plant.photoUri, label: plant.name })
          }
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
                {ageDays > 0 ? ` · ${ageDays}d with you` : ''}
              </Text>
              <Text style={[Type.displayM, { color: '#fff', fontSize: 28, marginTop: 4 }]}>
                {plant.name}
              </Text>
              <Text style={[Type.latin, { color: 'rgba(255,255,255,0.9)', marginTop: 2 }]}>
                {plant.species || plant.category}
              </Text>
            </View>
          </View>
        </Pressable>

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
            {(['log', 'gallery', 'ai'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && { backgroundColor: c.surface }]}
              >
                <Text style={[Type.meta, { color: c.text, fontFamily: Fonts.bodySemi }]}>
                  {t === 'log' ? 'Care log' : t === 'gallery' ? 'Progress' : 'AI assist'}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === 'log' ? (
            plantLogs.length === 0 ? (
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 8 }]}>
                No care entries yet. Log watering, feeding, notes, and photos as you go.
              </Text>
            ) : (
              plantLogs.map((log) => (
                <CareLogRow key={log.id} log={log} onDelete={deleteCareLog} />
              ))
            )
          ) : null}

          {tab === 'gallery' ? (
            galleryUris.length === 0 ? (
              <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 8 }]}>
                Add a portrait or care photos to watch growth over time.
              </Text>
            ) : (
              <View style={styles.gallery}>
                {galleryUris.map((item) => (
                  <Pressable
                    key={item.key}
                    style={styles.galleryItem}
                    onPress={() => setLightbox({ uri: item.uri, label: item.label })}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.galleryImage}
                      contentFit="cover"
                    />
                    <Text style={[Type.meta, { color: c.textMuted, marginTop: 6, marginLeft: 2 }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )
          ) : null}

          {tab === 'ai' ? (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Text style={[Type.meta, { color: c.textMuted }]}>
                {canUseAi
                  ? 'Premium AI · requests go to Verdant servers (key not on device)'
                  : 'Premium required for AI · educational only'}
              </Text>

              <View style={[styles.aiCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[Type.title, { color: c.text }]}>Re-identify from photo</Text>
                <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4, marginBottom: 10 }]}>
                  Update species, category, and intervals using the current portrait.
                  {plant.aiIdentityConfidence
                    ? ` Last confidence: ${plant.aiIdentityConfidence}.`
                    : ''}
                </Text>
                <PrimaryButton
                  label={idLoading ? 'Identifying…' : '✨ AI re-identify'}
                  onPress={runReIdentify}
                  loading={idLoading}
                  variant="secondary"
                />
              </View>

              <View style={[styles.aiCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[Type.title, { color: c.text }]}>Species care guide</Text>
                <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4, marginBottom: 10 }]}>
                  Saved on this plant after generation.
                  {plant.aiGuide?.generatedAt
                    ? ` Last: ${format(parseISO(plant.aiGuide.generatedAt), 'MMM d, yyyy')}.`
                    : ''}
                </Text>
                <PrimaryButton
                  label={
                    guideLoading
                      ? 'Writing…'
                      : guide
                        ? '✨ Refresh care guide'
                        : '✨ Generate care guide'
                  }
                  onPress={runGuide}
                  loading={guideLoading}
                  variant="secondary"
                />
                {guideLoading ? <ActivityIndicator color={c.tint} style={{ marginTop: 10 }} /> : null}
                {guide ? (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    <Text style={[Type.title, { color: c.text }]}>{guide.title}</Text>
                    <GuideLine label="Light" body={guide.light} muted={c.textMuted} text={c.text} />
                    <GuideLine label="Water" body={guide.water} muted={c.textMuted} text={c.text} />
                    <GuideLine label="Humidity" body={guide.humidity} muted={c.textMuted} text={c.text} />
                    <GuideLine label="Soil" body={guide.soil} muted={c.textMuted} text={c.text} />
                    {guide.tips.map((t, i) => (
                      <Text key={i} style={[Type.bodySmall, { color: c.text }]}>
                        • {t}
                      </Text>
                    ))}
                    <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>
                      {guide.disclaimer}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={[styles.aiCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[Type.title, { color: c.text }]}>Care coach</Text>
                <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 4, marginBottom: 8 }]}>
                  Uses log history and portrait. Answers are saved on this plant.
                </Text>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  placeholder="e.g. Yellow tips on new leaves — what should I check?"
                  placeholderTextColor={c.textMuted}
                  style={[
                    styles.question,
                    {
                      color: c.text,
                      backgroundColor: c.surfaceAlt,
                      borderColor: c.border,
                      fontFamily: Fonts.body,
                    },
                  ]}
                />
                <PrimaryButton
                  label={coachLoading ? 'Thinking…' : '✨ Ask care coach'}
                  onPress={runCoach}
                  loading={coachLoading}
                />
                {coach ? <CoachBlock result={coach} c={c} isLatest /> : null}
                {(plant.aiCoachHistory?.length ?? 0) > 0 ? (
                  <View style={{ marginTop: 16, gap: 10 }}>
                    <Text style={[Type.micro, { color: c.textMuted }]}>Saved answers</Text>
                    {plant.aiCoachHistory!.map((h) => (
                      <View
                        key={h.id}
                        style={[
                          styles.historyItem,
                          { borderColor: c.border, backgroundColor: c.surfaceAlt },
                        ]}
                      >
                        <Text style={[Type.meta, { color: c.textMuted }]}>
                          {format(parseISO(h.createdAt), 'MMM d · h:mm a')} · {h.urgency}
                        </Text>
                        <Text style={[Type.title, { color: c.text, fontSize: 14, marginTop: 4 }]}>
                          {h.question}
                        </Text>
                        <Text style={[Type.bodySmall, { color: c.text, marginTop: 6 }]}>
                          {h.assessment}
                        </Text>
                        {h.recommendations.map((r, i) => (
                          <Text key={i} style={[Type.bodySmall, { color: c.text, marginTop: 2 }]}>
                            • {r}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <PhotoLightbox
        uri={lightbox?.uri ?? null}
        label={lightbox?.label}
        visible={!!lightbox}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}

function CoachBlock({
  result,
  c,
  isLatest,
}: {
  result: CareCoachResult;
  c: (typeof Colors)['light'];
  isLatest?: boolean;
}) {
  return (
    <View style={{ marginTop: 12, gap: 8 }}>
      {isLatest ? (
        <Text style={[Type.micro, { color: urgencyColor(result.urgency, c) }]}>
          Urgency · {result.urgency}
        </Text>
      ) : null}
      <Text style={[Type.body, { color: c.text }]}>{result.assessment}</Text>
      {result.recommendations.map((r, i) => (
        <Text key={i} style={[Type.bodySmall, { color: c.text }]}>
          • {r}
        </Text>
      ))}
      <Text style={[Type.meta, { color: c.textMuted }]}>{result.disclaimer}</Text>
    </View>
  );
}

function GuideLine({
  label,
  body,
  muted,
  text,
}: {
  label: string;
  body: string;
  muted: string;
  text: string;
}) {
  return (
    <View>
      <Text style={[Type.micro, { color: muted }]}>{label}</Text>
      <Text style={[Type.bodySmall, { color: text, marginTop: 2 }]}>{body}</Text>
    </View>
  );
}

function urgencyColor(
  u: CareCoachResult['urgency'],
  c: (typeof Colors)['light']
): string {
  if (u === 'urgent') return c.danger;
  if (u === 'soon') return c.growth;
  if (u === 'watch') return c.tint;
  return c.textMuted;
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
  aiCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  question: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 10,
    fontSize: 15,
  },
  historyItem: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
});
