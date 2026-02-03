import { getOpenAIClient } from "@/lib/openai/client";

const STYLE_VALUES = ["offensive", "defensive", "neutral"] as const;
export type StyleLabel = (typeof STYLE_VALUES)[number];

export type ClassifiedStyle = {
  primary: StyleLabel;
  secondary?: StyleLabel;
  confidence: number;
};

const FALLBACK: ClassifiedStyle = { primary: "neutral", confidence: 0.4 };

const SYSTEM_PROMPT = `You classify tennis play styles into offensive, defensive, or neutral.
You must output ONLY strict JSON with keys: primary, secondary (optional), confidence.
No prose, no markdown, no explanations.

Classification guidance:
- offensive: fast pace, takes time away, approaches net, big serve/forehand, hits flatter or aggressive topspin
- defensive: baseline, long rallies, consistency, high margin, patience, retrieves a lot
- neutral: all-round, mixes defense and offense, changes rhythm, balanced

Secondary: Only include secondary if clearly hybrid (e.g. primary neutral + secondary offensive). If not sure, omit secondary.

Confidence (0.0 to 1.0): Use 0.85+ if very clear, 0.60–0.80 if fairly clear, 0.40–0.55 if ambiguous.

Hard rules: Never output anything besides JSON. Never output trailing commentary.`;

function stripJson(raw: string): string {
  let s = raw.trim();
  const codeBlock = /^```(?:json)?\s*([\s\S]*?)```\s*$/;
  const m = s.match(codeBlock);
  if (m) s = m[1].trim();
  return s;
}

function parseAndValidate(content: string): ClassifiedStyle | null {
  const s = stripJson(content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const primary = obj.primary;
  if (typeof primary !== "string" || !STYLE_VALUES.includes(primary as StyleLabel)) {
    return null;
  }
  const secondary = obj.secondary;
  let secondaryOut: StyleLabel | undefined;
  if (secondary !== undefined && secondary !== null) {
    if (
      typeof secondary !== "string" ||
      !STYLE_VALUES.includes(secondary as StyleLabel) ||
      secondary === primary
    ) {
      return null;
    }
    secondaryOut = secondary as StyleLabel;
  }
  const confidence = obj.confidence;
  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    return null;
  }
  const result: ClassifiedStyle = { primary: primary as StyleLabel, confidence };
  if (secondaryOut !== undefined) result.secondary = secondaryOut;
  return result;
}

export async function classifyStyle(text: string): Promise<ClassifiedStyle> {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return FALLBACK;
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
    max_tokens: 120,
    temperature: 0.2,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    return FALLBACK;
  }

  const validated = parseAndValidate(content);
  return validated ?? FALLBACK;
}
