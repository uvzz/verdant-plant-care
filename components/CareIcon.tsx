import {
  Camera,
  Droplet,
  Hand,
  NotebookPen,
  Sprout,
  type LucideIcon,
} from 'lucide-react-native';
import type { CareLogType } from '@/lib/types';

const ICONS: Record<CareLogType, LucideIcon> = {
  water: Droplet,
  fertilize: Sprout,
  check: Hand,
  note: NotebookPen,
  photo: Camera,
};

/** Line icon for a care log type — replaces the old emoji glyphs. */
export function CareIcon({
  type,
  color,
  size = 16,
}: {
  type: CareLogType;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[type];
  return <Icon color={color} size={size} strokeWidth={2.2} />;
}
