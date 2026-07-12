/**
 * expo-router search params are `string | string[]` — a param repeated in the
 * URL (or a stale deep link) arrives as an array and would break lookups like
 * getPlant(id). Always collapse to the first value.
 */
export function firstParam(
  value: string | string[] | undefined | null
): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
