import { useState } from "react";
import "./index.css";
import SearchResultItem, { SearchResult } from "./components/SearchResultItem";
import AIAnswerCard from "./components/AIAnswerCard";
import DirectSiteControls from "./components/DirectSiteControls";
import FileViewerModal, { ViewFormat } from "./components/FileViewerModal";
import SearchControls from "./components/SearchControls";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [status, setStatus] = useState("");
  const [searchMode, setSearchMode] = useState<"live" | "local" | "site">(
    "live"
  );
  const [targetSite, setTargetSite] = useState("");
  const [maxPages, setMaxPages] = useState(15);

  // Refactored Modal State
  const [viewerContent, setViewerContent] = useState<{
    content: string;
    format: ViewFormat;
    title: string;
    type: "search" | "scrape";
    metadata?: any;
    url?: string; // To allow re-fetching for format switch
  } | null>(null);

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return;

    if (searchMode === "site" && !targetSite) {
      setStatus("Please provide a Target Site URL (e.g., https://example.com)");
      return;
    }

    let normalizedSite = targetSite;
    if (searchMode === "site" && targetSite) {
      if (!targetSite.startsWith("http")) {
        normalizedSite = "https://" + targetSite;
      }
    }

    setIsSearching(true);
    setResults([]);

    if (searchMode === "site") {
      setStatus(
        `Step 1/3: Crawling ${normalizedSite} (up to ${maxPages} pages)...`
      );
    } else {
      setStatus(
        searchMode === "live"
          ? "Searching the internet..."
          : "Searching local index..."
      );
    }

    try {
      let url = `http://localhost:8001/search`;
      if (searchMode === "live") {
        url = `http://localhost:8001/search/live?q=${encodeURIComponent(
          query
        )}`;
      } else {
        url = `http://localhost:8001/search?q=${encodeURIComponent(query)}`;
      }

      const resp = await fetch(url);
      const data = await resp.json();

      if (searchMode === "site" && data.metadata) {
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

  const handleScrape = async (url: string) => {
    // Directly open the modal in 'metadata' mode with loading state
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

      // Update modal with fetched metadata
      setViewerContent((prev) =>
        prev
          ? {
              ...prev,
              metadata: data.metadata,
              content: data.markdown || "", // Pre-fill content if available
              format: "metadata", // Start on metadata tab
            }
          : null
      );
    } catch (err) {
      console.error(err);
      alert("Failed to scrape page data.");
      setViewerContent(null); // Close on error
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCrawl = async () => {
    const urlToCrawl = searchMode === "site" ? targetSite : crawlUrl;

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

  const downloadFile = async (format: "json" | "md") => {
    // KEEPING LEGACY DOWNLOAD FUNCTIONALITY FOR THE BUTTONS OUTSIDE MODAL IF NEEDED
    // BUT CURRENTLY WE ARE FOCUSING ON MODAL VIEWING
    // Reuse viewFile logic but trigger download?
    // For now, let's keep the download buttons as they were in "viewFile" logic in previous step?
    // Actually, the user asked for VIEW switching. Downloads are separate actions usually.
    // Let's implement download helper but usually download is direct.

    if (!query || query.length < 2) return;
    setIsDownloading(true);
    try {
      let url = "";
      // Construct URL same as before...
      if (searchMode === "live") {
        url = `http://localhost:8001/search/live/download?q=${encodeURIComponent(
          query
        )}&format=${format}`;
      } else if (searchMode === "site") {
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
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download =
        resp.headers.get("Content-Disposition")?.split("filename=")[1] ||
        `search_results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      setStatus(`Downloaded ${format.toUpperCase()} file successfully!`);
    } catch (e) {
      console.error(e);
      setStatus("Error downloading file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchViewContent = async (
    format: "json" | "md",
    type: "search" | "search-fetch"
  ) => {
    // Helper to fetch content for search results
    let url = "";
    if (searchMode === "live") {
      url = `http://localhost:8001/search/live/download?q=${encodeURIComponent(
        query
      )}&format=${format}`;
    } else if (searchMode === "site") {
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

  const handleOpenViewer = async (startFormat: "json" | "md") => {
    if (!query) return;

    setViewerContent({
      content: "",
      format: startFormat,
      title: `Search Results: ${query}`,
      type: "search",
    });
    setIsModalLoading(true);

    try {
      const text = await fetchViewContent(startFormat, "search-fetch");
      setViewerContent((prev) => (prev ? { ...prev, content: text } : null));
    } catch (e) {
      console.error(e);
      setViewerContent(null);
      setStatus("Error opening viewer.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleFormatSwitch = async (newFormat: ViewFormat) => {
    if (!viewerContent) return;

    // Update state to show loading immediately
    const prevContent = viewerContent;
    setViewerContent({ ...prevContent, format: newFormat });

    // If we are just switching to metadata (and we have it), no need to fetch
    if (prevContent.type === "scrape" && newFormat === "metadata") {
      return;
    }

    setIsModalLoading(true);

    try {
      let text = "";
      if (prevContent.type === "search") {
        if (newFormat === "metadata") return; // Should not happen for search
        text = await fetchViewContent(
          newFormat as "json" | "md",
          "search-fetch"
        );
      } else if (prevContent.type === "scrape" && prevContent.url) {
        // Fetch scraped content in specific format
        // NOTE: We used /scrape only for initial metadata+markdown.
        // If user wants JSON of the scrape, we need to call /scrape/download
        if (newFormat === "metadata") return; // Already have it

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
      // Don't close, just maybe show error in content?
      // For now, on error, we might be stuck on loading or old content.
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div
      className="glass-container fade-in"
      style={{ width: "100%", position: "relative" }}
    >
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "0.5rem",
            background: "linear-gradient(to right, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1px",
          }}
        >
          Nova Search
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>
          The futuristic web crawler & search engine
        </p>
      </header>

      <FileViewerModal
        content={viewerContent}
        onClose={() => setViewerContent(null)}
        isLoading={isModalLoading}
        onFormatChange={handleFormatSwitch}
      />

      <SearchControls
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        setResults={setResults}
        setStatus={setStatus}
      />

      <section>
        {searchMode === "site" && (
          <DirectSiteControls
            targetSite={targetSite}
            setTargetSite={setTargetSite}
            maxPages={maxPages}
            setMaxPages={setMaxPages}
            handleCrawl={handleCrawl}
            isCrawling={isCrawling}
          />
        )}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "1rem", position: "relative" }}
        >
          <input
            type="text"
            placeholder={
              searchMode === "live"
                ? "What are you looking for?"
                : searchMode === "site"
                ? "Type a sentence or keyword to find on site..."
                : "Search your local index..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingRight: "4rem" }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{ whiteSpace: "nowrap" }}
          >
            {isSearching ? "Thinking..." : "Search"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          {results.length > 0 && !isSearching && (
            <>
              <button
                onClick={() => handleOpenViewer("json")}
                disabled={isDownloading}
                style={{
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid var(--accent-color)",
                  color: "var(--accent-color)",
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: isDownloading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                📄 View JSON
              </button>
              <button
                onClick={() => handleOpenViewer("md")}
                disabled={isDownloading}
                style={{
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid var(--accent-color)",
                  color: "var(--accent-color)",
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: isDownloading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                📝 View MD
              </button>
              <button
                onClick={() => downloadFile("json")}
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid #10b981",
                  color: "#10b981",
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                ⬇️ Download JSON
              </button>
              <button
                onClick={() => downloadFile("md")}
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid #10b981",
                  color: "#10b981",
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                ⬇️ Download MD
              </button>
              <button
                onClick={() => {
                  setResults([]);
                  setStatus("");
                  setAiAnswer(null);
                }}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Clear Results
              </button>
            </>
          )}
        </div>

        {status && (
          <p
            style={{
              marginTop: "2rem",
              textAlign: "center",
              color: "var(--accent-color)",
              fontWeight: "600",
            }}
          >
            {status}
          </p>
        )}

        {aiAnswer && <AIAnswerCard aiAnswer={aiAnswer} />}

        <div className="search-results">
          {results.map((res, idx) => (
            <SearchResultItem
              key={idx}
              result={res}
              index={idx}
              onScrape={handleScrape}
            />
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: "4rem",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
        }}
      >
        <p>© 2024 Nova Search Inc. All systems operational.</p>
      </footer>
    </div>
  );
}

export default App;
