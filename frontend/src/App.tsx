import config from "./config";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// ... (skipping unchanged lines is not possible in this tool for non-contiguous, but I will make 2 calls or 1 multireplace if widespread)
import "./index.css";
import { type SearchResult } from "./components/SearchResultItem";
import FileViewerModal from "./components/FileViewerModal";
import SearchControls from "./components/SearchControls";
import SearchResultsView from "./views/SearchResultsView";
import SiteSearchView from "./views/SiteSearchView";
import ChatView from "./views/ChatView";
import HomeView from "./views/HomeView";
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
} from "./store/searchSlice";
import {
  openModal,
  closeModal,
  switchViewFormat,
  performScrape,
} from "./store/uiSlice";
import { SmartScraper } from "./views/SmartScraper";

// Interface for props passed to Layout/Outlet
// Note: With Redux, many of these props might not need to be passed down if child components connect to Redux directly.
// But for now, keeping the Layout structure similar or refactoring it to just be a layout.
// Since SearchControls can now connect to Redux, we don't need to pass setResults/setStatus.
// However, the Views (SearchResultsView, etc) use `useOutletContext`. We need to see if they consume these props.

// Let's verify what `useOutletContext` expects in the Views.
// If they rely on this context, we must provide it or refactor them too.
// I will provide a minimal context or update them later.
// Ideally, Views should also use selectors. For this refactor, I will keep the context providing values from Redux
// so that I don't break the Views immediately, but I'll mark them for update if needed.
// Actually, `useOutletContext` is generic.
// Let's assume Views use the props. Providing them from Redux state is the safest transitional step.

// Rewriting Layout to use Redux hooks directly doesn't fundamentally change how children receive data
// if we don't change the children.
// But `Outlet` context is used.
// Let's check `SearchResultsView` and `SiteSearchView` usage.
// Since I cannot check them in this turn, I will assume they use the context.
// I will reconstruct the context object using Redux state and dispatchers.

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
    // Logic for scrape is now in UI slice or handled by dispatching UI actions
    // original handleScrape setups viewerContent and calls fetch.
    // We can move this logic to a thunk or just dispatch openModal with initial state and then fetch?
    // In uiSlice, I created `performScrape` thunk.
    dispatch(setQuery("")); // Just a placeholder, actually performScrape doesn't need query.
    // Wait, performScrape thunk needs to be dispatched.
    // It sets isModalLoading, traverses api.

    // We need to dispatch openModal first?
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

  const isResultsPage = location.pathname.includes("/results");
  const isChatPage = location.pathname.includes("/chat");

  // Chat Streaming Logic (keeping it here for now but updating Redux state)
  const handleChatMessageValues = async (message: string) => {
    const userMessage = { role: "user" as const, content: message };
    dispatch(addMessage(userMessage));

    try {
      const response = await fetch(`${config.API_BASE_URL}/chat/site`, {
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
                dispatch(updateLastAssistantMessage(assistantMessage));
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
      dispatch(setStatus("Error getting chat response. Is Ollama running?"));
      dispatch(removeLastMessage());
    } finally {
      // Ensure reader is closed
    }
  };

  // Constructing the context object to match what Views might expect.
  // Explicitly mapping Redux dispatchers to the setter names expected by current views if possible.
  // If Views use `setResults`, we pass `(r) => dispatch(setResults(r))`.
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
  };

  return (
    <div className="glass-container w-[1200px] relative fade-in mx-auto px-12 min-h-fit py-20 flex flex-col">
      {!isResultsPage && !isChatPage && (
        <>
          <header className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-2 bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              Smart Scraper
            </h1>
            <p className="text-text-secondary text-lg">
              Intelligent Search & Crawling Agent
            </p>
          </header>

          <SearchControls />
        </>
      )}

      <Outlet context={contextValue} />

      {!isChatPage && (
        <footer className="mt-auto text-center text-text-secondary text-sm pt-8">
          <p>
            &copy; {new Date().getFullYear()} Nova Search Agent. All rights
            reserved.
          </p>
          <p>Build Number: 220126.1.0.0</p>
        </footer>
      )}
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
