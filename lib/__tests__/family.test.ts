import { describe, expect, it } from 'vitest';
import { createFamilyMember, plantsForMember } from '../family';
import { normalizePlant, type Plant } from '../types';

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
