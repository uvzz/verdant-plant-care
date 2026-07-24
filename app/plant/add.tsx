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
import { ImagePlus, Sparkles } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { identifyPlantFromPhoto } from '@/lib/openrouter';
import { mergeAiNote } from '@/lib/aiParse';
import { usePlants } from '@/lib/PlantContext';
import { useI18n } from '@/lib/i18n';
import {
  DEFAULT_INTERVALS,
  LIGHT_LEVELS,
  PET_TOXICITY,
  PLANT_CATEGORIES,
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
  const { t } = useI18n();
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
      Alert.alert(t('form.photoPermissionTitle'), t('form.photoPermissionBody'));
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

  const onIdentify = async () => {
    if (!photoUri) {
      Alert.alert(t('form.photoNeededTitle'), t('form.photoNeededBody'));
      return;
    }
    if (!canUseAi) {
      router.push({ pathname: '/paywall', params: { reason: 'ai' } });
      return;
    }
    setIdentifying(true);
    setAiHint(null);
    try {
      const quota = await consumeAiUse();
      if (!quota.ok) {
        Alert.alert(t('form.aiLimitTitle'), quota.reason);
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
        setNotes((prev) => mergeAiNote(prev, result.careSummary));
      }
      setAiHint(
        t(
          result.scientificName ? 'form.aiHintResultWithScientific' : 'form.aiHintResult',
          {
            commonName: result.commonName,
            scientificName: result.scientificName,
            confidence: t(`domain.confidence.${result.confidence}`),
            light: t(`domain.light.${result.lightLevel}`),
            pets: t(`domain.pet.${result.petToxicity}`),
          }
        )
      );
    } catch (e) {
      Alert.alert(
        t('form.identifyFailedTitle'),
        e instanceof Error ? e.message : t('form.unknownError')
      );
    } finally {
      setIdentifying(false);
    }
  };

  const onSave = async () => {
    if (!canAddPlant) {
      router.push({ pathname: '/paywall', params: { reason: 'limit' } });
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert(t('form.nameRequiredTitle'), t('form.nameRequiredBody'));
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
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
      if (!result.ok) {
        Alert.alert(t('form.addFailedTitle'), result.reason);
        return;
      }
      router.replace(`/plant/${result.plant.id}`);
    } catch {
      Alert.alert(t('form.addFailedTitle'), t('form.retryBody'));
    } finally {
      setSaving(false);
    }
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
              <ImagePlus color={c.tint} size={30} strokeWidth={1.8} />
              <Text style={[Type.meta, { color: c.textMuted }]}>{t('form.photoPlaceholderAdd')}</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.photoActions}>
          <PrimaryButton label={t('form.library')} variant="secondary" onPress={pickPhoto} style={styles.half} />
          <PrimaryButton label={t('form.camera')} variant="secondary" onPress={takePhoto} style={styles.half} />
        </View>

        <PrimaryButton
          label={
            identifying
              ? t('form.aiIdentifyLoading')
              : canUseAi
                ? t('form.aiIdentifyButtonPremium')
                : t('form.aiIdentifyButtonPremiumOnly')
          }
          icon={<Sparkles color={c.text} size={16} strokeWidth={2.2} />}
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
            {t('form.aiIdentifyHint')}
          </Text>
        )}

        <Field label={t('form.labelName')} color={c.textMuted}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('form.placeholderName')}
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label={t('form.labelSpecies')} color={c.textMuted}>
          <TextInput
            value={species}
            onChangeText={setSpecies}
            placeholder={t('form.placeholderSpecies')}
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label={t('form.labelCategory')} color={c.textMuted}>
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
                      backgroundColor: active ? c.emphasis : c.surface,
                      borderColor: active ? c.emphasis : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      { color: active ? c.onEmphasis : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {t(`domain.category.${cat}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label={t('form.labelLocation')} color={c.textMuted}>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={t('form.placeholderLocation')}
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label={t('form.labelLight')} color={c.textMuted}>
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
                      backgroundColor: active ? c.emphasis : c.surface,
                      borderColor: active ? c.emphasis : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      { color: active ? c.onEmphasis : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {t(`domain.light.${lv}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label={t('form.labelPotSize')} color={c.textMuted}>
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
                      backgroundColor: active ? c.emphasis : c.surface,
                      borderColor: active ? c.emphasis : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      { color: active ? c.onEmphasis : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {t(`domain.pot.${sz}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label={t('form.labelPetSafety')} color={c.textMuted}>
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
                      backgroundColor: active ? c.emphasis : c.surface,
                      borderColor: active ? c.emphasis : c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Type.meta,
                      { color: active ? c.onEmphasis : c.text, fontFamily: Fonts.bodySemi },
                    ]}
                  >
                    {t(`domain.pet.${tx}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <DateField label={t('form.labelAcquiredDate')} value={acquiredDate} onChange={setAcquiredDate} />

        <View style={styles.row2}>
          <View style={styles.half}>
            <Field label={t('form.labelWaterDays')} color={c.textMuted}>
              <TextInput
                value={waterDays}
                onChangeText={setWaterDays}
                keyboardType="number-pad"
                style={inputStyle}
              />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label={t('form.labelFertilizeDays')} color={c.textMuted}>
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
          {t('form.scheduleHint')}
        </Text>

        <Field label={t('form.labelNotes')} color={c.textMuted}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('form.placeholderNotes')}
            placeholderTextColor={c.textMuted}
            multiline
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <PrimaryButton label={t('form.saveButtonAdd')} onPress={onSave} loading={saving} />
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
  chips: { gap: 8, paddingVertical: 2, paddingRight: 28 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row2: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
