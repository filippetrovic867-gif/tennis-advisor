import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BallRow,
  RecommendRequest,
  RecommendResponse,
} from "@/lib/recommendation/types";

export class ValidationError extends Error {
  constructor(public details: string[]) {
    super("Validation error");
    this.name = "ValidationError";
  }
}

type ValidateResult =
  | { valid: true }
  | { valid: false; details: string[] };

const PLAYER_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const COURT_SURFACES = ["hard", "clay", "grass", "carpet"] as const;
const STYLE_CHOICES = ["defensive", "neutral", "offensive", "other"] as const;

function validateInput(req: RecommendRequest): ValidateResult {
  const details: string[] = [];

  if (!Number.isFinite(req.age) || req.age < 3 || req.age > 120) {
    details.push("age must be a number between 3 and 120");
  }
  if (!PLAYER_LEVELS.includes(req.level as (typeof PLAYER_LEVELS)[number])) {
    details.push("level must be one of: beginner, intermediate, advanced");
  }
  if (!COURT_SURFACES.includes(req.surface as (typeof COURT_SURFACES)[number])) {
    details.push("surface must be one of: hard, clay, grass, carpet");
  }
  if (!STYLE_CHOICES.includes(req.style as (typeof STYLE_CHOICES)[number])) {
    details.push("style must be one of: defensive, neutral, offensive, other");
  }

  if (details.length > 0) return { valid: false, details };
  return { valid: true };
}

type CandidateWithMeta = {
  ball: BallRow;
  styles: string[];
  surfaceCount: number;
  links: { store: string; youtube: string };
};

function scoreCandidate(
  styles: string[],
  styleForScoring: string
): number {
  let score = 50 + 25 + 20;

  if (styles.includes(styleForScoring)) {
    score += 15;
  } else if (styles.includes("neutral") || styles.includes("all_round")) {
    score += 8;
  }

  return score;
}

function tieBreakCompare(
  a: BallRow,
  b: BallRow,
  surfaceCounts: Record<string, number>
): number {
  const surfDiff = (surfaceCounts[a.id] ?? 0) - (surfaceCounts[b.id] ?? 0);
  if (surfDiff !== 0) return surfDiff;

  const rankDiff = a.priority_rank - b.priority_rank;
  if (rankDiff !== 0) return rankDiff;

  return a.display_name.localeCompare(b.display_name);
}

function toBallRow(row: Record<string, unknown>): BallRow {
  return {
    id: row.id as string,
    brand: row.brand as string,
    model: row.model as string,
    display_name: row.display_name as string,
    category: row.category as string,
    age_min: row.age_min as number,
    age_max: row.age_max as number | null,
    description: row.description as string,
    priority_rank: row.priority_rank as number,
  };
}

export async function recommendBall(
  input: RecommendRequest
): Promise<RecommendResponse | null> {
  const validation = validateInput(input);
  if (!validation.valid) {
    throw new ValidationError(validation.details);
  }

  const styleForScoring =
    input.style === "other" ? "neutral" : input.style;
  const supabase = createSupabaseServerClient();

  const { data: balls, error: ballsError } = await supabase
    .from("tennis_balls")
    .select("id, brand, model, display_name, category, age_min, age_max, description, priority_rank")
    .lte("age_min", input.age)
    .or(`age_max.is.null,age_max.gte.${input.age}`);

  if (ballsError) throw ballsError;
  if (!balls || balls.length === 0) return null;

  const ids = balls.map((b) => b.id as string);

  const [levelsRes, surfacesRes, stylesRes, linksRes] = await Promise.all([
    supabase.from("ball_levels").select("ball_id, level").in("ball_id", ids),
    supabase.from("ball_surfaces").select("ball_id, surface").in("ball_id", ids),
    supabase.from("ball_styles").select("ball_id, style").in("ball_id", ids),
    supabase
      .from("ball_links")
      .select("ball_id, link_type, url")
      .in("ball_id", ids)
      .in("link_type", ["store", "youtube"]),
  ]);

  if (levelsRes.error || surfacesRes.error || stylesRes.error || linksRes.error) {
    throw levelsRes.error ?? surfacesRes.error ?? stylesRes.error ?? linksRes.error;
  }

  const levelSet = new Map<string, Set<string>>();
  for (const r of levelsRes.data ?? []) {
    const bid = r.ball_id as string;
    if (!levelSet.has(bid)) levelSet.set(bid, new Set());
    levelSet.get(bid)!.add((r.level as string).toLowerCase());
  }

  const surfaceSet = new Map<string, Set<string>>();
  const surfaceCounts: Record<string, number> = {};
  for (const r of surfacesRes.data ?? []) {
    const bid = r.ball_id as string;
    if (!surfaceSet.has(bid)) surfaceSet.set(bid, new Set());
    surfaceSet.get(bid)!.add((r.surface as string).toLowerCase());
    surfaceCounts[bid] = (surfaceCounts[bid] ?? 0) + 1;
  }

  const styleSet = new Map<string, Set<string>>();
  for (const r of stylesRes.data ?? []) {
    const bid = r.ball_id as string;
    if (!styleSet.has(bid)) styleSet.set(bid, new Set());
    styleSet.get(bid)!.add((r.style as string).toLowerCase());
  }

  const linkMap = new Map<
    string,
    { store?: string; youtube?: string }
  >();
  for (const r of linksRes.data ?? []) {
    const bid = r.ball_id as string;
    const type = (r.link_type as string).toLowerCase();
    const url = r.url as string;
    if (!linkMap.has(bid)) linkMap.set(bid, {});
    const entry = linkMap.get(bid)!;
    if (type === "store") entry.store = url;
    else if (type === "youtube") entry.youtube = url;
  }

  const ballById = new Map(balls.map((b) => [b.id as string, b]));
  const candidates: CandidateWithMeta[] = [];

  for (const ball of balls) {
    const bid = ball.id as string;
    const links = linkMap.get(bid);
    if (!links?.store || !links?.youtube) continue;

    const hasLevel = levelSet.get(bid)?.has(input.level) ?? false;
    const hasSurface = surfaceSet.get(bid)?.has(input.surface) ?? false;
    if (!hasLevel || !hasSurface) continue;

    const styles = Array.from(styleSet.get(bid) ?? []);
    candidates.push({
      ball: toBallRow(ball),
      styles,
      surfaceCount: surfaceCounts[bid] ?? 0,
      links: { store: links.store, youtube: links.youtube },
    });
  }

  if (candidates.length === 0) return null;

  const scored = candidates.map((c) => ({
    ...c,
    score: scoreCandidate(c.styles, styleForScoring),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return tieBreakCompare(a.ball, b.ball, surfaceCounts);
  });

  const winner = scored[0];
  return {
    recommendedBall: winner.ball,
    links: winner.links,
  };
}
