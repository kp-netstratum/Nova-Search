import React from "react";

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  index: number;
  onScrape: (url: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  index,
  onScrape,
}) => {
  return (
    <div
      className="result-card fade-in"
      style={{ animationDelay: `${index * 0.1}s`, position: "relative" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3>{result.title}</h3>
          <a href={result.url} target="_blank" rel="noreferrer">
            {result.url}
          </a>
        </div>
        <button
          onClick={() => onScrape(result.url)}
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.7rem",
            background: "rgba(56, 189, 248, 0.1)",
            color: "var(--accent-color)",
            border: "1px solid var(--accent-color)",
          }}
        >
          Scrape JSON
        </button>
      </div>
      <p
        dangerouslySetInnerHTML={{ __html: result.snippet }}
        style={{
          color: "var(--text-secondary)",
          marginTop: "0.5rem",
          fontSize: "0.95rem",
        }}
      />
    </div>
  );
};

export default SearchResultItem;
