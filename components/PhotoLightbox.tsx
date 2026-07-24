import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, Type } from '@/constants/Typography';
import { useI18n } from '@/lib/i18n';

export function PhotoLightbox({
  uri,
  label,
  visible,
  onClose,
}: {
  uri: string | null;
  label?: string;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  // Rendered exclusively by app/plant/[id].tsx (the plant detail screen) —
  // single-owner component, so its one hardcoded string lives under detail.*
  // per the WeekStrip/CareLogRow/DateField precedent
  // (.superpowers/sdd/progress.md).
  const { t } = useI18n();
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          onPress={onClose}
          style={[styles.close, { top: insets.top + 8 }]}
          hitSlop={12}
        >
          <Text style={[Type.title, { color: '#fff', fontFamily: Fonts.bodySemi }]}>
            {t('detail.lightboxClose')}
          </Text>
        </Pressable>
        <Image source={{ uri }} style={styles.image} contentFit="contain" />
        {label ? (
          <Text style={[Type.meta, styles.label, { bottom: insets.bottom + 16 }]}>
            {label}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '78%',
  },
  close: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.75)',
  },
});
