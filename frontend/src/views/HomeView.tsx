import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { type SearchResult } from "../components/SearchResultItem";

interface OutletContextType {
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  results: SearchResult[];
  status: string;
  isSearching: boolean;
}

const HomeView: React.FC = () => {
  const { query, setQuery, handleSearch, isSearching } =
    useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Perform search
    handleSearch(e);
    // Navigate to results page
    navigate("/results");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] h-full fade-in">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          What can I help you find today?
        </h2>
        <p className="text-text-secondary text-lg max-w-lg mx-auto">
          Search the web or chat with indexed content from your sidebar.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative group max-w-3xl mx-auto w-full"
      >
        <input
          type="text"
          className="glass-input pl-14 pr-32 py-5 text-xl w-full rounded-2xl shadow-xl shadow-sky-500/5 focus:shadow-sky-500/10 transition-all border border-glass-border bg-white/5 backdrop-blur-md"
          placeholder="Ask anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl opacity-50">
          🔍
        </span>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <button
            type="submit"
            disabled={isSearching}
            className="glass-button py-2.5 px-8 rounded-xl font-medium"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomeView;
