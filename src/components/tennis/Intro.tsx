"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Play better with the right tennis ball.",
  "Answer a few quick questions and we'll find the best match for your game.",
];

export default function Intro() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % 2), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.section
      className="font-sans text-[#7f94ad] mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={idx}
          className="text-[25px] font-semibold opacity-40 antialiased tracking-[0.2px] bg-gradient-to-b from-[#66a3ff] to-[#3881f5] bg-clip-text text-transparent transition-opacity duration-300 ease-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {messages[idx]}
        </motion.h1>
      </AnimatePresence>
    </motion.section>
  );
}
