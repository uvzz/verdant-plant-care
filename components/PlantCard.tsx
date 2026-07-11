import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Plant } from '@/lib/types';

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
        </View>
        {/* Specimen label strip */}
        <View style={styles.specimen}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {plant.name}
          </Text>
          <Text style={[styles.species, { color: c.textMuted }]} numberOfLines={1}>
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
          {subtitle ? (
            <Text style={[styles.sub, { color: track }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            <Text style={[styles.sub, { color: c.textMuted }]} numberOfLines={1}>
              {plant.location || plant.category}
            </Text>
          )}
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
  imageWrap: {
    aspectRatio: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  specimen: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  species: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 1,
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
  sub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },
});
