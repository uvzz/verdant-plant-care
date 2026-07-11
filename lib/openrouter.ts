import { getAiProxyUrl, getPremiumAccessToken } from './aiConfig';
import { photoToBase64 } from './photos';
import type {
  CareLog,
  LightLevel,
  PetToxicity,
  Plant,
  PlantCategory,
} from './types';
import { LIGHT_LEVELS, PET_TOXICITY, PLANT_CATEGORIES } from './types';
import {
  normalizeCategory,
  normalizeLight,
  normalizePetToxicity,
  parseJsonLoose,
} from './aiParse';

/**
 * OpenRouter models (key lives on Worker only).
 * DeepSeek V4 Flash = fast text; multimodal needed for plant photos.
 */
const TEXT_MODEL = 'deepseek/deepseek-v4-flash';
/** V4 Flash is text-only — vision path uses a cheap multimodal model */
const VISION_MODEL = 'qwen/qwen3.5-flash-02-23';

export type PlantIdResult = {
  commonName: string;
  scientificName: string;
  category: PlantCategory;
  confidence: 'high' | 'medium' | 'low';
  careSummary: string;
  waterIntervalDays: number;
  fertilizeIntervalDays: number;
  notes: string;
  /** Suggested ambient light for typical indoor placement */
  lightLevel: LightLevel;
  /** Pet toxicity hint (educational; verify for your region) */
  petToxicity: PetToxicity;
};

export type CareGuideResult = {
  title: string;
  light: string;
  water: string;
  humidity: string;
  soil: string;
  tips: string[];
  disclaimer: string;
};

export type CareCoachResult = {
  assessment: string;
  recommendations: string[];
  urgency: 'none' | 'watch' | 'soon' | 'urgent';
  disclaimer: string;
};

/**
 * Chat via server proxy. OpenRouter key never leaves the server.
 * Caller must ensure Premium entitlement on the client.
 */
async function chat(
  messages: Array<Record<string, unknown>>,
  opts?: { model?: string; json?: boolean }
): Promise<string> {
  const token = getPremiumAccessToken();
  if (!token) {
    throw new Error(
      'AI is not configured. Set EXPO_PUBLIC_VERDANT_AI_URL and EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN for this build.'
    );
  }

  const base = getAiProxyUrl();
  const res = await fetch(`${base}/v1/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts?.model ?? TEXT_MODEL,
      messages,
      temperature: 0.4,
      ...(opts?.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 403) {
      throw new Error('AI is for Premium members only.');
    }
    if (res.status === 401) {
      throw new Error('Premium access was rejected. Check server configuration.');
    }
    throw new Error(`AI service error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: string;
  };
  if (data.error) throw new Error(data.error);
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from AI.');
  return content;
}

