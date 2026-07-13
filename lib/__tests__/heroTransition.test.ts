import { describe, expect, it } from 'vitest';
import { setHeroOrigin, takeHeroOrigin } from '../heroTransition';

const base = {
  plantId: 'p1',
  uri: 'file:///p1.jpg',
  x: 10,
  y: 20,
  width: 100,
  height: 100,
  radius: 18,
};

describe('hero transition handoff', () => {
  it('returns the origin for a fresh, matching tap', () => {
    setHeroOrigin(base, 1000);
    const got = takeHeroOrigin('p1', 1100);
    expect(got?.uri).toBe('file:///p1.jpg');
    expect(got?.x).toBe(10);
  });

  it('is single-use — a second take returns null', () => {
    setHeroOrigin(base, 1000);
    expect(takeHeroOrigin('p1', 1050)).not.toBeNull();
    expect(takeHeroOrigin('p1', 1060)).toBeNull();
  });

  it('ignores a different plant id (and clears the pending origin)', () => {
    setHeroOrigin(base, 1000);
    expect(takeHeroOrigin('p2', 1050)).toBeNull();
    // cleared even on mismatch, so a later correct id also gets nothing
    expect(takeHeroOrigin('p1', 1060)).toBeNull();
  });

  it('expires a stale origin (cold open, not a tap)', () => {
    setHeroOrigin(base, 1000);
    expect(takeHeroOrigin('p1', 1000 + 2000)).toBeNull();
  });

  it('returns null when nothing is pending', () => {
    takeHeroOrigin('p1', 5000); // drain
    expect(takeHeroOrigin('p1', 5001)).toBeNull();
  });
});
