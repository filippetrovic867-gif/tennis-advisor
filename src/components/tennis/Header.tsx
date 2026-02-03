"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SHARE_BUTTON = {
  buttonPremium: "transition-transform hover:opacity-90 active:scale-[0.97]",
  buttonWrapper: "group relative overflow-hidden",
  glassOverlay:
    "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/15 to-white/0",
  iconRotateOpen: "rotate-[12deg]",
  iconTransition: "transition-transform duration-200 ease-out",
} as const;

export default function Header() {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="flex w-full items-center justify-between font-sans text-white">
      <div className="flex items-center">
        <Image
          src="/tennis-advisor.svg"
          alt="Tennis Advisor"
          width={28}
          height={28}
          priority
          className="h-10 w-auto"
        />
      </div>
      <div ref={shareMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          className={`min-w-[4.5rem] rounded px-3 py-1.5 text-sm text-white ${SHARE_BUTTON.buttonWrapper} ${SHARE_BUTTON.buttonPremium}`}
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
    </header>
  );
}
