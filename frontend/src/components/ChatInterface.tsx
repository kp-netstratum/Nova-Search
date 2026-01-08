import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  targetSite: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  targetSite,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Chat Messages Container */}
      <div className="glass-card p-6 mb-4 min-h-[500px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">
              Ask questions about the crawled content from{" "}
              <span className="text-accent-color font-medium">
                {targetSite || "the site"}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-accent-color text-white ml-auto"
                      : "glass-card text-text-primary"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {message.role === "user" ? "👤" : "🤖"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card max-w-[80%] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-accent-color rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-accent-color rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-accent-color rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <input
            type="text"
            className="glass-input pl-6 pr-32"
            placeholder="Ask a question about the crawled content..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !targetSite}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !targetSite}
              className="glass-button py-2 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
        {!targetSite && (
          <p className="text-xs text-text-secondary mt-2 text-center">
            Please crawl a site first before chatting
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatInterface;
