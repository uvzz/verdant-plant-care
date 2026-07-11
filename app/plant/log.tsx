import { useState } from 'react';
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
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePlants } from '@/lib/PlantContext';
import {
  CARE_TYPE_EMOJI,
  CARE_TYPE_LABELS,
  type CareLogType,
} from '@/lib/types';

const TYPES: CareLogType[] = ['water', 'fertilize', 'note', 'photo'];

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
      if (type === 'water' || type === 'fertilize') {
        // keep type
      } else {
        setType('photo');
      }
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
        <Text style={{ color: c.textMuted }}>Plant not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.plantName, { color: c.text }]}>{plant.name}</Text>
        <Text style={[styles.hint, { color: c.textMuted }]}>
          Log a quiet moment of care. Photos help you see progress over seasons.
        </Text>

        <Text style={[styles.label, { color: c.textMuted }]}>Care type</Text>
        <View style={styles.types}>
          {TYPES.map((t) => {
            const active = t === type;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: active ? c.tint : c.surface,
                    borderColor: active ? c.tint : c.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{CARE_TYPE_EMOJI[t]}</Text>
                <Text
                  style={{
                    color: active ? Colors.light.background : c.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {CARE_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: c.textMuted }]}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="How does it look? New leaf? Dry soil?"
          placeholderTextColor={c.textMuted}
          multiline
          style={[
            styles.input,
            { color: c.text, backgroundColor: c.surface, borderColor: c.border },
          ]}
        />

        <Text style={[styles.label, { color: c.textMuted }]}>Photo (optional)</Text>
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
            <Text style={{ color: c.textMuted }}>Tap to attach a photo</Text>
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
  plantName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  photoBox: {
    height: 200,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photo: { width: '100%', height: '100%' },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  half: { flex: 1 },
});
