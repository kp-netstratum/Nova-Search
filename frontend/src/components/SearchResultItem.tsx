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
      className="result-card fade-in relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{result.title}</h3>
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-accent-color"
          >
            {result.url}
          </a>
        </div>
        <button
          onClick={() => onScrape(result.url)}
          className="px-3 py-1.5 text-xs font-semibold bg-sky-500/10 text-accent-color border border-accent-color rounded hover:bg-sky-500/20 transition-all cursor-pointer"
        >
          Scrape JSON
        </button>
      </div>
      <p
        dangerouslySetInnerHTML={{ __html: result.snippet }}
        className="mt-2 text-text-secondary text-sm leading-relaxed"
      />
    </div>
  );
};

export default SearchResultItem;
