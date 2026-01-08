import { useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import "./index.css";
import { type SearchResult } from "./components/SearchResultItem";
import FileViewerModal, { type ViewFormat } from "./components/FileViewerModal";
import SearchControls from "./components/SearchControls";
import SearchResultsView from "./views/SearchResultsView";
import SiteSearchView from "./views/SiteSearchView";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LayoutProps {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  setResults: (r: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (b: boolean) => void;
  isCrawling: boolean;
  setIsCrawling: (b: boolean) => void;
  status: string;
  setStatus: (s: string) => void;
  targetSite: string;
  setTargetSite: (s: string) => void;
  maxPages: number;
  setMaxPages: (n: number) => void;
  aiAnswer: string | null;
  setAiAnswer: (s: string | null) => void;
  messages: Message[];
  handleSearch: (e: React.FormEvent) => void;
  handleScrape: (url: string) => void;
  handleCrawl: () => void;
  handleChatMessage: (message: string) => void;
}

function Layout(props: LayoutProps) {
  return (
    <div className="glass-container w-[1200px] relative fade-in mx-auto px-12 py-8 min-h-[90vh] flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          Nova Search
        </h1>
        <p className="text-text-secondary text-lg">
          Intelligent Search & Crawling Agent
        </p>
      </header>

      <SearchControls
        setResults={props.setResults}
        setStatus={props.setStatus}
      />

      <Outlet context={props} />

      <footer className="mt-auto text-center text-text-secondary text-sm pt-8">
        <p>
          &copy; {new Date().getFullYear()} Nova Search Agent. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

function App() {
  // Hoisted state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [status, setStatus] = useState("");
  const [targetSite, setTargetSite] = useState("");
  const [maxPages, setMaxPages] = useState(15);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Modal State
  const [viewerContent, setViewerContent] = useState<{
    content: string;
    format: ViewFormat;
    title: string;
    type: "search" | "scrape";
    metadata?: any;
    url?: string;
  } | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Router hooks
  const location = useLocation();

  // Helper
  const getSearchMode = () => {
    if (location.pathname.includes("local")) return "local";
    if (location.pathname.includes("site")) return "site";
    return "live";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return;

    const mode = getSearchMode();

    if (mode === "site" && !targetSite) {
      setStatus("Please provide a Target Site URL (e.g., https://example.com)");
      return;
    }

    let normalizedSite = targetSite;
    if (mode === "site" && targetSite) {
      if (!targetSite.startsWith("http")) {
        normalizedSite = "https://" + targetSite;
      }
    }

    setIsSearching(true);
    setResults([]);
    setAiAnswer(null);

    if (mode === "site") {
      setStatus(
        `Step 1/3: Crawling ${normalizedSite} (up to ${maxPages} pages)...`
      );
    } else {
      setStatus(
        mode === "live"
          ? "Searching the internet..."
          : "Searching local index..."
      );
    }

    try {
      let url = `http://localhost:8001/search`;
      if (mode === "live") {
        url = `http://localhost:8001/search/live?q=${encodeURIComponent(
          query
        )}`;
      } else {
        url = `http://localhost:8001/search?q=${encodeURIComponent(query)}`;
      }

      const resp = await fetch(url);
      const data = await resp.json();

      if (mode === "site" && data.metadata) {
        const results = data.results || [];
        const metadata = data.metadata;
        setResults(results);
        setAiAnswer(data.ai_answer || null);
        setStatus(
          results.length > 0
            ? `✓ Found ${results.length} results from ${normalizedSite} | ${metadata.pages_stored} pages crawled and stored in local database`
            : `✓ Site crawled and stored (${metadata.pages_stored} pages) | No results found for "${query}"`
        );
      } else {
        setResults(data);
        setStatus(data.length > 0 ? "" : "No results found.");
      }
    } catch (err) {
      setStatus("Error fetching results. Is the backend running?");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCrawl = async () => {
    const urlToCrawl = targetSite;

    if (!urlToCrawl) {
      setStatus("Please enter a URL to crawl.");
      return;
    }

    let normalizedCrawlUrl = urlToCrawl;
    if (!urlToCrawl.startsWith("http")) {
      normalizedCrawlUrl = "https://" + urlToCrawl;
    }

    setIsCrawling(true);
    setStatus(`Starting crawl for ${normalizedCrawlUrl}...`);
    try {
      const resp = await fetch("http://localhost:8001/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedCrawlUrl, max_pages: maxPages }),
      });
      const data = await resp.json();
      setStatus(
        `✓ Successfully indexed ${data.pages_crawled} pages from ${normalizedCrawlUrl}. You can now search!`
      );
    } catch (err) {
      setStatus("Error starting crawl. Is the backend running?");
      console.error(err);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleScrape = async (url: string) => {
    setViewerContent({
      content: "",
      format: "metadata",
      title: `Scraped Data: ${url}`,
      type: "scrape",
      url: url,
    });
    setIsModalLoading(true);

    try {
      const resp = await fetch("http://localhost:8001/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();

      setViewerContent((prev) =>
        prev
          ? {
              ...prev,
              metadata: data.metadata,
              content: data.markdown || "",
              format: "metadata",
            }
          : null
      );
    } catch (err) {
      console.error(err);
      alert("Failed to scrape page data.");
      setViewerContent(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const fetchViewContent = async (format: "json" | "md") => {
    const mode = getSearchMode();
    let url = "";
    if (mode === "live") {
      url = `http://localhost:8001/search/live/download?q=${encodeURIComponent(
        query
      )}&format=${format}`;
    } else if (mode === "site") {
      let normalizedSite = targetSite;
      if (targetSite && !targetSite.startsWith("http"))
        normalizedSite = "https://" + targetSite;
      url = `http://localhost:8001/search/site/download?q=${encodeURIComponent(
        query
      )}&format=${format}${
        normalizedSite ? `&url=${encodeURIComponent(normalizedSite)}` : ""
      }&max_pages=${maxPages}`;
    } else {
      url = `http://localhost:8001/search/download?q=${encodeURIComponent(
        query
      )}&format=${format}`;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch file");
    return await resp.text();
  };

  const handleFormatSwitch = async (newFormat: ViewFormat) => {
    if (!viewerContent) return;

    const prevContent = viewerContent;
    setViewerContent({ ...prevContent, format: newFormat });

    if (prevContent.type === "scrape" && newFormat === "metadata") {
      if (prevContent.metadata) {
        return;
      }
    }

    setIsModalLoading(true);

    try {
      let text = "";
      if (prevContent.type === "search") {
        if (newFormat === "metadata") return;
        text = await fetchViewContent(newFormat as "json" | "md");
      } else if (prevContent.type === "scrape" && prevContent.url) {
        if (newFormat === "metadata") return;

        const resp = await fetch(
          `http://localhost:8001/scrape/download?format=${newFormat}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: prevContent.url }),
          }
        );
        if (!resp.ok) throw new Error("Failed");
        text = await resp.text();
      }

      setViewerContent((prev) => (prev ? { ...prev, content: text } : null));
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    if (!targetSite) {
      setStatus("Please crawl a site first before chatting.");
      return;
    }

    // Add user message
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsSearching(true);

    try {
      const response = await fetch("http://localhost:8001/chat/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          site: targetSite,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error("Failed to get chat response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                // Update the assistant message in real-time
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content = assistantMessage;
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                    });
                  }
                  return newMessages;
                });
              } else if (data.done) {
                break;
              } else if (data.error) {
                throw new Error(data.error);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Error getting chat response. Is Ollama running?");
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSearching(false);
    }
  };

  const layoutProps: LayoutProps = {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    setIsSearching,
    isCrawling,
    setIsCrawling,
    status,
    setStatus,
    targetSite,
    setTargetSite,
    maxPages,
    setMaxPages,
    aiAnswer,
    setAiAnswer,
    messages,
    handleSearch,
    handleScrape,
    handleCrawl,
    handleChatMessage,
  };

  return (
    <>
      <FileViewerModal
        content={viewerContent}
        onClose={() => setViewerContent(null)}
        isLoading={isModalLoading}
        onFormatChange={handleFormatSwitch}
      />

      <Routes>
        <Route path="/" element={<Layout {...layoutProps} />}>
          <Route index element={<Navigate to="/live" replace />} />
          <Route path="live" element={<SearchResultsView />} />
          <Route path="local" element={<SearchResultsView />} />
          <Route path="site" element={<SiteSearchView />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
