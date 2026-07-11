/**
 * Client never holds the OpenRouter key.
 * AI goes through Verdant's server proxy (Cloudflare Worker).
 *
 * Configure in gitignored `.env`:
 *   EXPO_PUBLIC_VERDANT_AI_URL=https://verdant-ai.<account>.workers.dev
 *   EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN=<same as Worker PREMIUM_ACCESS_TOKEN>
 *
 * PREMIUM_TOKEN is an app entitlement gate (not the OpenRouter secret).
 * OpenRouter key lives only on the Worker as OPENROUTER_API_KEY.
 */

export function getAiProxyUrl(): string {
  const url = process.env.EXPO_PUBLIC_VERDANT_AI_URL?.trim().replace(/\/$/, '');
  return url || 'http://127.0.0.1:8787';
}

export function getPremiumAccessToken(): string | null {
  const t = process.env.EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN?.trim();
  return t || null;
}
