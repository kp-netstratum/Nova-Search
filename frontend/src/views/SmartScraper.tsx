import config from "../config";
interface ScrapedResult {
  title: string;
  url: string;
  content: string;
}

interface SmartScraperData {
  status?: string;
  ai_answer?: string;
  results?: ScrapedResult[];
  type?: string;
  url?: string;
  screenshot?: string;
  index?: number;
  done?: boolean;
  error?: string;
}

interface FrameHistoryItem {
  screenshot: string;
  action: string;
  timestamp: string;
}

import { useState, useEffect, useRef } from "react";

export const SmartScraper = () => {
  const [searchString, setSearchString] = useState("");
  const [results, setResults] = useState<SmartScraperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState("");
  const [frameHistory, setFrameHistory] = useState<FrameHistoryItem[]>([]);
  const livePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (livePreviewRef.current) {
      livePreviewRef.current.scrollTop = livePreviewRef.current.scrollHeight;
    }
  }, [frameHistory]);

  const handleSearch = async () => {
    if (!searchString.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults(null);
    setStatusMessages([]);
    setCurrentFrame(null);
    setCurrentAction("");
    setFrameHistory([]);

    const ws = new WebSocket(`${config.WS_BASE_URL}/ws/smartsearch`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ url: searchString }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status) {
        setStatusMessages((prev) => [...prev, data.status]);
      } else if (data.type === "live_frame") {
        const timestamp = new Date().toLocaleTimeString();
        setCurrentFrame(data.screenshot);
        setCurrentAction(data.action);
        setFrameHistory((prev) => [
          ...prev,
          {
            screenshot: data.screenshot,
            action: data.action,
            timestamp: timestamp,
          },
        ]);
      } else if (data.done) {
        setResults(data);
        setLoading(false);
        ws.close();
      } else if (data.error) {
        console.error("WS Error:", data.error);
        setStatusMessages((prev) => [...prev, `Error: ${data.error}`]);
        setLoading(false);
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setLoading(false);
    };

    ws.onclose = () => {
      setLoading(false);
    };
  };

  const handleReset = () => {
    setHasSearched(false);
    setLoading(false);
    setResults(null);
    setSearchString("");
    setCurrentFrame(null);
    setCurrentAction("");
    setFrameHistory([]);
    setStatusMessages([]);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-start gap-4 w-full">
        <div className="flex flex-col gap-4 w-full h-[90vh] overflow-y-auto rounded-2xl">
          {/* Search Header */}
          <div className="flex flex-col bg-slate-800 w-full rounded-2xl border border-slate-600 p-6 gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-blue-50 flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Live Browser Scraper
              </h1>
              {hasSearched && (
                <button
                  onClick={handleReset}
                  className="bg-slate-700 hover:bg-red-500 text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reset
                </button>
              )}
            </div>

            <div className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="Enter search query (e.g., 'best restaurants in New York')"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    searchString.length > 0 &&
                    !loading
                  ) {
                    handleSearch();
                  }
                }}
                disabled={loading}
                className="border border-slate-600 rounded-lg p-3 flex-1 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              />
              <button
                onClick={searchString.length > 0 ? handleSearch : undefined}
                disabled={searchString.length === 0 || loading}
                className={`text-white rounded-lg px-8 py-3 transition-all font-semibold ${
                  searchString.length > 0 && !loading
                    ? "bg-blue-500 hover:bg-blue-600 cursor-pointer shadow-lg hover:shadow-blue-500/50"
                    : "bg-slate-600 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {/* Status Messages */}
            {statusMessages.length > 0 && (
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto bg-slate-700 rounded-lg p-3">
                {statusMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-blue-200 text-sm"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Results Section */}
          {results && (
            <div className="flex flex-col w-full bg-slate-800 rounded-2xl border border-slate-600 p-6 gap-4 shadow-xl">
              <h2 className="text-2xl font-bold text-blue-50 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Scraping Complete
              </h2>

              {results.ai_answer && (
                <div className="bg-gradient-to-r from-slate-700 to-slate-750 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">
                    AI Analysis
                  </h3>
                  <div className="text-blue-50 whitespace-pre-wrap">
                    {results.ai_answer}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-blue-50 mb-3">
                  Scraped Data ({results.results?.length || 0} pages)
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {results.results?.map((result, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-300 font-semibold mb-2">
                            {result.title}
                          </h4>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm mb-2 block truncate"
                          >
                            {result.url}
                          </a>
                          <p className="text-slate-300 text-sm line-clamp-3">
                            {result.content?.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Live Preview Section */}
        {hasSearched && (
          <div className="w-full h-[90vh]">
            {/* Main Live View */}
            <div className="bg-slate-800 rounded-2xl border border-slate-600 overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Browser View
                </h2>
                {loading && (
                  <span className="text-blue-100 text-sm animate-pulse">
                    Recording...
                  </span>
                )}
              </div>

              <div className="relative bg-slate-900">
                {currentFrame ? (
                  <div className="relative">
                    <img
                      src={`data:image/png;base64,${currentFrame}`}
                      alt="Live browser preview"
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <p className="text-white text-sm font-medium">
                        {currentAction}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-slate-500">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-lg">Waiting for browser session...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
