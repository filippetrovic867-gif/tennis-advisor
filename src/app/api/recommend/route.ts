import { NextResponse } from "next/server";
import { recommendBall } from "@/lib/recommendation/recommend";
import { ValidationError } from "@/lib/recommendation/recommend";
import type { RecommendRequest } from "@/lib/recommendation/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = body as RecommendRequest;

    const result = await recommendBall(parsed);

    if (!result) {
      return NextResponse.json(
        { error: "No matching ball found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/recommend error:", err);

    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: err.details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
