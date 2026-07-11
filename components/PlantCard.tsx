import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PET_LABELS, type Plant } from '@/lib/types';

interface Props {
  plant: Plant;
  subtitle?: string;
  filamentColor?: string;
  filamentWidth?: `${number}%`;
}

export function PlantCard({
  plant,
  subtitle,
  filamentColor,
  filamentWidth = '70%',
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const track = filamentColor ?? c.tint;
  const tox = plant.petToxicity && plant.petToxicity !== 'unknown' ? plant.petToxicity : null;

  return (
    <Link href={`/plant/${plant.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            opacity: pressed ? 0.92 : 1,
            shadowColor: c.cardShadow,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          {plant.photoUri ? (
            <Image source={{ uri: plant.photoUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: c.surfaceAlt }]}>
              <Text style={styles.placeholderEmoji}>🪴</Text>
            </View>
          )}
          {tox ? (
            <View
              style={[
                styles.petBadge,
                {
                  backgroundColor:
                    tox === 'toxic' ? c.danger : tox === 'caution' ? '#C4A35A' : c.growth,
                },
              ]}
            >
              <Text style={styles.petBadgeText}>
                {tox === 'toxic' ? '🐾!' : tox === 'caution' ? '🐾?' : '🐾'}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.specimen}>
          <Text
            style={[styles.name, { color: c.text, fontFamily: Fonts.display }]}
            numberOfLines={1}
          >
            {plant.name}
          </Text>
          <Text style={[Type.latin, { color: c.textMuted, fontSize: 12 }]} numberOfLines={1}>
            {plant.species || plant.category}
          </Text>
          <View style={[styles.filamentTrack, { backgroundColor: c.surfaceAlt }]}>
            <View
              style={[
                styles.filamentFill,
                { backgroundColor: track, width: filamentWidth },
              ]}
            />
          </View>
          <Text
            style={[Type.meta, { color: subtitle ? track : c.textMuted, fontSize: 11, marginTop: 6 }]}
            numberOfLines={1}
          >
            {subtitle || plant.location || plant.category}
          </Text>
          {tox ? (
            <Text style={[Type.meta, { color: c.textMuted, fontSize: 10, marginTop: 2 }]} numberOfLines={1}>
              {PET_LABELS[tox]}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flex: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  imageWrap: { aspectRatio: 1, width: '100%' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 40 },
  petBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  petBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  specimen: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  filamentTrack: {
    height: 2,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  filamentFill: {
    height: '100%',
    borderRadius: 2,
  },
});
