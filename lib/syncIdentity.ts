/**
 * Identity-change detection for cloud sync.
 *
 * Sync ids are deterministic (HMAC of provider+subject), so the same account
 * always maps to the same id. That determinism is what makes a simple id
 * comparison a sound security check: a new id that differs from the stored
 * one is provably a different account, not just a re-login of the same one.
 */

/** True iff switching to newId means switching accounts (so local data
 *  from the previous account must be cleared before the first sync).
 *  A first-ever adopt (no previous id) returns false — the user's own
 *  offline-created data legitimately becomes their new cloud collection. */
export function shouldResetLocalData(
  prevId: string | null | undefined,
  newId: string
): boolean {
  if (!prevId) return false;
  const prev = prevId.trim().toLowerCase();
  const next = newId.trim().toLowerCase();
  if (!prev) return false;
  return prev !== next;
}

/** Reset local data only when switching away from a real (adopted) account
 *  to a different account. A device-generated id that was never adopted is
 *  the user's own offline collection — keep it so first sign-in uploads it. */
export function shouldResetOnAdopt(
  prevId: string | null | undefined,
  newId: string,
  prevWasAdopted: boolean
): boolean {
  return prevWasAdopted && shouldResetLocalData(prevId, newId);
}
