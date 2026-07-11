# Verdant AI security

## Threats mitigated

| Threat | Mitigation |
|--------|------------|
| Stolen OpenRouter key | Key only on Worker secrets — never in app |
| Arbitrary expensive models | Server **allowlist** only |
| Prompt injection / jailbreak | Immutable security system prompt; user data wrapped as untrusted; soft injection filter; client sanitization |
| Abuse / cost blow-up | Rate limits: **8/min**, **40/hour**, **120/day** per IP **and** token fingerprint |
| Payload bombs | Max payload ~6MB; message count ≤8; max_tokens capped |
| Double-tap spam | Client in-flight lock + local soft quota (4/min, 40/day) |

## Rate limits (server)

Configurable via Worker env (optional):

- `RATE_LIMIT_PER_MINUTE` (default 8)
- `RATE_LIMIT_PER_HOUR` (default 40)
- `RATE_LIMIT_PER_DAY` (default 120)

429 responses include `Retry-After` and `retryAfterSec`.

## Known residual risks

1. **Shared `PREMIUM_ACCESS_TOKEN` in the app binary** — can be extracted. Mitigated by rate limits; long-term: per-user JWT after real IAP receipts.
2. **Cache API rate counters** — best-effort across edge colos; not a perfect global ledger.
3. **Model jailbreak residual** — no filter is perfect; policy + wrapping reduces risk.

## Allowed models

- `deepseek/deepseek-v4-flash` (text)
- `qwen/qwen3.5-flash-02-23` (vision)
- `google/gemini-2.5-flash-lite` (legacy vision fallback)
