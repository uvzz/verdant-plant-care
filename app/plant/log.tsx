import { useEffect, useState } from 'react';
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

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePlants } from '@/lib/PlantContext';
import { useI18n } from '@/lib/i18n';
import type { CareLogType } from '@/lib/types';
import { firstParam } from '@/lib/routeParams';
import { CareIcon } from '@/components/CareIcon';

const TYPES: CareLogType[] = ['water', 'fertilize', 'check', 'note', 'photo'];

export default function LogCareScreen() {
  const { plantId: plantIdRaw, type: typeRaw } = useLocalSearchParams<{
    plantId: string;
    type?: string;
  }>();
  const plantId = firstParam(plantIdRaw);
  const typeParam = firstParam(typeRaw);
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  // Aliased: TYPES.map((t) => …) below already uses `t` as its loop variable.
  const { t: translateDomain } = useI18n();
  const router = useRouter();
  const { getPlant, addCareLog } = usePlants();
  const plant = getPlant(plantId);

  const initialType: CareLogType =
    typeParam && TYPES.includes(typeParam as CareLogType)
      ? (typeParam as CareLogType)
      : 'water';

  const [type, setType] = useState<CareLogType>(initialType);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Keep type in sync when navigating with different ?type=
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      // Same permission prompt as add.tsx/edit.tsx — reuses their shared key
      // rather than a byte-identical log.* duplicate.
      Alert.alert(translateDomain('form.photoPermissionTitle'), translateDomain('form.photoPermissionBody'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      if (type !== 'water' && type !== 'fertilize') setType('photo');
    }
  };

  const takePhoto = async () => {
    const { requestCameraCapture } = await import('@/lib/cameraBridge');
    const pending = requestCameraCapture();
    router.push('/camera');
    const uri = await pending;
    if (uri) {
      setPhotoUri(uri);
      if (type !== 'water' && type !== 'fertilize' && type !== 'check') setType('photo');
    }
  };

  const onSave = async () => {
    if (!plant) {
      // Defensive only — the component already renders the "not found" view
      // below (and never mounts the Save button) whenever `plant` is falsy.
      Alert.alert(translateDomain('log.plantMissingTitle'));
      return;
    }
    if (type === 'photo' && !photoUri) {
      Alert.alert(translateDomain('log.photoRequiredTitle'), translateDomain('log.photoRequiredBody'));
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await addCareLog({
        plantId: plant.id,
        type,
        note: note.trim(),
        photoUri,
      });
      router.back();
    } catch {
      Alert.alert(translateDomain('log.saveErrorTitle'), translateDomain('log.saveErrorBody'));
    } finally {
      setSaving(false);
    }
  };

  if (!plant) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[Type.body, { color: c.textMuted }]}>{translateDomain('log.notFound')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[Type.displayM, { color: c.text }]}>{plant.name}</Text>
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6, marginBottom: 16 }]}>
          {translateDomain('log.subtitle')}
        </Text>

        <Text style={[Type.micro, { color: c.textMuted, marginBottom: 8 }]}>
          {translateDomain('log.careTypeLabel')}
        </Text>
        <View style={styles.typeGrid}>
          {TYPES.map((t) => {
            const active = t === type;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeCell,
                  {
                    backgroundColor: active ? c.emphasis : c.surface,
                    borderColor: active ? c.emphasis : c.border,
                  },
                ]}
              >
                <View style={{ marginBottom: 6 }}>
                  <CareIcon
                    type={t}
                    color={active ? c.growth : c.tint}
                    size={19}
                  />
                </View>
                <Text
                  style={[
                    Type.meta,
                    {
                      color: active ? c.onEmphasis : c.text,
                      fontFamily: Fonts.bodySemi,
                    },
                  ]}
                >
                  {translateDomain(`domain.careType.${t}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[Type.micro, { color: c.textMuted, marginBottom: 8, marginTop: 8 }]}>
          {translateDomain('log.noteLabel')}
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={translateDomain('log.notePlaceholder')}
          placeholderTextColor={c.textMuted}
          multiline
          style={[
            styles.input,
            {
              color: c.text,
              backgroundColor: c.surface,
              borderColor: c.border,
              fontFamily: Fonts.body,
            },
          ]}
        />

        <Text style={[Type.micro, { color: c.textMuted, marginBottom: 8, marginTop: 8 }]}>
          {translateDomain('log.photoLabel')}
        </Text>
        <Pressable
          onPress={pickPhoto}
          style={[
            styles.photoBox,
            { backgroundColor: c.surfaceAlt, borderColor: c.border },
          ]}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          ) : (
            <Text style={[Type.meta, { color: c.textMuted }]}>
              {translateDomain('log.photoBoxPlaceholder')}
            </Text>
          )}
        </Pressable>
        <View style={styles.photoActions}>
          {/* "Library"/"Camera" reuse add.tsx/edit.tsx's shared form.library
              form.camera keys — identical photo-source buttons, third screen
              to use them. */}
          <PrimaryButton
            label={translateDomain('form.library')}
            variant="secondary"
            onPress={pickPhoto}
            style={styles.half}
          />
          <PrimaryButton
            label={translateDomain('form.camera')}
            variant="secondary"
            onPress={takePhoto}
            style={styles.half}
          />
        </View>

        <PrimaryButton
          label={translateDomain('log.saveButton', {
            careType: translateDomain(`domain.careType.${type}`),
          })}
          icon={<CareIcon type={type} color={c.growthInk} size={17} />}
          onPress={onSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 48 },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeCell: {
    width: '48%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  photoBox: {
    height: 160,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photo: { width: '100%', height: '100%' },
  photoActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  half: { flex: 1 },
});
