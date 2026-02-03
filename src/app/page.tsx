"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RecommendResponse } from "@/lib/recommendation/types";
import Header from "@/components/tennis/Header";
import Intro from "@/components/tennis/Intro";
import QuestionCard, {
  type QuestionAnswers,
  type QuestionStep,
} from "@/components/tennis/QuestionCard";
import WhyCard from "@/components/tennis/WhyCard";
import VideoCard from "@/components/tennis/VideoCard";

const AGE_TO_NUMBER: Record<string, number> = {
  "3–6": 4,
  "7–9": 8,
  "10–11": 10,
  "12+": 18,
};

function buildPayload(answers: QuestionAnswers): {
  age: number;
  level: "beginner" | "intermediate" | "advanced";
  surface: "hard" | "clay" | "grass" | "carpet";
  style: "offensive" | "defensive" | "neutral";
} | null {
  if (!answers.age || !answers.level || !answers.surface || !answers.style) {
    return null;
  }
  const age = AGE_TO_NUMBER[answers.age];
  if (age === undefined) return null;
  const level = answers.level.toLowerCase() as "beginner" | "intermediate" | "advanced";
  const surface = answers.surface.toLowerCase() as "hard" | "clay" | "grass" | "carpet";
  const style =
    answers.style === "Other"
      ? ("neutral" as const)
      : (answers.style.toLowerCase() as "offensive" | "defensive" | "neutral");
  return { age, level, surface, style };
}

export default function Home() {
  const [step, setStep] = useState<QuestionStep>(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [styleText, setStyleText] = useState("");
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [loaderPhraseIndex, setLoaderPhraseIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoaderPhraseIndex((i) => (i + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [loading]);

  const callRecommend = useCallback(async (payload: ReturnType<typeof buildPayload>, styleTextToSend?: string) => {
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      const body = styleTextToSend !== undefined ? { ...payload, styleText: styleTextToSend } : payload;
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setRecommendation(data as RecommendResponse);
      setStep("result");
      setExplanationText("");
      setExplainError(null);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const onAnswer = useCallback(
    (question: keyof QuestionAnswers, value: string) => {
      const next = { ...answers, [question]: value };
      setAnswers(next);
      if (question === "age") setStep(1);
      else if (question === "level") setStep(2);
      else if (question === "surface") setStep(3);
      else if (question === "style") {
        if (value === "Other") {
          setStep("other");
        } else {
          const payload = buildPayload(next);
          if (payload) callRecommend(payload);
        }
      }
    },
    [answers, callRecommend]
  );

  useEffect(() => {
    if (!recommendation) {
      setExplanationText("");
      setIsExplaining(false);
      setExplainError(null);
    }
  }, [recommendation]);

  const onStyleContinue = useCallback(
    async (text: string) => {
      setStyleText(text);
      let styleForRecommend: "offensive" | "defensive" | "neutral" = "neutral";
      try {
        const res = await fetch("/api/style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.primary === "offensive" || data.primary === "defensive" || data.primary === "neutral") {
            styleForRecommend = data.primary;
          }
        }
      } catch {
        // keep neutral
      }
      const age = AGE_TO_NUMBER[answers.age ?? ""];
      if (age === undefined || !answers.level || !answers.surface) return;
      const level = answers.level.toLowerCase() as "beginner" | "intermediate" | "advanced";
      const surface = answers.surface.toLowerCase() as "hard" | "clay" | "grass" | "carpet";
      const payload = { age, level, surface, style: styleForRecommend };
      callRecommend(payload, text);
    },
    [answers, callRecommend]
  );

  return (
    <div className="min-h-screen bg-[#040247] font-sans">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Header />
        <Intro />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <QuestionCard
              step={step}
              answers={answers}
              styleText={styleText}
              recommendation={recommendation}
              onAnswer={onAnswer}
              onStyleContinue={onStyleContinue}
              onExplanationUpdate={(text, isLoading, err) => {
                setExplanationText(text);
                setIsExplaining(isLoading);
                setExplainError(err);
              }}
            />
            {loading && (
              <div
                className="mt-2 flex items-center gap-3"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#3881f5]/30 border-t-[#3881f5]"
                  aria-hidden
                />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loaderPhraseIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="text-white"
                  >
                    {["Researching...", "Analyzing...", "Writing..."][loaderPhraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
          {recommendation && (
            <div className="flex flex-col gap-6">
              <WhyCard
                text={explanationText}
                isLoading={isExplaining}
                error={explainError}
              />
              <VideoCard url={recommendation.links.youtube} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
