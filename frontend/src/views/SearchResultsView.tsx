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
    <div className="max-w-5xl mx-auto fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div
            onClick={() => {
              window.history.back();
            }}
            className="text-white cursor-pointer text-lg flex gap-2 items-center"
          >
            <svg
              fill="#ffffff"
              height="15px"
              width="15px"
              viewBox="0 0 219.151 219.151"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <path d="M109.576,219.151c60.419,0,109.573-49.156,109.573-109.576C219.149,49.156,169.995,0,109.576,0S0.002,49.156,0.002,109.575 C0.002,169.995,49.157,219.151,109.576,219.151z M109.576,15c52.148,0,94.573,42.426,94.574,94.575 c0,52.149-42.425,94.575-94.574,94.576c-52.148-0.001-94.573-42.427-94.573-94.577C15.003,57.427,57.428,15,109.576,15z"></path>{" "}
                  <path d="M94.861,156.507c2.929,2.928,7.678,2.927,10.606,0c2.93-2.93,2.93-7.678-0.001-10.608l-28.82-28.819l83.457-0.008 c4.142-0.001,7.499-3.358,7.499-7.502c-0.001-4.142-3.358-7.498-7.5-7.498l-83.46,0.008l28.827-28.825 c2.929-2.929,2.929-7.679,0-10.607c-1.465-1.464-3.384-2.197-5.304-2.197c-1.919,0-3.838,0.733-5.303,2.196l-41.629,41.628 c-1.407,1.406-2.197,3.313-2.197,5.303c0.001,1.99,0.791,3.896,2.198,5.305L94.861,156.507z"></path>{" "}
                </g>{" "}
              </g>
            </svg>
            Back
          </div>
        </div>
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
