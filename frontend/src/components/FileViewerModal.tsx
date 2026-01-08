import React from "react";
import MarkdownViewer from "./MarkdownViewer";

export type ViewFormat = "json" | "md" | "metadata";

interface ViewerContent {
  content: string;
  format: ViewFormat;
  title: string;
  metadata?: any;
  type: "search" | "scrape"; // To know which tabs to show
}

interface FileViewerModalProps {
  content: ViewerContent | null;
  onClose: () => void;
  isLoading: boolean;
  onFormatChange: (format: ViewFormat) => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  content,
  onClose,
  isLoading,
  onFormatChange,
}) => {
  React.useEffect(() => {
    if (content) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [content]);

  if (!content) return null;

  const tabs: { id: ViewFormat; label: string }[] = [];

  if (content.type === "scrape") {
    tabs.push({ id: "metadata", label: "Metadata" });
  }
  tabs.push({ id: "json", label: "JSON" });
  tabs.push({ id: "md", label: "Markdown" });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-secondary py-24">
          <div className="loader w-12 h-12 mb-4" />
          <p>Loading content...</p>
        </div>
      );
    }

    let textToShow = content.content;
    if (content.format === "metadata" && content.metadata) {
      textToShow = JSON.stringify(content.metadata, null, 2);
    } else if (content.format === "json" || content.format === "metadata") {
      // Ensure it's pretty printed if it looks like JSON
      try {
        if (
          typeof textToShow === "string" &&
          (textToShow.startsWith("{") || textToShow.startsWith("["))
        ) {
          const obj = JSON.parse(textToShow);
          textToShow = JSON.stringify(obj, null, 2);
        }
      } catch (e) {}
      textToShow = "```json\n" + textToShow + "\n```";
    }

    return (
      <MarkdownViewer
        content={textToShow}
        style={{
          padding: "2rem",
          height: "100%",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
        // Note: MarkdownViewer likely needs refactoring or uses internal styles.
        // Based on previous reads, it takes a style prop but we might want to check it later.
        // For now, passing className might be better if it supports it, but preserving style ensures safety.
        // Actually, let's try to mix Tailwind classes if possible, but the wrapper is what matters most here.
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1001] flex justify-center items-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="glass-container w-full max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl shadow-sky-400/20 border-accent-color border-2 relative">
        <div className="flex justify-between items-center px-8 py-4 border-b border-glass-border bg-sky-500/5">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
              {content.title}
            </h2>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFormatChange(tab.id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  content.format === tab.id
                    ? "bg-accent-color text-bg-color shadow-sm"
                    : "bg-transparent text-text-secondary hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="bg-transparent text-text-secondary hover:text-white text-2xl p-2 leading-none ml-4 border-none shadow-none translate-y-0"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-black/20 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
