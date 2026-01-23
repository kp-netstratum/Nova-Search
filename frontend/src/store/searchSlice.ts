import config from "../config";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { type SearchResult } from "../components/SearchResultItem";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CrawlHistoryItem {
  url: string;
  timestamp: string;
  pagesStored: number;
}

interface SearchState {
  mode: any;
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isCrawling: boolean;
  status: string;
  targetSite: string;
  maxPages: number;
  aiAnswer: string | null;
  messages: Message[];
  cache: Record<string, SearchResult[]>; // Simple cache: 'mode:query' -> results
  crawlHistory: CrawlHistoryItem[];
}

const initialState: SearchState = {
  mode: null,
  query: "",
  results: [],
  isSearching: false,
  isCrawling: false,
  status: "",
  targetSite: "",
  maxPages: 15,
  aiAnswer: null,
  messages: [],
  cache: {},
  crawlHistory: [],
};

// --- Thunks ---

export const performSearch = createAsyncThunk(
  "search/performSearch",
  async (
    args: {
      query: string;
      mode: "live" | "local" | "site";
      targetSite?: string;
      maxPages?: number;
    },
    { getState, rejectWithValue },
  ) => {
    const { query, mode, targetSite } = args; // maxPages unused in logic below, removed from destructure if not needed or used in URL
    const state = getState() as { search: SearchState };

    // Check cache
    const cacheKey = `${mode}:${query}:${targetSite || ""}`;
    if (state.search.cache[cacheKey]) {
      return {
        results: state.search.cache[cacheKey],
        fromCache: true,
        metadata: null,
        ai_answer: null,
        mode,
        normalizedSite: targetSite,
        query,
      };
    }

    // If site mode, we might handle it differently regarding results if we want to support the metadata return
    // But for now, let's just make the fetch

    let url = `${config.API_BASE_URL}/search`;
    let normalizedSite = targetSite;
    if (mode === "site" && targetSite && !targetSite.startsWith("http")) {
      normalizedSite = "https://" + targetSite;
    }

    if (mode === "live") {
      url = `${config.API_BASE_URL}/search/live?q=${encodeURIComponent(query)}`;
    } else {
      url = `${config.API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
    }

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      return { results: data, mode, normalizedSite, query, fromCache: false };
    } catch (err) {
      return rejectWithValue("Error fetching results. Is the backend running?");
    }
  },
);

export const performCrawl = createAsyncThunk(
  "search/performCrawl",
  async (args: { url: string; maxPages: number }, { rejectWithValue }) => {
    const { url, maxPages } = args;
    let normalizedCrawlUrl = url;
    if (!url.startsWith("http")) {
      normalizedCrawlUrl = "https://" + url;
    }

    try {
      const resp = await fetch(`${config.API_BASE_URL}/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedCrawlUrl, max_pages: maxPages }),
      });
      const data = await resp.json();
      return { data, normalizedCrawlUrl };
    } catch (err) {
      return rejectWithValue("Error starting crawl. Is the backend running?");
    }
  },
);

