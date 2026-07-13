import { Share } from 'react-native';
import type { CareDueItem, CareLog, FamilyMember, Plant } from './types';
import { formatRelativeCare } from './care';
import { createId } from './storage';

export function createFamilyMember(name: string, role: FamilyMember['role'] = 'member'): FamilyMember {
  return {
    id: createId(),
    name: name.trim() || 'Family member',
    role,
    createdAt: new Date().toISOString(),
  };
}

export function memberName(
  members: FamilyMember[],
  id: string | null | undefined
): string | null {
  if (!id) return null;
  return members.find((m) => m.id === id)?.name ?? null;
}

/** Plants assigned to a caretaker (or unassigned if memberId is null and includeUnassigned) */
export function plantsForMember(
  plants: Plant[],
  memberId: string | null,
  opts?: { includeUnassigned?: boolean }
): Plant[] {
  if (!memberId) {
    return opts?.includeUnassigned
      ? plants.filter((p) => !p.caretakerId)
      : plants;
  }
  return plants.filter((p) => p.caretakerId === memberId);
}

/**
 * Share a plain-text care sheet for household handoff
 * (partner / roommate / house-sitter).
 */
export async function shareCareSheet(input: {
  dueItems: CareDueItem[];
  members: FamilyMember[];
  memberId?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  let items = input.dueItems.filter((d) => d.daysUntil <= 2);
  if (input.memberId) {
    items = items.filter((d) => d.plant.caretakerId === input.memberId);
  }

  const memberLabel = input.memberId
    ? memberName(input.members, input.memberId) ?? 'Family'
    : 'Household';

  const lines = [
    `Verdant care sheet · ${memberLabel}`,
    new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    '',
    'Check soil before watering — still moist? Skip.',
    '',
  ];

  if (items.length === 0) {
    lines.push('Nothing due in the next 2 days. 🌿');
  } else {
    for (const item of items) {
      const who = memberName(input.members, item.plant.caretakerId) ?? 'anyone';
      const action = item.type === 'water' ? '💧 check / water' : '🌿 fertilize';
      lines.push(
        `• ${item.plant.name} — ${action} (${formatRelativeCare(item.daysUntil)})` +
          (item.plant.location ? ` @ ${item.plant.location}` : '') +
          ` · ${who}`
      );
    }
  }

  lines.push('', 'Shared from Verdant — local-first plant care.');

  try {
    await Share.share({
      message: lines.join('\n'),
      title: `Verdant care · ${memberLabel}`,
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Share failed';
    if (/cancel/i.test(msg)) return { ok: true };
    return { ok: false, reason: msg };
  }
}

/** Invite blurb for family to install + link via cloud sync */
export async function shareFamilyInvite(householdName: string): Promise<void> {
  const name = householdName.trim() || 'our glasshouse';
  await Share.share({
    message: [
      `You're invited to help care for ${name} on Verdant 🌿`,
      '',
      '1. Install Verdant (iOS / Android)',
      '2. Settings → Backup & sync → Advanced → paste the sync code I send you',
      '3. Our plants and care history appear automatically',
      '',
      'Tip: check soil before watering — we never water on autopilot.',
    ].join('\n'),
    title: 'Verdant family invite',
  });
}
