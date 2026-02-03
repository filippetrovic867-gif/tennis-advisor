"use client";

interface StorePreviewCardProps {
  storeUrl: string;
}

function getDomain(url: string): string {
  try {
    let hostname = new URL(url).hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return "";
  }
}

function getStoreMeta(
  hostname: string
): { label: string; logoSrc: string | null } {
  if (hostname.endsWith("tennis-warehouse.com")) {
    return { label: "Tennis Warehouse", logoSrc: "/stores/tennis-warehouse.svg" };
  }
  if (hostname.endsWith("amazon.com")) {
    return { label: "Amazon", logoSrc: "/stores/amazon.svg" };
  }
  if (hostname.endsWith("smash-expert.com")) {
    return { label: "Smash Expert", logoSrc: "/stores/smash-expert.svg" };
  }
  return { label: "Store", logoSrc: null };
}

export default function StorePreviewCard({ storeUrl }: StorePreviewCardProps) {
  const hostname = getDomain(storeUrl);
  const { label, logoSrc } = getStoreMeta(hostname);

  function openStore() {
    window.open(storeUrl, "_blank", "noopener,noreferrer");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openStore();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openStore}
      onKeyDown={handleKeyDown}
      className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg bg-card-bg-store p-4 font-sans text-white transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.01] hover:opacity-95 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3881f5]/40"
    >
      {logoSrc && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/90">
          <img src={logoSrc} alt={`${label} logo`} className="h-6 w-auto" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium">Buy on {label}</div>
        <div className="text-sm opacity-90">
          {hostname || "Unknown domain"}
        </div>
      </div>
      <span className="shrink-0 font-medium opacity-95">Open →</span>
    </div>
  );
}
