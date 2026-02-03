"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RecommendResponse } from "@/lib/recommendation/types";
import StorePreviewCard from "./StorePreviewCard";

const AGE_OPTIONS = ["3–6", "7–9", "10–11", "12+"] as const;
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
const SURFACE_OPTIONS = ["Hard", "Clay", "Grass", "Carpet"] as const;
const STYLE_OPTIONS = ["Offensive", "Defensive", "Neutral", "Other"] as const;

const QUESTION_LABELS: Record<number, string> = {
  0: "What's your age range?",
  1: "What's your level?",
  2: "What surface do you play on?",
  3: "What's your playing style?",
};

export interface QuestionAnswers {
  age?: (typeof AGE_OPTIONS)[number];
  level?: (typeof LEVEL_OPTIONS)[number];
  surface?: (typeof SURFACE_OPTIONS)[number];
  style?: (typeof STYLE_OPTIONS)[number];
}

export type QuestionStep = 0 | 1 | 2 | 3 | "other" | "result";

interface QuestionCardProps {
  step: QuestionStep;
  answers: QuestionAnswers;
  styleText: string;
  recommendation: RecommendResponse | null;
  onAnswer: (question: keyof QuestionAnswers, value: string) => void;
  onStyleContinue: (styleText: string) => void;
  onExplanationUpdate?: (text: string, isLoading: boolean, error: string | null) => void;
}

function HistoryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1 text-sm opacity-90">
      <span className="font-semibold">{label}</span>
      <span className="ml-2 font-medium">{value}</span>
    </div>
  );
}

const stepVariants = {
  enter: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};
