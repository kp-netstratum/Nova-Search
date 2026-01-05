import React from "react";

type SearchMode = "live" | "local" | "site";

interface SearchControlsProps {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  setResults: (results: any[]) => void;
  setStatus: (status: string) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  searchMode,
  setSearchMode,
  setResults,
  setStatus,
}) => {
  const modes: { id: SearchMode; label: string }[] = [
    { id: "live", label: "Live Search" },
    { id: "local", label: "Local Index" },
    { id: "site", label: "Direct Site" },
  ];

  return (
    <>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            padding: "0.25rem",
            borderRadius: "12px",
            display: "flex",
            gap: "0.25rem",
            border: "1px solid var(--glass-border)",
          }}
        >
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setSearchMode(mode.id);
                setResults([]);
                setStatus("");
              }}
              style={{
                background:
                  searchMode === mode.id
                    ? "var(--accent-color)"
                    : "transparent",
                color: searchMode === mode.id ? "var(--bg-color)" : "white",
                padding: "0.5rem 1.5rem",
                borderRadius: "8px",
                transition: "all 0.3s",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </section>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "2rem",
          minHeight: "1.2rem",
        }}
      >
        {searchMode === "live" &&
          "Uses DuckDuckGo to browse the global internet."}
        {searchMode === "local" &&
          "Searches through your previously indexed websites."}
        {searchMode === "site" &&
          "Crawls the entire website, stores data locally, then searches the stored index."}
      </p>
    </>
  );
};

export default SearchControls;
