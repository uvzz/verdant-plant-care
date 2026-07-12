import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Droplet } from 'lucide-react-native';

/**
 * Circular water-progress ring overlaid on plant photos (Greg-style).
 * progress 0 → just watered, 1 → due now (or overdue).
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
  const clamped = Math.min(1, Math.max(0, progress));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View
      style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityLabel={`Water progress ${Math.round(clamped * 100)}%`}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.icon}>
          <Droplet color="#FFFFFF" size={size * 0.42} strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(15,22,18,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
