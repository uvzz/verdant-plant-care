import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PawPrint, Sprout } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { CareIcon } from '@/components/CareIcon';
import { WaterRing } from '@/components/WaterRing';
import { PET_LABELS, type CareLogType, type Plant } from '@/lib/types';

interface Props {
  plant: Plant;
  subtitle?: string;
  /** Care type behind the subtitle (drives the small icon). */
  dueType?: CareLogType;
  /** 0 = just cared for, 1 = due/overdue. Drives the photo water ring. */
  dueProgress?: number;
  overdue?: boolean;
  filamentColor?: string;
}

export function PlantCard({
  plant,
  subtitle,
  dueType,
  dueProgress,
  overdue,
  filamentColor,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const track = filamentColor ?? c.tint;
  const tox =
    plant.petToxicity && plant.petToxicity !== 'unknown' ? plant.petToxicity : null;

  return (
    <Link href={`/plant/${plant.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            opacity: pressed ? 0.94 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: c.cardShadow,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          {plant.photoUri ? (
            <Image source={{ uri: plant.photoUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: c.surfaceAlt }]}>
              <Sprout color={c.tint} size={40} strokeWidth={1.8} />
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
              <PawPrint
                color={tox === 'safe' ? c.growthInk : '#FFFFFF'}
                size={12}
                strokeWidth={2.4}
              />
            </View>
          ) : null}
          {typeof dueProgress === 'number' ? (
            <View style={styles.ring}>
              <WaterRing progress={dueProgress} color={overdue ? '#E8927C' : c.growth} />
            </View>
          ) : null}
          {overdue ? (
            <View style={[styles.overdueBadge, { backgroundColor: c.danger }]}>
              <Text style={styles.overdueText}>Due</Text>
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
          <View style={styles.subtitleRow}>
            {subtitle && dueType ? (
              <CareIcon type={dueType} color={track} size={12} />
            ) : null}
            <Text
              style={[Type.meta, { color: subtitle ? track : c.textMuted, fontSize: 11 }]}
              numberOfLines={1}
            >
              {subtitle || plant.location || plant.category}
            </Text>
          </View>
          {tox ? (
            <Text
              style={[Type.meta, { color: c.textMuted, fontSize: 10, marginTop: 2 }]}
              numberOfLines={1}
            >
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
  petBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    padding: 5,
  },
  ring: { position: 'absolute', bottom: 8, right: 8 },
  overdueBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  overdueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  specimen: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
});
