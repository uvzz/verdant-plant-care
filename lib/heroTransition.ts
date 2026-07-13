/**
 * Forward shared-element handoff for the plant card → detail hero.
 *
 * Reanimated 4 removed `sharedTransitionTag`, so we do it manually: the grid
 * card measures its photo's on-screen rect just before navigating and stashes
 * it here; the detail screen picks it up on mount and animates an overlay of
 * the same photo from that rect up into the hero. Module-level state is fine —
 * exactly one navigation is ever in flight, and the entry self-expires so a
 * later cold open never animates from a stale rect.
 */

export type HeroOrigin = {
  plantId: string;
  uri: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  at: number; // ms epoch, for freshness
};

let pending: HeroOrigin | null = null;

export function setHeroOrigin(origin: Omit<HeroOrigin, 'at'>, now: number): void {
  pending = { ...origin, at: now };
}

/**
 * Consume the origin for `plantId` if it's fresh (a real tap, not a deep link
 * or a stale leftover). Always clears — a handoff is single-use.
 */
export function takeHeroOrigin(plantId: string, now: number): HeroOrigin | null {
  const o = pending;
  pending = null;
  if (!o || o.plantId !== plantId) return null;
  if (now - o.at > 1200) return null; // navigation should land well within this
  return o;
}
