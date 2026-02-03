export interface ExplainAnswers {
  ageBracket: string;
  level: string;
  surface: string;
  style: string;
  styleText?: string;
}

export interface ExplainBall {
  display_name: string;
  category: string;
  description: string;
  surfaces?: string[];
  levels?: string[];
  styles?: string[];
}

export interface ExplainPromptParams {
  answers: ExplainAnswers;
  ball: ExplainBall;
}

export function buildExplainPrompt(params: ExplainPromptParams): string {
  const { answers, ball } = params;
  const styleTextLine = answers.styleText
    ? ` They described their style as: "${answers.styleText}".`
    : "";

  return `You write a short, friendly explanation of why this tennis ball fits the player. Output plain text only. No markdown, no bullets, no headers. Keep it to about 120–220 words.

Structure: one short punchy opener; then 3–5 short paragraph-like lines that tie the ball's features to the player's answers; end with one closing line that is confident and encouraging.

Use only these facts:
- Player: age bracket ${answers.ageBracket}, level ${answers.level}, surface ${answers.surface}, style ${answers.style}.${styleTextLine}
- Ball: ${ball.display_name} (category: ${ball.category}). ${ball.description}${ball.surfaces?.length ? ` Surfaces: ${ball.surfaces.join(", ")}.` : ""}${ball.levels?.length ? ` Levels: ${ball.levels.join(", ")}.` : ""}${ball.styles?.length ? ` Styles: ${ball.styles.join(", ")}.` : ""}

Rules: Be factual and grounded only in the user's answers and this ball. Do not recommend other balls. Do not speculate about pro-level performance. Do not mention database, prompt, OpenAI, or any internal tooling. Tone: friendly, fast, fun, clear.`;
}
