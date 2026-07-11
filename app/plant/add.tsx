import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { identifyPlantFromPhoto } from '@/lib/openrouter';
import { usePlants } from '@/lib/PlantContext';
import {
  DEFAULT_INTERVALS,
  LIGHT_LABELS,
  LIGHT_LEVELS,
  PET_LABELS,
  PET_TOXICITY,
  PLANT_CATEGORIES,
  POT_LABELS,
  POT_SIZES,
  type LightLevel,
  type PetToxicity,
  type PlantCategory,
  type PotSize,
} from '@/lib/types';

export default function AddPlantScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { addPlant, canAddPlant, consumeAiUse, canUseAi } = usePlants();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState<PlantCategory>('Houseplant');
  const [location, setLocation] = useState('');
  const [acquiredDate, setAcquiredDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [lightLevel, setLightLevel] = useState<LightLevel>('medium');
  const [potSize, setPotSize] = useState<PotSize>('medium');
  const [petToxicity, setPetToxicity] = useState<PetToxicity>('unknown');
  const [saving, setSaving] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  const intervals = useMemo(() => DEFAULT_INTERVALS[category], [category]);
  const [waterDays, setWaterDays] = useState(String(intervals.water));
  const [fertDays, setFertDays] = useState(String(intervals.fertilize));

  const onCategory = (cat: PlantCategory) => {
    setCategory(cat);
    setWaterDays(String(DEFAULT_INTERVALS[cat].water));
    setFertDays(String(DEFAULT_INTERVALS[cat].fertilize));
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add a plant photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to photograph your plant.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const onIdentify = async () => {
    if (!photoUri) {
      Alert.alert('Photo needed', 'Add a plant photo first, then run AI identify.');
      return;
    }
    if (!canUseAi) {
      Alert.alert(
        'Premium required',
        'AI plant identify is a Premium feature. Unlock Premium in Settings.'
      );
      return;
    }
    setIdentifying(true);
    setAiHint(null);
    try {
      const quota = await consumeAiUse();
      if (!quota.ok) {
        Alert.alert('AI limit', quota.reason);
        return;
      }
      const result = await identifyPlantFromPhoto(photoUri);
      if (!name.trim()) setName(result.commonName);
      setSpecies(result.scientificName);
      setCategory(result.category);
      setWaterDays(String(result.waterIntervalDays));
      setFertDays(String(result.fertilizeIntervalDays));
      setLightLevel(result.lightLevel);
      setPetToxicity(result.petToxicity);
      if (result.careSummary) {
        setNotes((prev) =>
          prev.trim()
            ? `${prev.trim()}\n\nAI: ${result.careSummary}`
            : `AI: ${result.careSummary}`
        );
      }
      setAiHint(
        `${result.confidence} confidence · ${result.commonName}${
          result.scientificName ? ` (${result.scientificName})` : ''
        } · light ${result.lightLevel} · pets ${result.petToxicity}`
      );
    } catch (e) {
      Alert.alert('AI identify failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIdentifying(false);
    }
  };

  const onSave = async () => {
    if (!canAddPlant) {
      Alert.alert('Plant limit', 'Upgrade to Premium for unlimited plants.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your plant a name.');
      return;
    }
    setSaving(true);
    const result = await addPlant({
      name: name.trim(),
      species: species.trim(),
      category,
      photoUri,
      acquiredDate: acquiredDate || format(new Date(), 'yyyy-MM-dd'),
      location: location.trim(),
      waterIntervalDays: Math.max(1, parseInt(waterDays, 10) || intervals.water),
      fertilizeIntervalDays: Math.max(1, parseInt(fertDays, 10) || intervals.fertilize),
      notes: notes.trim(),
      lightLevel,
      potSize,
      petToxicity,
      checkBeforeWater: true,
    });
    setSaving(false);
    if (!result.ok) {
      Alert.alert('Could not add plant', result.reason);
      return;
    }
    router.replace(`/plant/${result.plant.id}`);
  };

  const inputStyle = [
    styles.input,
    {
      color: c.text,
      backgroundColor: c.surface,
      borderColor: c.border,
      fontFamily: Fonts.body,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={pickPhoto}
          style={[
            styles.photo,
            {
              backgroundColor: photoUri ? 'transparent' : c.surfaceAlt,
              borderColor: c.border,
              borderStyle: photoUri ? 'solid' : 'dashed',
            },
          ]}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImg} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 28 }}>📷</Text>
              <Text style={[Type.meta, { color: c.textMuted }]}>Tap to choose a photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.photoActions}>
          <PrimaryButton label="Library" variant="secondary" onPress={pickPhoto} style={styles.half} />
          <PrimaryButton label="Camera" variant="secondary" onPress={takePhoto} style={styles.half} />
        </View>

        <PrimaryButton
          label={
            identifying
              ? 'Identifying…'
              : canUseAi
                ? '✨ AI identify plant (Premium)'
                : '✨ AI identify (Premium only)'
          }
          variant="secondary"
          onPress={onIdentify}
          loading={identifying}
          disabled={!photoUri || identifying}
          style={{ marginBottom: 8 }}
        />
        {aiHint ? (
          <Text style={[Type.meta, { color: c.tint, marginBottom: 12 }]}>{aiHint}</Text>
        ) : (
          <Text style={[Type.meta, { color: c.textMuted, marginBottom: 12 }]}>
            Premium: AI fills name, species, category, and intervals from your photo. Key stays
            on Verdant’s servers.
          </Text>
        )}

        <Field label="Name" color={c.textMuted}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Moonlight"
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label="Species" color={c.textMuted}>
          <TextInput
            value={species}
            onChangeText={setSpecies}
            placeholder="e.g. Philodendron hederaceum"
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label="Category" color={c.textMuted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {PLANT_CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <Pressable
                  key={cat}
                  onPress={() => onCategory(cat)}
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
                      { color: active ? c.background : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Room / location" color={c.textMuted}>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Living room · east window"
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label="Light at this spot" color={c.textMuted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {LIGHT_LEVELS.map((lv) => {
              const active = lv === lightLevel;
              return (
                <Pressable
                  key={lv}
                  onPress={() => setLightLevel(lv)}
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
                      { color: active ? c.background : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {LIGHT_LABELS[lv]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Pot size" color={c.textMuted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {POT_SIZES.map((sz) => {
              const active = sz === potSize;
              return (
                <Pressable
                  key={sz}
                  onPress={() => setPotSize(sz)}
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
                      { color: active ? c.background : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {POT_LABELS[sz]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Pet safety" color={c.textMuted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {PET_TOXICITY.map((tx) => {
              const active = tx === petToxicity;
              return (
                <Pressable
                  key={tx}
                  onPress={() => setPetToxicity(tx)}
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
                      { color: active ? c.background : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {PET_LABELS[tx]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <DateField label="Acquired date" value={acquiredDate} onChange={setAcquiredDate} />

        <View style={styles.row2}>
          <View style={styles.half}>
            <Field label="Water every (days)" color={c.textMuted}>
              <TextInput
                value={waterDays}
                onChangeText={setWaterDays}
                keyboardType="number-pad"
                style={inputStyle}
              />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label="Fertilize every (days)" color={c.textMuted}>
              <TextInput
                value={fertDays}
                onChangeText={setFertDays}
                keyboardType="number-pad"
                style={inputStyle}
              />
            </Field>
          </View>
        </View>
        <Text style={[Type.meta, { color: c.textMuted, marginBottom: 12 }]}>
          Schedules adapt to light + pot size. Calendar uses check-before-water (not blind
          “water now” like most care apps).
        </Text>

        <Field label="Notes" color={c.textMuted}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Soil mix, provenance…"
            placeholderTextColor={c.textMuted}
            multiline
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <PrimaryButton label="Save plant" onPress={onSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[Type.micro, { color, letterSpacing: 0.8 }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 48 },
  photo: {
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: 10,
  },
  photoImg: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoActions: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  field: { marginBottom: 12, gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    height: 44,
  },
  multiline: { minHeight: 90, height: undefined, textAlignVertical: 'top' },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row2: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
