/**
 * Converts a YouTube watch or short URL to an embed URL.
 * Supports youtube.com/watch?v=ID and youtu.be/ID; extra params are ignored.
 */
export function toEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "www.youtube.com" && parsed.pathname === "/watch") {
      const v = parsed.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) {
        return `https://www.youtube.com/embed/${v}`;
      }
      return null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (id && /^[\w-]{11}$/.test(id)) {
        return `https://www.youtube.com/embed/${id}`;
      }
      return null;
    }

    return null;
  } catch {
    return null;
  }
}
