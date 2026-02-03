export type PlayerLevel = "beginner" | "intermediate" | "advanced";

export type CourtSurface = "hard" | "clay" | "grass" | "carpet";

export type StyleChoice = "defensive" | "neutral" | "offensive" | "other";

export interface RecommendRequest {
  age: number;
  level: PlayerLevel;
  surface: CourtSurface;
  style: StyleChoice;
  styleText?: string;
}

export interface BallRow {
  id: string;
  brand: string;
  model: string;
  display_name: string;
  category: string;
  age_min: number;
  age_max: number | null;
  description: string;
  priority_rank: number;
}

export interface RecommendResponse {
  recommendedBall: BallRow;
  links: { store: string; youtube: string };
}
