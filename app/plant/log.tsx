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
import {
  CARE_TYPE_EMOJI,
  CARE_TYPE_LABELS,
  type CareLogType,
} from '@/lib/types';

const TYPES: CareLogType[] = ['water', 'fertilize', 'check', 'note', 'photo'];

export default function LogCareScreen() {
  const { plantId, type: typeParam } = useLocalSearchParams<{
    plantId: string;
    type?: string;
  }>();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
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
      Alert.alert('Permission needed', 'Allow photo library access.');
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
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      if (type !== 'water' && type !== 'fertilize') setType('photo');
    }
  };

  const onSave = async () => {
    if (!plant) {
      Alert.alert('Plant missing');
      return;
    }
    if (type === 'photo' && !photoUri) {
      Alert.alert('Photo required', 'Add a photo for a photo log entry.');
      return;
    }
    setSaving(true);
    await addCareLog({
      plantId: plant.id,
      type,
      note: note.trim(),
      photoUri,
    });
    setSaving(false);
    router.back();
  };

  if (!plant) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[Type.body, { color: c.textMuted }]}>Plant not found.</Text>
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
          A quiet moment of care. Photos help you see seasons of growth.
        </Text>

        <Text style={[Type.micro, { color: c.textMuted, marginBottom: 8 }]}>Care type</Text>
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
                    backgroundColor: active ? c.night : c.surface,
                    borderColor: active ? c.night : c.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 18, marginBottom: 4 }}>{CARE_TYPE_EMOJI[t]}</Text>
                <Text
                  style={[
                    Type.meta,
                    {
                      color: active ? c.background : c.text,
                      fontFamily: Fonts.bodySemi,
                    },
                  ]}
                >
                  {CARE_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[Type.micro, { color: c.textMuted, marginBottom: 8, marginTop: 8 }]}>
          Note
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="New leaf almost open…"
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
          Photo
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
            <Text style={[Type.meta, { color: c.textMuted }]}>Tap to attach a photo</Text>
          )}
        </Pressable>
        <View style={styles.photoActions}>
          <PrimaryButton label="Library" variant="secondary" onPress={pickPhoto} style={styles.half} />
          <PrimaryButton label="Camera" variant="secondary" onPress={takePhoto} style={styles.half} />
        </View>

        <PrimaryButton
          label={`Save · ${CARE_TYPE_EMOJI[type]} ${CARE_TYPE_LABELS[type]}`}
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
