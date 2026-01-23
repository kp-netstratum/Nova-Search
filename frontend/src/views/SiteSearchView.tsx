import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../store/hooks";
// import {
//   loadCrawlFromHistory,
//   removeFromCrawlHistory,
// } from "../store/searchSlice";
import DirectSiteControls from "../components/DirectSiteControls";
// import CrawlHistoryCard from "../components/CrawlHistoryCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OutletContextType {
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  status: string;
  isSearching: boolean;
  // Site Specific
  targetSite: string;
  setTargetSite: (url: string) => void;
  maxPages: number;
  setMaxPages: (pages: number) => void;
  handleCrawl: () => void;
  isCrawling: boolean;
  // Chat
  messages: Message[];
  handleChatMessage: (message: string) => void;
}

const SiteSearchView: React.FC = () => {
  const {
    status,
    handleCrawl,
    isCrawling,
    targetSite,
    setTargetSite,
    maxPages,
    setMaxPages,
  } = useOutletContext<OutletContextType>();

  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  // const crawlHistory = useAppSelector((state) => state.search.crawlHistory);

  React.useEffect(() => {
    if (status && status.includes("Successfully indexed") && !isCrawling) {
      const timer = setTimeout(() => {
        navigate("/chat");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, isCrawling, navigate]);

  // const handleLoadFromHistory = (url: string) => {
  //   dispatch(loadCrawlFromHistory(url));
  //   // Navigate to chat after a brief delay to show the status update
  //   setTimeout(() => {
  //     navigate("/chat");
  //   }, 500);
  // };

  // const handleDeleteFromHistory = (url: string) => {
  //   dispatch(removeFromCrawlHistory(url));
  // };

  return (
    <div className="max-w-4xl mx-auto fade-in h-full flex flex-col justify-center">
      <div className="mb-10 text-center">
        <h2 className="text-5xl font-bold mb-4 bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Direct Site Search
        </h2>
        <p className="text-text-secondary">
          Enter a URL to crawl and index its content for AI chatting.
        </p>
      </div>

      <DirectSiteControls
        targetSite={targetSite}
        setTargetSite={setTargetSite}
        maxPages={maxPages}
        setMaxPages={setMaxPages}
        handleCrawl={handleCrawl}
        isCrawling={isCrawling}
      />

      {status && (
        <div className="text-center mb-8 fade-in text-accent-color font-medium bg-accent-color/5 py-2 px-4 rounded-lg inline-block mx-auto">
          {status}
        </div>
      )}

      {/* Manual link just in case */}
      {!isCrawling && status && status.includes("Successfully indexed") && (
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/chat")}
            className="glass-button py-2 px-6"
          >
            Start Chatting
          </button>
        </div>
      )}

      {/* Crawl History Section */}
      {/* {crawlHistory.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-white mb-4">
            Previous Crawls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crawlHistory.map((item) => (
              <CrawlHistoryCard
                key={item.url}
                item={item}
                onLoad={handleLoadFromHistory}
                onDelete={handleDeleteFromHistory}
              />
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SiteSearchView;
