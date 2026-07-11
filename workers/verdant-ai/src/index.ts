/**
 * Verdant AI proxy — OpenRouter key stays on the server.
 * Mobile app never sees OPENROUTER_API_KEY.
 *
 * POST /v1/chat
 * Headers:
 *   Authorization: Bearer <PREMIUM_ACCESS_TOKEN>
 *   Content-Type: application/json
 * Body: { model?, messages, temperature?, response_format? }
 */

export interface Env {
  OPENROUTER_API_KEY: string;
  /** Required. App sends this only when user has Premium entitlement. */
  PREMIUM_ACCESS_TOKEN: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
/** DeepSeek V4 Flash — fast, cost-efficient (OpenRouter id) */
const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function unauthorized(msg: string): Response {
  return json({ error: msg }, 401);
}

function forbidden(msg: string): Response {
  return json({ error: msg }, 403);
}

function extractBearer(req: Request): string | null {
  const h = req.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json({
        ok: true,
        service: 'verdant-ai',
        premium: 'required',
        openrouterConfigured: Boolean(env.OPENROUTER_API_KEY),
      });
    }

    if (request.method === 'POST' && url.pathname === '/v1/chat') {
      if (!env.OPENROUTER_API_KEY) {
        return json({ error: 'Server misconfigured: missing OPENROUTER_API_KEY' }, 500);
      }
      if (!env.PREMIUM_ACCESS_TOKEN) {
        return json({ error: 'Server misconfigured: missing PREMIUM_ACCESS_TOKEN' }, 500);
      }

      const token = extractBearer(request);
      if (!token || token !== env.PREMIUM_ACCESS_TOKEN) {
        return forbidden('Premium required. AI is available for Premium subscribers only.');
      }

      let body: {
        model?: string;
        messages?: unknown[];
        temperature?: number;
        response_format?: unknown;
      };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }

      if (!body.messages || !Array.isArray(body.messages)) {
        return json({ error: 'messages array required' }, 400);
      }

      // Hard cap payload size (vision base64)
      const approx = JSON.stringify(body).length;
      if (approx > 12_000_000) {
        return json({ error: 'Payload too large' }, 413);
      }

      const upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/uvzz/verdant-plant-care',
          'X-Title': 'Verdant Plant Care',
        },
        body: JSON.stringify({
          model: body.model || DEFAULT_MODEL,
          messages: body.messages,
          temperature: body.temperature ?? 0.4,
          ...(body.response_format
            ? { response_format: body.response_format }
            : {}),
        }),
      });

      const text = await upstream.text();
      // Do not leak OpenRouter key; pass through status + body
      return new Response(text, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
          ...corsHeaders,
        },
      });
    }

    return json({ error: 'Not found' }, 404);
  },
};
