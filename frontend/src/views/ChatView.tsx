import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearCurrentSite,
  fetchChatSessions,
  fetchCrawlHistory,
  fetchChatMessages,
  deleteCrawlHistory,
  resetCurrentSession,
} from "../store/searchSlice";
import ChatInterface from "../components/ChatInterface";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OutletContextType {
  targetSite: string;
  messages: Message[];
  handleChatMessage: (message: string) => void;
  isSearching: boolean;
  setCurrentSessionId: (id: string | null) => void;
  setTargetSite: (site: string) => void;
  setStatus: (msg: string) => void;
}

const ChatView: React.FC = () => {
  const {
    targetSite,
    messages,
    handleChatMessage,
    isSearching,
    setCurrentSessionId: setSessionIdContext,
    setTargetSite: setTargetSiteContext,
    setStatus: setStatusContext,
  } = useOutletContext<OutletContextType>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const chatSessions = useAppSelector((state) => state.search.chatSessions);
  const siteHistory = useAppSelector((state) => state.search.siteHistory);
  const currentSessionId = useAppSelector(
    (state) => state.search.currentSessionId,
  );

  // Fetch history on mount
  React.useEffect(() => {
    dispatch(fetchChatSessions());
    dispatch(fetchCrawlHistory());
  }, [dispatch]);

  const handleBackClick = () => {
    dispatch(clearCurrentSite());
    navigate("/site");
  };

  const handleLoadSession = (sessionId: string, site: string) => {
    dispatch(fetchChatMessages(sessionId));
    setTargetSiteContext(site);
    setStatusContext(`Loaded previous chat session for ${site}`);
  };

  const handleStartNewChatWithSite = (site: string) => {
    // Check if there's a recent session for this site to resume
    const latestSession = chatSessions.find((s: any) => s.targetSite === site);

    if (latestSession) {
      handleLoadSession(latestSession.id, site);
    } else {
      // No existing session, start fresh with site context
      dispatch(resetCurrentSession());
      setTargetSiteContext(site);
    }

    // Explicitly navigate if not already there
    if (window.location.pathname !== "/chat") {
      navigate("/chat");
    }
  };

  const handleCrawlDelete = (e: React.MouseEvent, site: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete all indexed data for ${site}? This action cannot be undone.`,
      )
    ) {
      dispatch(deleteCrawlHistory(site));
    }
  };

  const handleNewChat = () => {
    if (targetSite) {
      // Keep the site but clear the session/messages
      dispatch(resetCurrentSession());
      setSessionIdContext(null);
    } else {
      // Total reset
      dispatch(clearCurrentSite());
      setSessionIdContext(null);
    }
  };

  return (
    <div className="mx-auto fade-in flex h-full gap-6">
      {/* History Sidebar */}
      <div className="w-72 flex flex-col gap-4 overflow-y-auto pr-2 border-r border-glass-border">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Recent Chats
            </h3>
            <div className="space-y-2">
              {chatSessions.length === 0 ? (
                <p className="text-[10px] text-text-secondary italic">
                  No chat history yet.
                </p>
              ) : (
                chatSessions.map((session: any) => (
                  <button
                    key={session.id}
                    onClick={() =>
                      handleLoadSession(session.id, session.targetSite)
                    }
                    className={`w-full text-left p-3 rounded-xl transition-all text-xs border ${
                      currentSessionId === session.id
                        ? "bg-accent-color/10 border-accent-color/30 text-white shadow-sm shadow-accent-color/20"
                        : "bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold truncate">
                      {session.title}
                    </div>
                    <div className="text-[10px] opacity-60 mt-1">
                      {new Date(session.createdAt * 1000).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Crawled Sites
            </h3>
            <div className="space-y-2">
              {siteHistory.length === 0 ? (
                <p className="text-[10px] text-text-secondary italic">
                  No sites crawled yet.
                </p>
              ) : (
                siteHistory.map((site: any) => (
                  <div key={site.url} className="relative group">
                    <button
                      onClick={() => handleStartNewChatWithSite(site.url)}
                      className={`w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs border border-transparent ${
                        targetSite === site.url
                          ? "border-accent-color/30 text-white"
                          : "text-text-secondary shadow-sm"
                      }`}
                    >
                      <div className="font-semibold truncate pr-6">
                        {site.url}
                      </div>
                      <div className="text-[10px] opacity-60 mt-1">
                        Indexed on{" "}
                        {new Date(site.createdAt * 1000).toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleCrawlDelete(e, site.url)}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Delete site data"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {targetSite ? `Chat with ${targetSite}` : "AI Chat Assistant"}
            </h2>
            <p className="text-text-secondary text-xs mt-1">
              {targetSite
                ? "Ask questions about the crawled content."
                : "Select a session or site from the history to begin."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* <button
              onClick={handleNewChat}
              className="text-[10px] font-bold uppercase tracking-wider text-accent-color hover:text-sky-300 transition-colors"
            >
              New Chat
            </button> */}
            {targetSite && (
              <button
                onClick={handleBackClick}
                className="text-xs text-text-secondary hover:text-white border border-glass-border px-3 py-1 rounded-lg transition-colors"
              >
                Clear Site
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white/2 rounded-3xl border border-glass-border overflow-hidden shadow-2xl">
          <ChatInterface
            targetSite={targetSite}
            messages={messages}
            onSendMessage={handleChatMessage}
            isLoading={isSearching}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatView;
