import { useOutletContext } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import SearchResultItem, {
  type SearchResult,
} from "../components/SearchResultItem";
import AIAnswerCard from "../components/AIAnswerCard";

import ScrapeFormatSelector from "../components/ScrapeFormatSelector";

interface OutletContextType {
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  results: SearchResult[];
  status: string;
  isSearching: boolean;
  aiAnswer: string | null;
  handleScrape: (url: string) => void;
}

const SearchResultsView: React.FC = () => {
  const {
    query,
    setQuery,
    handleSearch,
    results,
    status,
    isSearching,
    handleScrape,
    aiAnswer,
  } = useOutletContext<OutletContextType>();

  const mode = useAppSelector((state) => state.search.mode);
  const isLive = mode === "live";

  /* isLive logic is now: const isLive = mode === 'live'; but let's replace the whole header text part */

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/";
          }}
          className="text-text-secondary hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>←</span> Back to Home
        </a>

        <ScrapeFormatSelector />
      </div>

      <p className="text-center text-sm text-text-secondary mb-8 fade-in">
        {isLive
          ? "Uses DuckDuckGo to browse the global internet."
          : "Searches through your previously indexed websites."}
      </p>

      <form onSubmit={handleSearch} className="mb-8 relative z-10 fade-in">
        <div className="relative group">
          <input
            type="text"
            className="glass-input pl-14 pr-32"
            placeholder={isLive ? "Search the web..." : "Search local index..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl opacity-50">
            🔍
          </span>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="glass-button py-2 px-6 text-sm"
            >
              {isSearching
                ? "Thinking..."
                : isLive
                ? "Search Web"
                : "Search Local"}
            </button>
          </div>
        </div>
      </form>

      {status && (
        <div className="text-center mb-8 fade-in text-accent-color font-medium bg-accent-color/5 py-2 px-4 rounded-lg inline-block mx-auto">
          {status}
        </div>
      )}

      {/* AI Answer Card */}
      {aiAnswer && <AIAnswerCard aiAnswer={aiAnswer} />}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <SearchResultItem
            key={index}
            result={result}
            index={index}
            onScrape={handleScrape}
          />
        ))}
      </div>

      {isSearching && (
        <div className="flex justify-center mt-12">
          <div className="loader" />
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;
