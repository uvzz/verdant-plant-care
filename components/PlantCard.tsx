import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Plant } from '@/lib/types';

interface Props {
  plant: Plant;
  subtitle?: string;
}

export function PlantCard({ plant, subtitle }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

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
        <View style={styles.meta}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {plant.name}
          </Text>
          <Text style={[styles.species, { color: c.textMuted }]} numberOfLines={1}>
            {plant.species || plant.category}
          </Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: c.tint }]} numberOfLines={1}>
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
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
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  species: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  sub: {
    fontSize: 12,
    marginTop: 4,
  },
});
