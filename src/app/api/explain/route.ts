import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildExplainPrompt } from "@/lib/tennis/explainPrompt";

const AGE_BRACKETS = ["3–6", "7–9", "10–11", "12+"] as const;
const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const SURFACES = ["hard", "clay", "grass", "carpet"] as const;
const STYLES = ["defensive", "neutral", "offensive"] as const;

interface ExplainBody {
  answers?: {
    ageBracket?: string;
    level?: string;
    surface?: string;
    style?: string;
    styleText?: string;
  };
  ball?: {
    display_name?: string;
    category?: string;
    description?: string;
    surfaces?: string[];
    levels?: string[];
    styles?: string[];
  };
}

function validate(body: unknown): body is ExplainBody {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return false;
  const b = body as Record<string, unknown>;
  const answers = b.answers;
  const ball = b.ball;
  if (answers === null || typeof answers !== "object" || Array.isArray(answers)) return false;
  if (ball === null || typeof ball !== "object" || Array.isArray(ball)) return false;
  const a = answers as Record<string, unknown>;
  const bl = ball as Record<string, unknown>;
  if (typeof a.ageBracket !== "string" || !AGE_BRACKETS.includes(a.ageBracket as (typeof AGE_BRACKETS)[number]))
    return false;
  if (typeof a.level !== "string" || !LEVELS.includes(a.level as (typeof LEVELS)[number])) return false;
  if (typeof a.surface !== "string" || !SURFACES.includes(a.surface as (typeof SURFACES)[number])) return false;
  if (typeof a.style !== "string" || !STYLES.includes(a.style as (typeof STYLES)[number])) return false;
  if (a.styleText !== undefined && typeof a.styleText !== "string") return false;
  if (typeof bl.display_name !== "string" || typeof bl.category !== "string" || typeof bl.description !== "string")
    return false;
  if (bl.surfaces !== undefined && (!Array.isArray(bl.surfaces) || bl.surfaces.some((x) => typeof x !== "string")))
    return false;
  if (bl.levels !== undefined && (!Array.isArray(bl.levels) || bl.levels.some((x) => typeof x !== "string")))
    return false;
  if (bl.styles !== undefined && (!Array.isArray(bl.styles) || bl.styles.some((x) => typeof x !== "string")))
    return false;
  return true;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    if (!validate(body)) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const prompt = buildExplainPrompt({
      answers: {
        ageBracket: body.answers!.ageBracket!,
        level: body.answers!.level!,
        surface: body.answers!.surface!,
        style: body.answers!.style!,
        styleText: body.answers!.styleText,
      },
      ball: {
        display_name: body.ball!.display_name!,
        category: body.ball!.category!,
        description: body.ball!.description!,
        surfaces: body.ball!.surfaces,
        levels: body.ball!.levels,
        styles: body.ball!.styles,
      },
    });

    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You write short tennis ball explanations. Output plain text only. No markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Explain stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("POST /api/explain error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
