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
    <div
      className="fade-in"
      style={{
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <input
        type="text"
        placeholder="Target Website URL (e.g., https://example.com)"
        value={targetSite}
        onChange={(e) => setTargetSite(e.target.value)}
        style={{
          borderStyle: "dashed",
          borderColor: "var(--accent-color)",
          opacity: 0.8,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <label
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
        >
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
          style={{
            width: "70px",
            padding: "0.5rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
            color: "white",
            fontSize: "0.9rem",
          }}
        />
        <button
          type="button"
          onClick={handleCrawl}
          disabled={isCrawling || !targetSite}
          style={{
            padding: "0.5rem 1rem",
            background: isCrawling
              ? "rgba(56, 189, 248, 0.1)"
              : "var(--accent-color)",
            color: isCrawling ? "rgba(255,255,255,0.5)" : "#000",
            border: "none",
            borderRadius: "8px",
            cursor: isCrawling || !targetSite ? "not-allowed" : "pointer",
            fontWeight: "600",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
            minWidth: "120px",
          }}
        >
          {isCrawling ? "Indexing..." : "Start Indexing"}
        </button>
      </div>
    </div>
  );
};

export default DirectSiteControls;
