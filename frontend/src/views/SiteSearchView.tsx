import React from "react";
import { useOutletContext } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import DirectSiteControls from "../components/DirectSiteControls";

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
    isSearching,
    targetSite,
    setTargetSite,
    maxPages,
    setMaxPages,
    handleCrawl,
    isCrawling,
    messages,
    handleChatMessage,
  } = useOutletContext<OutletContextType>();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <p className="text-center text-sm text-text-secondary mb-8 fade-in">
        Crawls the entire website, stores data locally, then chat with the
        content using AI.
      </p>

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

      <div className="mt-8">
        <ChatInterface
          targetSite={targetSite}
          messages={messages}
          onSendMessage={handleChatMessage}
          isLoading={isSearching}
        />
      </div>
    </div>
  );
};

export default SiteSearchView;