export const sendChatMessage = createAsyncThunk(
  "search/sendChatMessage",
  async (_args: { message: string; site: string; history: Message[] }, {}) => {
    // This is a streaming response in App.tsx. Thunks are not great for streaming unless we dispatch updates.
    // For now, let's just handle the initial request or we might need a custom middleware or just keep streaming logic in component for now?
    // The user asked to use Redux to make working more efficient. Streaming in Redux is possible but verbose.
    // Let's keep the streaming logic in the component for now, OR valid approach:
    // Dispatch "startChat", then component subscribes?
    // Or pass a callback?
    // Let's keep chat in component or move to a custom hook that uses Redux for storage but local stream handling.
    // Better: We can store the messages in Redux.

    // Since the user specifically asked for "minimize api calls", Redux helps with caching search results.
    // Chat streaming is efficient by nature (connection kept open).
    // We will just store the messages in Redux.
    return null; // Placeholder as we might not move the full streaming logic into a Standard Thunk easily.
  },
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setResults(state, action: PayloadAction<SearchResult[]>) {
      state.results = action.payload;
    },
    setTargetSite(state, action: PayloadAction<string>) {
      state.targetSite = action.payload;
    },
    setMaxPages(state, action: PayloadAction<number>) {
      state.maxPages = action.payload;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setAiAnswer(state, action: PayloadAction<string | null>) {
      state.aiAnswer = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    updateLastAssistantMessage(state, action: PayloadAction<string>) {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        lastMsg.content = action.payload;
      } else {
        state.messages.push({ role: "assistant", content: action.payload });
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
    removeLastMessage(state) {
      state.messages.pop();
    },
    clearCurrentSite(state) {
      state.targetSite = "";
      state.messages = [];
      state.status = "";
      state.aiAnswer = null;
    },
    addToCrawlHistory(state, action: PayloadAction<CrawlHistoryItem>) {
      // Avoid duplicates - check if URL already exists
      const exists = state.crawlHistory.some(
        (item) => item.url === action.payload.url,
      );
      if (!exists) {
        state.crawlHistory.unshift(action.payload); // Add to beginning
        // Keep only last 10 crawls
        if (state.crawlHistory.length > 10) {
          state.crawlHistory = state.crawlHistory.slice(0, 10);
        }
      }
    },
    removeFromCrawlHistory(state, action: PayloadAction<string>) {
      state.crawlHistory = state.crawlHistory.filter(
        (item) => item.url !== action.payload,
      );
    },
    loadCrawlFromHistory(state, action: PayloadAction<string>) {
      const crawl = state.crawlHistory.find(
        (item) => item.url === action.payload,
      );
      if (crawl) {
        state.targetSite = crawl.url;
        state.messages = [];
        state.status = `Loaded ${crawl.url} from history (${crawl.pagesStored} pages indexed)`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(performSearch.pending, (state) => {
        state.isSearching = true;
        state.results = [];
        state.aiAnswer = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        const {
          results: rawResults,
          mode,
          normalizedSite,
          fromCache,
        } = action.payload;

        if (fromCache) {
          // Cache hit logic
          state.results = rawResults as SearchResult[];
          // We could update status to "Loaded from cache"
          state.status =
            (rawResults as SearchResult[]).length > 0
              ? "Loaded from cache."
              : "No results found (cached).";
          return;
        }

        // Normal logic
        // Check if site mode result structure
        // App.tsx logic: if (mode === "site" && data.metadata)

        // We need to properly interpret the result structure here.
        // In App.tsx:
        // if (mode === "site" && data.metadata) { ... } else { setResults(data) }

        const data = rawResults;
        if (mode === "site" && (data as any).metadata) {
          const results = (data as any).results || [];
          const metadata = (data as any).metadata;
          state.results = results;
          state.aiAnswer = (data as any).ai_answer || null;
          state.status =
            results.length > 0
              ? `✓ Found ${results.length} results from ${normalizedSite} | ${metadata.pages_stored} pages crawled and stored in local database`
              : `✓ Site crawled and stored (${metadata.pages_stored} pages) | No results found for "${state.query}"`;

          // Update cache
          const cacheKey = `${mode}:${state.query}:${state.targetSite || ""}`;
          state.cache[cacheKey] = results;
        } else {
          // Live or local search (or site without metadata)
          state.results = data as SearchResult[];
          state.status = (data as any).length > 0 ? "" : "No results found.";

          const cacheKey = `${mode}:${state.query}:${state.targetSite || ""}`;
          state.cache[cacheKey] = data as SearchResult[];
        }
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.status = action.payload as string;
      })

      // Crawl
      .addCase(performCrawl.pending, (state) => {
        state.isCrawling = true;
      })
      .addCase(performCrawl.fulfilled, (state, action) => {
        state.isCrawling = false;
        const { data, normalizedCrawlUrl } = action.payload;
        state.status = `✓ Successfully indexed ${data.pages_crawled} pages from ${normalizedCrawlUrl}. You can now search!`;

        // Add to crawl history
        const historyItem: CrawlHistoryItem = {
          url: normalizedCrawlUrl,
          timestamp: new Date().toISOString(),
          pagesStored: data.pages_crawled,
        };
        const exists = state.crawlHistory.some(
          (item) => item.url === historyItem.url,
        );
        if (!exists) {
          state.crawlHistory.unshift(historyItem);
          if (state.crawlHistory.length > 10) {
            state.crawlHistory = state.crawlHistory.slice(0, 10);
          }
        }
      })
      .addCase(performCrawl.rejected, (state, action) => {
        state.isCrawling = false;
        state.status = action.payload as string;
      });
  },
});

export const {
  setQuery,
  setResults,
  setTargetSite,
  setMaxPages,
  setStatus,
  setAiAnswer,
  addMessage,
  updateLastAssistantMessage,
  clearMessages,
  removeLastMessage,
  clearCurrentSite,
  addToCrawlHistory,
  removeFromCrawlHistory,
  loadCrawlFromHistory,
} = searchSlice.actions;

export default searchSlice.reducer;
