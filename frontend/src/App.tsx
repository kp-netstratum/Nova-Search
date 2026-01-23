import config from "./config";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// ... (skipping unchanged lines is not possible in this tool for non-contiguous, but I will make 2 calls or 1 multireplace if widespread)
import "./index.css";
import { type SearchResult } from "./components/SearchResultItem";
import FileViewerModal from "./components/FileViewerModal";
import SearchResultsView from "./views/SearchResultsView";
import SiteSearchView from "./views/SiteSearchView";
import ChatView from "./views/ChatView";
import HomeView from "./views/HomeView";
import Sidebar from "./components/Sidebar";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  setQuery,
  setResults,
  setStatus,
  setTargetSite,
  setMaxPages,
  setAiAnswer,
  performSearch,
  performCrawl,
  addMessage,
  updateLastAssistantMessage,
  removeLastMessage,
  setCurrentSessionId,
} from "./store/searchSlice";
import {
  openModal,
  closeModal,
  switchViewFormat,
  performScrape,
} from "./store/uiSlice";
import { SmartScraper } from "./views/SmartScraper";

function Layout() {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search);
  const {
    query,
    results,
    isSearching,
    isCrawling,
    status,
    targetSite,
    maxPages,
    aiAnswer,
    messages,
  } = searchState;

  // Handlers wrapper
  const handleSearchWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return;

    const mode = getSearchMode(); // Need location
    // performSearch thunk handles the logic
    dispatch(performSearch({ query, mode, targetSite, maxPages }));
  };

  const handleCrawlWrapper = () => {
    if (!targetSite) {
      dispatch(setStatus("Please enter a URL to crawl."));
      return;
    }
    dispatch(performCrawl({ url: targetSite, maxPages }));
  };

  const handleScrapeWrapper = (url: string) => {
    dispatch(setQuery(""));

    dispatch(
      openModal({
        content: "",
        format: "metadata",
        title: `Scraped Data: ${url}`,
        type: "scrape",
        url: url,
      }),
    );
    // Then dispatch the thunk
    // @ts-ignore - thunk dispatch type issue sometimes necessitates generic cast or proper store setup
    dispatch(performScrape(url) as any);
  };

  const handleChatMessageWrapper = (message: string) => {
    if (!targetSite) {
      dispatch(setStatus("Please crawl a site first before chatting."));
      return;
    }
    // Call the chat handler which will dispatch messages internally
    handleChatMessageValues(message);
  };

  const location = useLocation();
  const getSearchMode = () => {
    if (location.pathname.includes("local")) return "local";
    if (location.pathname.includes("site")) return "site";
    return "live";
  };

  const isChatPage = location.pathname.includes("/chat");

  // Chat Streaming Logic (keeping it here for now but updating Redux state)
  const handleChatMessageValues = async (message: string) => {
    const userMessage = { role: "user" as const, content: message };
    dispatch(addMessage(userMessage));

    try {
      const chatUrl = new URL(`${config.API_BASE_URL}/chat/site`);
      if (searchState.currentSessionId) {
        chatUrl.searchParams.append("session_id", searchState.currentSessionId);
      }

      const response = await fetch(chatUrl.toString(), {
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
              try {
                const data = JSON.parse(line.slice(6));

                if (
                  data.sessionId &&
                  data.sessionId !== searchState.currentSessionId
                ) {
                  dispatch(setCurrentSessionId(data.sessionId));
                }

                if (data.content) {
                  assistantMessage += data.content;
                  dispatch(updateLastAssistantMessage(assistantMessage));
                } else if (data.done) {
                  break;
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error("JSON parse error in stream:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      dispatch(setStatus("Error getting chat response. Is Ollama running?"));
      dispatch(removeLastMessage());
    } finally {
      // Ensure reader is closed
    }
  };

  const contextValue = {
    query,
    setQuery: (q: string) => dispatch(setQuery(q)),
    results,
    setResults: (r: SearchResult[]) => dispatch(setResults(r)),
    isSearching,
    setIsSearching: () => {}, // No-op or throw, handled by thunks usually.
    isCrawling,
    setIsCrawling: () => {},
    status,
    setStatus: (s: string) => dispatch(setStatus(s)),
    targetSite,
    setTargetSite: (s: string) => dispatch(setTargetSite(s)),
    maxPages,
    setMaxPages: (n: number) => dispatch(setMaxPages(n)),
    aiAnswer,
    setAiAnswer: (s: string | null) => dispatch(setAiAnswer(s)),
    messages,
    handleSearch: handleSearchWrapper,
    handleScrape: handleScrapeWrapper,
    handleCrawl: handleCrawlWrapper,
    handleChatMessage: handleChatMessageWrapper,
    setCurrentSessionId: (id: string | null) =>
      dispatch(setCurrentSessionId(id)),
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-bg-color text-text-primary font-main">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <Outlet context={contextValue} />
        </div>

        {!isChatPage && (
          <footer className="px-8 py-4 text-center text-text-secondary text-[10px] border-t border-glass-border bg-white/2 backdrop-blur-sm">
            <span>
              &copy; {new Date().getFullYear()} Nova Search Agent. Build
              220126.1.0.0
            </span>
          </footer>
        )}
      </main>
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector((state) => state.ui);
  const { viewerContent, isModalLoading } = uiState;

  const handleFormatChange = (newFormat: any) => {
    if (viewerContent) {
      // @ts-ignore
      dispatch(switchViewFormat({ newFormat, currentContent: viewerContent }));
    }
  };

  return (
    <>
      <FileViewerModal
        content={viewerContent}
        onClose={() => dispatch(closeModal())}
        isLoading={isModalLoading}
        onFormatChange={handleFormatChange}
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/live" replace />} />
          <Route path="live" element={<HomeView />} />
          <Route path="results" element={<SearchResultsView />} />
          <Route path="site" element={<SiteSearchView />} />
          <Route path="chat" element={<ChatView />} />
        </Route>
        <Route path="smartscraper" element={<SmartScraper />} />
      </Routes>
    </>
  );
}

export default App;
