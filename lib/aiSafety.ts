/**
 * Client-side AI safety: input sanitization + local rate limits.
 * Server is the authority — this reduces abuse and double-taps.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_DAY = '@verdant/ai_quota_day';
const KEY_COUNT = '@verdant/ai_quota_count';
const KEY_MINUTE = '@verdant/ai_quota_minute';
const KEY_MINUTE_COUNT = '@verdant/ai_quota_minute_count';

/** Soft client caps (server enforces harder limits) */
export const AI_SOFT_LIMITS = {
  perMinute: 4,
  perDayPremium: 40,
  maxQuestionChars: 500,
  maxNotesChars: 2_000,
  maxFieldChars: 200,
} as const;

const INJECTION_SOFT = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?)/i,
  /disregard\s+(all\s+)?(previous|system)/i,
  /reveal\s+(your\s+)?(system\s+prompt|api\s*key)/i,
  /jailbreak/i,
];

export function sanitizeUserText(
  raw: string,
  maxLen: number = AI_SOFT_LIMITS.maxFieldChars
): string {
  let s = (raw || '').replace(/\0/g, '').trim();
  s = s.replace(/^\s*(system|assistant|developer)\s*:\s*/gim, '');
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function isLikelyPromptInjection(text: string): boolean {
  const t = (text || '').trim();
  if (!t) return false;
  if (t.length < 400 && INJECTION_SOFT.some((p) => p.test(t))) return true;
  return false;
}

function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function minuteKey(): string {
  const d = new Date();
  return `${dayKey()}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export type LocalAiQuota =
  | { ok: true; remainingDay: number }
  | { ok: false; reason: string };

async function readCounts(): Promise<{
  day: string;
  dayCount: number;
  minute: string;
  minCount: number;
}> {
  const day = dayKey();
  const minute = minuteKey();
  const [storedDay, storedCount, storedMin, storedMinCount] = await Promise.all([
    AsyncStorage.getItem(KEY_DAY),
    AsyncStorage.getItem(KEY_COUNT),
    AsyncStorage.getItem(KEY_MINUTE),
    AsyncStorage.getItem(KEY_MINUTE_COUNT),
  ]);
  const dayCount = storedDay === day ? parseInt(storedCount || '0', 10) || 0 : 0;
  const minCount =
    storedMin === minute ? parseInt(storedMinCount || '0', 10) || 0 : 0;
  return { day, dayCount, minute, minCount };
}

/** Peek without consuming (for UI remaining count) */
export async function peekLocalAiQuota(isPremium: boolean): Promise<{
  remainingDay: number;
  remainingMinute: number;
  blockedReason?: string;
}> {
  if (!isPremium) {
    return {
      remainingDay: 0,
      remainingMinute: 0,
      blockedReason: 'AI assist is a Premium feature.',
    };
  }
  const { dayCount, minCount } = await readCounts();
  const remainingDay = Math.max(0, AI_SOFT_LIMITS.perDayPremium - dayCount);
  const remainingMinute = Math.max(0, AI_SOFT_LIMITS.perMinute - minCount);
  let blockedReason: string | undefined;
  if (minCount >= AI_SOFT_LIMITS.perMinute) {
    blockedReason = `Slow down — max ${AI_SOFT_LIMITS.perMinute} AI requests per minute.`;
  } else if (dayCount >= AI_SOFT_LIMITS.perDayPremium) {
    blockedReason = `Daily AI limit reached (${AI_SOFT_LIMITS.perDayPremium}/day on this device). Try again tomorrow.`;
  }
  return { remainingDay, remainingMinute, blockedReason };
}

/**
 * Consume one local AI slot. Call only when a request is about to hit the network.
 */
export async function consumeLocalAiQuota(
  isPremium: boolean
): Promise<LocalAiQuota> {
  const peek = await peekLocalAiQuota(isPremium);
  if (peek.blockedReason) {
    return { ok: false, reason: peek.blockedReason };
  }

  const { day, dayCount, minute, minCount } = await readCounts();
  const nextDay = dayCount + 1;
  const nextMin = minCount + 1;
  await Promise.all([
    AsyncStorage.setItem(KEY_DAY, day),
    AsyncStorage.setItem(KEY_COUNT, String(nextDay)),
    AsyncStorage.setItem(KEY_MINUTE, minute),
    AsyncStorage.setItem(KEY_MINUTE_COUNT, String(nextMin)),
  ]);

  return {
    ok: true,
    remainingDay: Math.max(0, AI_SOFT_LIMITS.perDayPremium - nextDay),
  };
}

/** Undo a consume when the network call fails before a usable result */
export async function refundLocalAiQuota(): Promise<void> {
  try {
    const { day, dayCount, minute, minCount } = await readCounts();
    await Promise.all([
      AsyncStorage.setItem(KEY_DAY, day),
      AsyncStorage.setItem(KEY_COUNT, String(Math.max(0, dayCount - 1))),
      AsyncStorage.setItem(KEY_MINUTE, minute),
      AsyncStorage.setItem(KEY_MINUTE_COUNT, String(Math.max(0, minCount - 1))),
    ]);
  } catch {
    /* best-effort */
  }
}

/** In-flight guard so double-taps don't fire two paid calls */
let aiInFlight = 0;
const MAX_PARALLEL = 1;

export function beginAiRequest(): { ok: true } | { ok: false; reason: string } {
  if (aiInFlight >= MAX_PARALLEL) {
    return { ok: false, reason: 'An AI request is already running.' };
  }
  aiInFlight += 1;
  return { ok: true };
}

export function endAiRequest(): void {
  aiInFlight = Math.max(0, aiInFlight - 1);
}