const resultVariants = {
  enter: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const EXPLAIN_ERROR_MSG = "Could not load explanation. Please try again.";

const SHARE_BUTTON = {
  buttonPremium: "transition-transform hover:opacity-90 active:scale-[0.97]",
  buttonWrapper: "group relative overflow-hidden",
  glassOverlay:
    "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/15 to-white/0",
  iconRotateOpen: "rotate-[12deg]",
  iconTransition: "transition-transform duration-200 ease-out",
} as const;

const OPTION_BUTTON_CLASS =
  "rounded px-3 py-2 text-sm text-white bg-white/20 hover:bg-white/25 backdrop-blur-sm cursor-pointer transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.01] hover:shadow-lg hover:shadow-black/30 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3881f5]/40 focus-visible:ring-offset-0";

export default function QuestionCard({
  step,
  answers,
  styleText,
  recommendation,
  onAnswer,
  onStyleContinue,
  onExplanationUpdate,
}: QuestionCardProps) {
  const [localStyleText, setLocalStyleText] = useState(styleText);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const explainAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!recommendation || !onExplanationUpdate) return;
    const ball = recommendation.recommendedBall;
    const ageBracket = answers.age ?? "12+";
    const level = (answers.level ?? "Beginner").toLowerCase() as "beginner" | "intermediate" | "advanced";
    const surface = (answers.surface ?? "Hard").toLowerCase() as "hard" | "clay" | "grass" | "carpet";
    const style =
      answers.style === "Other"
        ? "neutral"
        : ((answers.style ?? "Neutral").toLowerCase() as "offensive" | "defensive" | "neutral");

    const body = {
      answers: {
        ageBracket,
        level,
        surface,
        style,
        ...(styleText.trim() ? { styleText: styleText.trim() } : {}),
      },
      ball: {
        display_name: ball.display_name,
        category: ball.category,
        description: ball.description,
      },
    };

    explainAbortRef.current = new AbortController();
    const signal = explainAbortRef.current.signal;

    (async () => {
      onExplanationUpdate("", true, null);
      let buffer = "";
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        });
        if (!res.ok || !res.body) {
          onExplanationUpdate("", false, EXPLAIN_ERROR_MSG);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          onExplanationUpdate(buffer, true, null);
        }
        onExplanationUpdate(buffer, false, null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        onExplanationUpdate(buffer, false, EXPLAIN_ERROR_MSG);
      }
    })();

    return () => {
      explainAbortRef.current?.abort();
    };
  }, [recommendation]);

  function handleCopyLink() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleOpenShare(shareUrl: string) {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  useEffect(() => {
    if (!shareOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShareOpen(false);
    }
    function onMouseDown(e: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [shareOpen]);

  const history: { label: string; value: string }[] = [];
  if (answers.age) history.push({ label: "Age?", value: answers.age });
  if (answers.level) history.push({ label: "Level?", value: answers.level });
  if (answers.surface) history.push({ label: "Surface?", value: answers.surface });
  if (answers.style) history.push({ label: "Style?", value: answers.style });

  return (
    <div className="relative rounded-lg bg-card-bg p-5 font-sans text-white">
      <p className="mb-2 text-[18px] font-bold antialiased tracking-[0.2px] bg-gradient-to-b from-[#66a3ff] to-[#3881f5] bg-clip-text text-transparent">Questions</p>
      <div ref={shareMenuRef} className="absolute right-4 top-4">
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          className={`min-w-[4.5rem] text-sm text-white ${SHARE_BUTTON.buttonWrapper} ${SHARE_BUTTON.buttonPremium}`}
        >
          <span
            aria-hidden
            className={`${SHARE_BUTTON.glassOverlay} rounded`}
          />
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex shrink-0 ${SHARE_BUTTON.iconTransition} ${shareOpen ? SHARE_BUTTON.iconRotateOpen : ""}`}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.82 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </span>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  Share
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
        {shareOpen && (
          <div
            className="absolute right-0 top-full z-10 mt-1 min-w-[10rem] rounded-lg bg-[rgba(11,38,128,0.25)] py-1 shadow-lg backdrop-blur-sm"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                handleCopyLink();
                setShareOpen(false);
              }}
            >
              Copy link
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                const url = window.location.href;
                const enc = encodeURIComponent;
                handleOpenShare(
                  `mailto:?subject=${enc("Tennis Assistant")}&body=${enc("Check this out: " + url)}`
                );
              }}
            >
              Email
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                const url = window.location.href;
                const enc = encodeURIComponent;
                handleOpenShare(
                  `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc("Tennis Assistant")}`
                );
              }}
            >
              X (Twitter)
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                const url = window.location.href;
                const enc = encodeURIComponent;
                handleOpenShare(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`
                );
              }}
            >
              LinkedIn
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                const url = window.location.href;
                const enc = encodeURIComponent;
                handleOpenShare(
                  `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
                );
              }}
            >
              Facebook
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                const url = window.location.href;
                const enc = encodeURIComponent;
                handleOpenShare(`https://wa.me/?text=${enc("Check this out: " + url)}`);
              }}
            >
              WhatsApp
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                handleCopyLink();
                setShareOpen(false);
              }}
            >
              Instagram
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mb-4 pr-16">
          {history.map((h) => (
            <HistoryLine key={h.label} label={h.label} value={h.value} />
          ))}
        </div>
      )}

      <div className="pr-16" style={{ minHeight: "140px" }}>
        <AnimatePresence mode="wait">
          {recommendation ? (
            <motion.div
              key="result"
              variants={resultVariants}
              initial="enter"
              animate="animate"
              exit="exit"
              className="pr-0"
            >
              <h2 className="text-lg font-semibold">
                We found your perfect ball: {recommendation.recommendedBall.display_name}
              </h2>
              <StorePreviewCard storeUrl={recommendation.links.store} />
            </motion.div>
          ) : step === "other" ? (
            <motion.div
              key="other"
              variants={stepVariants}
              initial="enter"
              animate="animate"
              exit="exit"
              className="pr-0"
            >
              <p className="mb-2 text-sm opacity-90">Describe your playing style (optional).</p>
              <input
                type="text"
                value={localStyleText}
                onChange={(e) => setLocalStyleText(e.target.value)}
                placeholder="e.g. aggressive at net"
                className="mb-3 w-full rounded bg-white/20 px-3 py-2 text-white placeholder:text-white/60"
              />
              <button
                type="button"
                onClick={() => onStyleContinue(localStyleText)}
                className="rounded bg-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/30"
              >
                Continue
              </button>
            </motion.div>
          ) : typeof step === "number" && step >= 0 && step <= 3 ? (
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="animate"
              exit="exit"
              className="pr-0"
            >
              <p className="mb-3 text-sm font-medium opacity-95">
                {QUESTION_LABELS[step]}
              </p>
              <div className="flex flex-wrap gap-2">
                {step === 0 &&
                  AGE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onAnswer("age", opt)}
                      className={OPTION_BUTTON_CLASS}
                    >
                      {opt}
                    </button>
                  ))}
                {step === 1 &&
                  LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onAnswer("level", opt)}
                      className={OPTION_BUTTON_CLASS}
                    >
                      {opt}
                    </button>
                  ))}
                {step === 2 &&
                  SURFACE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onAnswer("surface", opt)}
                      className={OPTION_BUTTON_CLASS}
                    >
                      {opt}
                    </button>
                  ))}
                {step === 3 &&
                  STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onAnswer("style", opt)}
                      className={OPTION_BUTTON_CLASS}
                    >
                      {opt}
                    </button>
                  ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
