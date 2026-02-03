"use client";

import { motion } from "framer-motion";
import { toEmbedUrl } from "@/lib/tennis/youtube";

interface VideoCardProps {
  url: string | null;
}

export default function VideoCard({ url }: VideoCardProps) {
  const embedUrl = url ? toEmbedUrl(url) : null;

  return (
    <motion.div
      className="rounded-lg bg-card-bg p-5 font-sans text-white"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded">
          <iframe
            src={embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <p className="text-sm opacity-90">No video</p>
      )}
    </motion.div>
  );
}
