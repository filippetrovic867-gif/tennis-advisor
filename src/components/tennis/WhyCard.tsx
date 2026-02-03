"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WhyCardProps {
  text: string;
  isLoading: boolean;
  error: string | null;
}

const LOADING_PHRASES = ["Researching...", "Analyzing...", "Writing..."] as const;

export default function WhyCard({ text, isLoading, error }: WhyCardProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setPhraseIndex((i) => (i + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [isLoading]);

  return (
    <motion.div
      className="rounded-lg bg-card-bg p-5 font-sans text-white"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {isLoading && (
        <div
          className="flex items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <div
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#3881f5]/30 border-t-[#3881f5]"
            aria-hidden
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={phraseIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="text-white"
            >
              {LOADING_PHRASES[phraseIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
      {!isLoading && error && <p>{error}</p>}
      {!isLoading && !error && text && (
        <>
          <p className="mb-2 text-[18px] font-bold antialiased tracking-[0.2px] bg-gradient-to-b from-[#66a3ff] to-[#3881f5] bg-clip-text text-transparent">Why this ball fits your game?</p>
          <p className="whitespace-pre-wrap font-medium" style={{ whiteSpace: "pre-wrap" }}>
            {text}
          </p>
        </>
      )}
      {!isLoading && !error && !text && (
        <p className="text-sm opacity-90">Why this ball fits you (explanation will appear here).</p>
      )}
    </motion.div>
  );
}
