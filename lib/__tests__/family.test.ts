import { describe, expect, it } from 'vitest';
import {
  createFamilyMember,
  mergeFamilyBackup,
  plantsForMember,
} from '../family';
import { parseBackupJson } from '../export';
import { normalizePlant, type CareLog, type Plant } from '../types';

describe('createFamilyMember', () => {
  it('creates a member with trimmed name', () => {
    const m = createFamilyMember('  Alex  ');
    expect(m.name).toBe('Alex');
    expect(m.role).toBe('member');
    expect(m.id).toBeTruthy();
  });
});

describe('plantsForMember', () => {
  const plants: Plant[] = [
    normalizePlant({
      id: '1',
      name: 'A',
      caretakerId: 'm1',
      species: '',
      category: 'Other',
      photoUri: null,
      acquiredDate: '2026-01-01',
      location: '',
      waterIntervalDays: 7,
      fertilizeIntervalDays: 30,
      notes: '',
      createdAt: '',
      updatedAt: '',
    }),
    normalizePlant({
      id: '2',
      name: 'B',
      caretakerId: null,
      species: '',
      category: 'Other',
      photoUri: null,
      acquiredDate: '2026-01-01',
      location: '',
      waterIntervalDays: 7,
      fertilizeIntervalDays: 30,
      notes: '',
      createdAt: '',
      updatedAt: '',
    }),
  ];

  it('filters by caretaker', () => {
    expect(plantsForMember(plants, 'm1').map((p) => p.id)).toEqual(['1']);
  });

  it('lists unassigned when requested', () => {
    expect(
      plantsForMember(plants, null, { includeUnassigned: true }).map((p) => p.id)
    ).toEqual(['2']);
  });
});

describe('mergeFamilyBackup', () => {
  it('adds only new ids', () => {
    const existingPlants = [
      normalizePlant({
        id: 'a',
        name: 'A',
        species: '',
        category: 'Other',
        photoUri: null,
        acquiredDate: '2026-01-01',
        location: '',
        waterIntervalDays: 7,
        fertilizeIntervalDays: 30,
        notes: '',
        createdAt: '',
        updatedAt: '',
      }),
    ];
    const existingLogs: CareLog[] = [
      {
        id: 'l1',
        plantId: 'a',
        type: 'water',
        note: '',
        photoUri: null,
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ];
    const incomingPlants = [
      existingPlants[0],
      normalizePlant({
        id: 'b',
        name: 'B',
        species: '',
        category: 'Other',
        photoUri: null,
        acquiredDate: '2026-01-01',
        location: '',
        waterIntervalDays: 7,
        fertilizeIntervalDays: 30,
        notes: '',
        createdAt: '',
        updatedAt: '',
      }),
    ];
    const incomingLogs: CareLog[] = [
      existingLogs[0],
      {
        id: 'l2',
        plantId: 'b',
        type: 'note',
        note: 'hi',
        photoUri: null,
        createdAt: '2026-01-03T00:00:00.000Z',
      },
    ];
    const m = mergeFamilyBackup({
      existingPlants,
      existingLogs,
      incomingPlants,
      incomingLogs,
    });
    expect(m.addedPlants).toBe(1);
    expect(m.addedLogs).toBe(1);
    expect(m.plants).toHaveLength(2);
  });
});

describe('parseBackupJson', () => {
  it('rejects non-verdant payloads', () => {
    const r = parseBackupJson('{"app":"other","plants":[],"logs":[]}');
    expect(r.ok).toBe(false);
  });

  it('parses valid backup', () => {
    const r = parseBackupJson(
      JSON.stringify({
        app: 'verdant-plant-care',
        version: 2,
        plants: [],
        logs: [],
        settings: { notificationsEnabled: true, isPremium: false },
      })
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.backup.version).toBe(2);
  });
});
