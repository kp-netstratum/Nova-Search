import React from "react";

interface DirectSiteControlsProps {
  targetSite: string;
  setTargetSite: (url: string) => void;
  maxPages: number;
  setMaxPages: (pages: number) => void;
  handleCrawl: () => void;
  isCrawling: boolean;
}

const DirectSiteControls: React.FC<DirectSiteControlsProps> = ({
  targetSite,
  setTargetSite,
  maxPages,
  setMaxPages,
  handleCrawl,
  isCrawling,
}) => {
  return (
    <div className="fade-in mb-4 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Target Website URL (e.g., https://example.com)"
        value={targetSite}
        onChange={(e) => setTargetSite(e.target.value)}
        className="glass-input border-dashed border-accent-color/50 opacity-80 focus:opacity-100"
      />
      <div className="flex items-center gap-4">
        <label className="text-text-secondary text-sm whitespace-nowrap">
          Max Pages:
        </label>
        <input
          type="number"
          min="1"
          max="500"
          value={maxPages}
          onChange={(e) =>
            setMaxPages(
              Math.max(1, Math.min(500, parseInt(e.target.value) || 15))
            )
          }
          className="w-[70px] p-2 bg-white/5 border border-glass-border rounded-lg text-white text-sm focus:outline-none focus:border-accent-color transition-colors"
        />
        <button
          type="button"
          onClick={handleCrawl}
          disabled={isCrawling || !targetSite}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap min-w-[120px] transition-all
            ${
              isCrawling || !targetSite
                ? "bg-sky-500/10 text-white/50 cursor-not-allowed"
                : "bg-accent-color text-black hover:-translate-y-0.5"
            }
          `}
        >
          {isCrawling ? "Indexing..." : "Start Indexing"}
        </button>
      </div>
    </div>
  );
};

export default DirectSiteControls;
