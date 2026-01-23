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
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center fade-in">
      <form
        onSubmit={onSubmit}
        className="relative group max-w-2xl mx-auto w-full"
      >
        <input
          type="text"
          className="glass-input pl-14 pr-32 py-4 text-lg w-full rounded-full shadow-lg shadow-sky-500/10 focus:shadow-sky-500/20 transition-all border border-glass-border bg-white/5 backdrop-blur-md"
          placeholder="Enter your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl opacity-50">
          🔍
        </span>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <button
            type="submit"
            disabled={isSearching}
            className="glass-button py-2 px-6 rounded-full font-medium"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomeView;
