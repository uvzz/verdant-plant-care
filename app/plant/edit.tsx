import React, { useEffect, useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
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
import { effectiveWaterIntervalDays } from '@/lib/care';

export default function EditPlantScreen() {
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { getPlant, updatePlant, familyMembers } = usePlants();
  const plant = getPlant(plantId);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState<PlantCategory>('Houseplant');
  const [location, setLocation] = useState('');
  const [acquiredDate, setAcquiredDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [waterDays, setWaterDays] = useState('7');
  const [fertDays, setFertDays] = useState('30');
  const [lightLevel, setLightLevel] = useState<LightLevel>('medium');
  const [potSize, setPotSize] = useState<PotSize>('medium');
  const [petToxicity, setPetToxicity] = useState<PetToxicity>('unknown');
  const [checkBeforeWater, setCheckBeforeWater] = useState(true);
  const [caretakerId, setCaretakerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!plant) return;
    setName(plant.name);
    setSpecies(plant.species);
    setCategory(plant.category);
    setLocation(plant.location);
    setAcquiredDate(plant.acquiredDate);
    setNotes(plant.notes);
    setPhotoUri(plant.photoUri);
    setWaterDays(String(plant.waterIntervalDays));
    setFertDays(String(plant.fertilizeIntervalDays));
    setLightLevel(plant.lightLevel ?? 'medium');
    setPotSize(plant.potSize ?? 'medium');
    setPetToxicity(plant.petToxicity ?? 'unknown');
    setCheckBeforeWater(plant.checkBeforeWater !== false);
    setCaretakerId(plant.caretakerId ?? null);
  }, [plant]);

  const intervals = useMemo(() => DEFAULT_INTERVALS[category], [category]);

  if (!plant) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[Type.body, { color: c.textMuted }]}>Plant not found.</Text>
      </View>
    );
  }

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access.');
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
    const { requestCameraCapture } = await import('@/lib/cameraBridge');
    const pending = requestCameraCapture();
    router.push('/camera');
    const uri = await pending;
    if (uri) setPhotoUri(uri);
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your plant a name.');
      return;
    }
    setSaving(true);
    await updatePlant(plant.id, {
      name: name.trim(),
      species: species.trim(),
      category,
      photoUri,
      acquiredDate,
      location: location.trim(),
      waterIntervalDays: Math.max(1, parseInt(waterDays, 10) || intervals.water),
      fertilizeIntervalDays: Math.max(1, parseInt(fertDays, 10) || intervals.fertilize),
      notes: notes.trim(),
      lightLevel,
      potSize,
      petToxicity,
      checkBeforeWater,
      caretakerId,
    });
    setSaving(false);
    router.back();
  };

  const previewInterval = effectiveWaterIntervalDays({
    ...plant,
    waterIntervalDays: Math.max(1, parseInt(waterDays, 10) || intervals.water),
    lightLevel,
    potSize,
  });

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
        <Pressable onPress={pickPhoto} style={[styles.photo, { borderColor: c.border }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImg} contentFit="cover" />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: c.surfaceAlt }]}>
              <Text style={[Type.meta, { color: c.textMuted }]}>Add photo</Text>
            </View>
          )}
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <PrimaryButton label="Library" variant="secondary" onPress={pickPhoto} style={{ flex: 1 }} />
          <PrimaryButton label="Camera" variant="secondary" onPress={takePhoto} style={{ flex: 1 }} />
        </View>

        <Field label="Name" color={c.textMuted}>
          <TextInput value={name} onChangeText={setName} style={inputStyle} />
        </Field>
        <Field label="Species" color={c.textMuted}>
          <TextInput value={species} onChangeText={setSpecies} style={inputStyle} />
        </Field>
        <Field label="Category" color={c.textMuted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {PLANT_CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? c.night : c.surface,
                      borderColor: active ? c.night : c.border,
                    },
                  ]}
                >
                  <Text style={[Type.meta, { color: active ? c.background : c.text, fontFamily: Fonts.bodySemi }]}>
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
        <DateField label="Acquired date" value={acquiredDate} onChange={setAcquiredDate} />

        <Field label="Light at this spot" color={c.textMuted}>
          <ChipRow
            options={LIGHT_LEVELS}
            value={lightLevel}
            labels={LIGHT_LABELS}
            activeBg={c.night}
            activeFg={c.background}
            idleBg={c.surface}
            idleFg={c.text}
            border={c.border}
            onChange={setLightLevel}
          />
        </Field>
        <Field label="Pot size" color={c.textMuted}>
          <ChipRow
            options={POT_SIZES}
            value={potSize}
            labels={POT_LABELS}
            activeBg={c.night}
            activeFg={c.background}
            idleBg={c.surface}
            idleFg={c.text}
            border={c.border}
            onChange={setPotSize}
          />
        </Field>
        <Field label="Pet safety" color={c.textMuted}>
          <ChipRow
            options={PET_TOXICITY}
            value={petToxicity}
            labels={PET_LABELS}
            activeBg={c.night}
            activeFg={c.background}
            idleBg={c.surface}
            idleFg={c.text}
            border={c.border}
            onChange={setPetToxicity}
          />
        </Field>

        <View style={styles.row2}>
          <View style={styles.half}>
            <Field label="Base water (days)" color={c.textMuted}>
              <TextInput value={waterDays} onChangeText={setWaterDays} keyboardType="number-pad" style={inputStyle} />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label="Fertilize every (days)" color={c.textMuted}>
              <TextInput value={fertDays} onChangeText={setFertDays} keyboardType="number-pad" style={inputStyle} />
            </Field>
          </View>
        </View>
        <Text style={[Type.meta, { color: c.tint, marginBottom: 12 }]}>
          Effective water rhythm ≈ every {previewInterval} days (adjusted for light + pot —
          beats blind schedules that overwater).
        </Text>

        <Pressable
          onPress={() => setCheckBeforeWater((v) => !v)}
          style={[
            styles.checkRow,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={{ fontSize: 18 }}>{checkBeforeWater ? '✅' : '⬜️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[Type.title, { color: c.text, fontSize: 14 }]}>
              Check soil before watering
            </Text>
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 2 }]}>
              Calendar shows “Still moist” snooze — core Verdant vs Planta difference.
            </Text>
          </View>
        </Pressable>

        {familyMembers.length > 0 ? (
          <Field label="Family caretaker" color={c.textMuted}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Pressable
                onPress={() => setCaretakerId(null)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: !caretakerId ? c.night : c.surface,
                    borderColor: !caretakerId ? c.night : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Type.meta,
                    {
                      color: !caretakerId ? c.background : c.text,
                      fontFamily: Fonts.bodySemi,
                    },
                  ]}
                >
                  Anyone
                </Text>
              </Pressable>
              {familyMembers.map((m) => {
                const active = caretakerId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setCaretakerId(m.id)}
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
                      {m.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Field>
        ) : null}

        <Field label="Notes" color={c.textMuted}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[inputStyle, styles.multiline]}
          />
        </Field>
        <PrimaryButton label="Save changes" onPress={onSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ChipRow<T extends string>({
  options,
  value,
  labels,
  activeBg,
  activeFg,
  idleBg,
  idleFg,
  border,
  onChange,
}: {
  options: readonly T[];
  value: T;
  labels: Record<T, string>;
  activeBg: string;
  activeFg: string;
  idleBg: string;
  idleFg: string;
  border: string;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? activeBg : idleBg,
                borderColor: active ? activeBg : border,
              },
            ]}
          >
            <Text
              style={[
                Type.meta,
                {
                  color: active ? activeFg : idleFg,
                  fontFamily: Fonts.bodySemi,
                },
              ]}
            >
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 48 },
  photo: {
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  photoImg: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
});