/** Identify plant from a photo (vision) — Premium only */
export async function identifyPlantFromPhoto(
  photoUri: string
): Promise<PlantIdResult> {
  const img = await photoToBase64(photoUri);
  if (!img) throw new Error('Could not read the photo for AI analysis.');

  const system = `You are a horticulture assistant for a plant care app.
Return ONLY valid JSON with keys:
commonName, scientificName, category, confidence, careSummary, waterIntervalDays, fertilizeIntervalDays, notes, lightLevel, petToxicity.
category must be one of: ${PLANT_CATEGORIES.join(', ')}.
confidence: high | medium | low.
lightLevel must be one of: ${LIGHT_LEVELS.join(', ')} (typical home placement for this species).
petToxicity must be one of: ${PET_TOXICITY.join(', ')} (cats/dogs; educational only — prefer "unknown" if unsure).
waterIntervalDays and fertilizeIntervalDays are positive integers (typical home care).
Be honest if unsure; never invent rare species with certainty.
This is educational assistance, not a definitive botanical identification or veterinary advice.`;

  const raw = await chat(
    [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Identify this plant for a care journal. Suggest a friendly common name if unknown variety. Include light preference and pet safety if known.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${img.mime};base64,${img.base64}`,
            },
          },
        ],
      },
    ],
    { model: VISION_MODEL, json: true }
  );

  const parsed = parseJsonLoose<{
    commonName?: string;
    scientificName?: string;
    category?: string;
    confidence?: string;
    careSummary?: string;
    waterIntervalDays?: number;
    fertilizeIntervalDays?: number;
    notes?: string;
    lightLevel?: string;
    petToxicity?: string;
  }>(raw);

  const conf = (parsed.confidence || 'medium').toLowerCase();
  return {
    commonName: parsed.commonName?.trim() || 'Mystery plant',
    scientificName: parsed.scientificName?.trim() || '',
    category: normalizeCategory(parsed.category || 'Other'),
    confidence: conf === 'high' || conf === 'low' ? conf : 'medium',
    careSummary: parsed.careSummary?.trim() || '',
    waterIntervalDays: Math.max(1, Number(parsed.waterIntervalDays) || 7),
    fertilizeIntervalDays: Math.max(1, Number(parsed.fertilizeIntervalDays) || 30),
    notes: parsed.notes?.trim() || '',
    lightLevel: normalizeLight(parsed.lightLevel),
    petToxicity: normalizePetToxicity(parsed.petToxicity),
  };
}

export async function generateCareGuide(
  plant: Pick<Plant, 'name' | 'species' | 'category' | 'notes'>
): Promise<CareGuideResult> {
  const system = `You are a calm, practical plant-care coach for rare houseplants, orchids, succulents, and related plants.
Return ONLY JSON: title, light, water, humidity, soil, tips (string array, max 5), disclaimer.
Keep each field concise (1–3 sentences). Educational only; not professional diagnosis.`;

  const raw = await chat(
    [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Write a care guide for:
Name: ${plant.name}
Species: ${plant.species || 'unknown'}
Category: ${plant.category}
Notes: ${plant.notes || 'none'}`,
      },
    ],
    { json: true }
  );

  const parsed = parseJsonLoose<Partial<CareGuideResult>>(raw);
  return {
    title: parsed.title?.trim() || `Care for ${plant.name}`,
    light: parsed.light?.trim() || 'Bright, indirect light is usually safest.',
    water: parsed.water?.trim() || 'Water when the top of the medium feels dry.',
    humidity: parsed.humidity?.trim() || 'Average indoor humidity is often fine.',
    soil: parsed.soil?.trim() || 'Use a well-draining mix suited to the plant type.',
    tips: Array.isArray(parsed.tips) ? parsed.tips.map(String).slice(0, 5) : [],
    disclaimer:
      parsed.disclaimer?.trim() ||
      'AI-assisted tips for education only — observe your plant and adjust to your home.',
  };
}

export async function askCareCoach(input: {
  plant: Plant;
  logs: CareLog[];
  question: string;
  photoUri?: string | null;
}): Promise<CareCoachResult> {
  const recent = input.logs.slice(0, 12).map((l) => ({
    type: l.type,
    note: l.note,
    at: l.createdAt,
  }));

  const system = `You are Verdant's gentle plant care coach.
Return ONLY JSON: assessment (string), recommendations (string array, max 5), urgency (none|watch|soon|urgent), disclaimer.
Be practical and calm. Prefer "watch and wait" over panic. Educational only — not pest/disease lab diagnosis.`;

  const userText = `Plant: ${input.plant.name}
Species: ${input.plant.species || 'unknown'}
Category: ${input.plant.category}
Location: ${input.plant.location || 'unknown'}
Water every ${input.plant.waterIntervalDays} days · Fertilize every ${input.plant.fertilizeIntervalDays} days
Owner notes: ${input.plant.notes || 'none'}
Recent care log: ${JSON.stringify(recent)}
Question: ${input.question || 'How is this plant doing and what should I do next?'}`;

  let content: unknown = userText;
  if (input.photoUri) {
    const img = await photoToBase64(input.photoUri);
    if (img) {
      content = [
        { type: 'text', text: userText },
        {
          type: 'image_url',
          image_url: { url: `data:${img.mime};base64,${img.base64}` },
        },
      ];
    }
  }

  const raw = await chat(
    [
      { role: 'system', content: system },
      { role: 'user', content },
    ],
    { model: input.photoUri ? VISION_MODEL : TEXT_MODEL, json: true }
  );

  const parsed = parseJsonLoose<Partial<CareCoachResult>>(raw);
  const u = (parsed.urgency || 'watch').toLowerCase();
  return {
    assessment: parsed.assessment?.trim() || 'Could not form a clear assessment.',
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String).slice(0, 5)
      : [],
    urgency: u === 'none' || u === 'soon' || u === 'urgent' ? u : 'watch',
    disclaimer:
      parsed.disclaimer?.trim() ||
      'AI assistance only — if the plant declines quickly, consult a local grower or extension service.',
  };
}

/** Collection insight via premium proxy */
export async function generateCollectionInsight(statsJson: string): Promise<string> {
  const raw = await chat(
    [
      {
        role: 'system',
        content:
          "You are Verdant, a calm plant-collection coach. Give a short (3–6 sentences) encouraging insight about the user's collection stats. No markdown headings. Educational only.",
      },
      { role: 'user', content: `Collection stats JSON: ${statsJson}` },
    ],
    { model: TEXT_MODEL }
  );
  return raw;
}
