import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Droplet } from 'lucide-react-native';

import { onHue, withAlpha } from '@/constants/Palette';
import { useI18n } from '@/lib/i18n';

/**
 * Circular care-progress badge overlaid on a plant card.
 * progress 0 → just cared for, 1 → due now (or overdue).
 *
 * The disc is filled with the care colour itself rather than a neutral dark
 * scrim. The scrim version worked over photos but turned into a grey blob on
 * the tinted no-photo placeholder, and it kept the badge outside the app's
 * colour language. Filling with the hue means the arc and icon have to invert
 * against it — hence `onHue` — but the badge now reads as "water" or "late"
 * at thumbnail size on any background.
 */
export function WaterRing({
  progress,
  color,
  size = 34,
  strokeWidth = 3,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const { t } = useI18n();
  const clamped = Math.min(1, Math.max(0, progress));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const fg = onHue(color);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
      accessibilityLabel={t('plants.careProgressA11y', { percent: Math.round(clamped * 100) })}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={withAlpha(fg === '#FFFFFF' ? '#FFFFFF' : '#0F1612', 0.28)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fg}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Droplet color={fg} size={size * 0.42} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
});
