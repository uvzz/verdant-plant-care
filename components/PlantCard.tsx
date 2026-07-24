import { useRef } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PawPrint, Sprout } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import {
  careColor,
  categoryColor,
  onHue,
  softFill,
  statusColor,
} from '@/constants/Palette';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { CareIcon } from '@/components/CareIcon';
import { WaterRing } from '@/components/WaterRing';
import { setHeroOrigin } from '@/lib/heroTransition';
import { useI18n } from '@/lib/i18n';
import type { CareLogType, Plant } from '@/lib/types';

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
  const router = useRouter();
  const { t } = useI18n();
  const catHue = categoryColor(plant.category, scheme);
  const overdueHue = statusColor('overdue', scheme);
  // The due line, its icon and the water ring all share ONE colour so the card
  // reads as a single signal: coral when late, else the colour of the care the
  // plant is actually waiting for (blue = water, amber = feed).
  const track = overdue
    ? overdueHue
    : dueType
      ? careColor(dueType, scheme)
      : (filamentColor ?? c.tint);
  const tox =
    plant.petToxicity && plant.petToxicity !== 'unknown' ? plant.petToxicity : null;
  const toxHue =
    tox === 'toxic'
      ? overdueHue
      : tox === 'caution'
        ? statusColor('dueToday', scheme)
        : statusColor('healthy', scheme);
  const imageWrapRef = useRef<View>(null);

  const open = () => {
    // Measure the photo's on-screen rect and hand it to the detail hero for a
    // shared-element rise, then navigate. Measurement is best-effort — if it
    // fails the detail just skips the overlay and renders normally.
    if (plant.photoUri && imageWrapRef.current) {
      imageWrapRef.current.measureInWindow((x, y, width, height) => {
        setHeroOrigin(
          { plantId: plant.id, uri: plant.photoUri as string, x, y, width, height, radius: 18 },
          Date.now()
        );
        router.push(`/plant/${plant.id}`);
      });
    } else {
      router.push(`/plant/${plant.id}`);
    }
  };

  return (
      <Pressable
        onPress={open}
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
        <View ref={imageWrapRef} style={styles.imageWrap}>
          {plant.photoUri ? (
            <Image source={{ uri: plant.photoUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: softFill(catHue, scheme) }]}>
              <Sprout color={catHue} size={40} strokeWidth={1.8} />
            </View>
          )}
          {/* Category stripe — a specimen-label tape under the photo. It is the
              only place the category shows on a card that already has a
              species line, and it colour-codes the grid at a glance. */}
          <View style={[styles.categoryStripe, { backgroundColor: catHue }]} />
          {tox ? (
            <View style={[styles.petBadge, { backgroundColor: toxHue }]}>
              <PawPrint color={onHue(toxHue)} size={12} strokeWidth={2.4} />
            </View>
          ) : null}
          {typeof dueProgress === 'number' ? (
            <View style={styles.ring}>
              <WaterRing progress={dueProgress} color={track} />
            </View>
          ) : null}
          {overdue ? (
            <View style={[styles.overdueBadge, { backgroundColor: overdueHue }]}>
              <Text style={[styles.overdueText, { color: onHue(overdueHue) }]}>Due</Text>
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
            {plant.species || t(`domain.category.${plant.category}`)}
          </Text>
          <View style={styles.subtitleRow}>
            {subtitle && dueType ? (
              <CareIcon type={dueType} color={track} size={12} />
            ) : null}
            <Text
              style={[Type.meta, { color: subtitle ? track : c.textMuted, fontSize: 11 }]}
              numberOfLines={1}
            >
              {subtitle || plant.location || t(`domain.category.${plant.category}`)}
            </Text>
          </View>
          {tox ? (
            <Text
              style={[Type.meta, { color: c.textMuted, fontSize: 10, marginTop: 2 }]}
              numberOfLines={1}
            >
              {t(`domain.pet.${tox}`)}
            </Text>
          ) : null}
        </View>
      </Pressable>
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
  categoryStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
  overdueBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  overdueText: {
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
