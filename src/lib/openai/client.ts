import OpenAI from "openai";

let instance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (instance) return instance;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === "") {
    throw new Error("Missing OPENAI_API_KEY");
  }
  instance = new OpenAI({ apiKey: key });
  return instance;
}
