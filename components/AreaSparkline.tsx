import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

/**
 * Smooth area sparkline for activity charts — replaces bare bar stubs.
 * Values are laid out left→right; the curve is a Catmull-Rom → Bézier fit.
 */
export function AreaSparkline({
  values,
  width,
  height = 72,
  color,
}: {
  values: number[];
  width: number;
  height?: number;
  color: string;
}) {
  const max = Math.max(1, ...values);
  const pad = 4;
  const innerH = height - pad * 2;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: pad + innerH * (1 - v / max),
  }));

  let line = '';
  if (pts.length === 1) {
    line = `M0,${pts[0].y} L${width},${pts[0].y}`;
  } else {
    line = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      line += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
  }
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#sparkFill)" />
      <Path d={line} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
