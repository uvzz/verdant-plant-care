import { describe, expect, it } from 'vitest';
import { buildBackupPayload, parseBackupJson } from '../export';
import { DEFAULT_SETTINGS } from '../storage';

describe('buildBackupPayload', () => {
  it('builds version 2 with family fields', () => {
    const p = buildBackupPayload({
      plants: [],
      logs: [],
      settings: DEFAULT_SETTINGS,
      familyMembers: [
        {
          id: 'm1',
          name: 'Sam',
          role: 'member',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      householdName: 'Home',
    });
    expect(p.version).toBe(2);
    expect(p.app).toBe('verdant-plant-care');
    expect(p.householdName).toBe('Home');
    expect(p.familyMembers).toHaveLength(1);
  });
});

describe('parseBackupJson roundtrip', () => {
  it('parses built payload', () => {
    const built = buildBackupPayload({
      plants: [],
      logs: [],
      settings: DEFAULT_SETTINGS,
    });
    const parsed = parseBackupJson(JSON.stringify(built));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.backup.plants).toEqual([]);
      expect(parsed.backup.settings.isPremium).toBe(false);
    }
  });

  it('rejects garbage', () => {
    expect(parseBackupJson('not-json').ok).toBe(false);
  });
});
