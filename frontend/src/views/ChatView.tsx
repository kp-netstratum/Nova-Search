import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { clearCurrentSite } from "../store/searchSlice";
import ChatInterface from "../components/ChatInterface";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OutletContextType {
  targetSite: string;
  messages: Message[];
  handleChatMessage: (message: string) => void;
  isSearching: boolean; // Reusing isSearching for loading state during chat if needed, or we can add isChatting
}

const ChatView: React.FC = () => {
  const { targetSite, messages, handleChatMessage, isSearching } =
    useOutletContext<OutletContextType>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redirect if no target site is set (optional, but good UX)
  React.useEffect(() => {
    if (!targetSite) {
      // Maybe redirect back to site search if they landed here accidentally?
      // for now, we just let it be, or render a message.
    }
  }, [targetSite]);

  const handleBackClick = () => {
    dispatch(clearCurrentSite());
    navigate("/site");
  };

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="text-text-secondary hover:text-white flex items-center gap-2 transition-colors cursor-pointer mb-4"
        >
          <span>←</span> Back to Crawler
        </button>
        <h2 className="text-2xl font-bold bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Chat with {targetSite || "Site"}
        </h2>
      </div>

      <ChatInterface
        targetSite={targetSite}
        messages={messages}
        onSendMessage={handleChatMessage}
        isLoading={isSearching}
      />
    </div>
  );
};

export default ChatView;
