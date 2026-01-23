import React from "react";
import ReactMarkdown from "react-markdown";

export interface SearchResult {
  id: string; // New ID (likely URL)
  parentUrl?: string;
  childrenUrls?: string[];
  content?: string;
  createdAt?: number;
  // Backward compatibility / Live search fields
  url?: string;
  title?: string;
  snippet?: string;
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
  // Normalize fields
  const displayUrl = result.id || result.url || "";
  const displayTitle = result.title || displayUrl;
  const displaySnippet =
    result.snippet ||
    (result.content ? result.content.slice(0, 300) + "..." : "");

  return (
    <div
      className="result-card fade-in relative mb-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="overflow-hidden">
          <h3
            className="font-semibold text-lg text-blue-600 truncate"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-green-700 hover:underline block truncate"
          >
            {displayUrl}
          </a>
          {result.createdAt && (
            <span className="text-xs text-gray-400">
              Indexed: {new Date(result.createdAt * 1000).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={() => onScrape(displayUrl)}
          className="ml-2 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-all cursor-pointer whitespace-nowrap"
        >
          Scrape JSON
        </button>
      </div>

      <div
        className="text-sm text-gray-700 leading-relaxed overflow-hidden"
        style={{ maxHeight: "150px" }}
      >
        {/* Render snippet as HTML if it contains tags (from postgres ts_headline), else Markdown if content */}
        {result.snippet ? (
          <p dangerouslySetInnerHTML={{ __html: result.snippet }} />
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{displaySnippet}</ReactMarkdown>
          </div>
        )}
      </div>

      {result.childrenUrls && result.childrenUrls.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Found {result.childrenUrls.length} links on this page.
        </div>
      )}
    </div>
  );
};

export default SearchResultItem;
