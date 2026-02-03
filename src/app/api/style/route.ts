import { NextResponse } from "next/server";
import { classifyStyle } from "@/lib/tennis/styleClassifier";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const text = (body as Record<string, unknown>).text;
    if (typeof text !== "string" || text.trim().length < 3) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const result = await classifyStyle(text);

    const payload: { primary: string; secondary?: string; confidence: number } = {
      primary: result.primary,
      confidence: result.confidence,
    };
    if (result.secondary !== undefined) {
      payload.secondary = result.secondary;
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/style error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
