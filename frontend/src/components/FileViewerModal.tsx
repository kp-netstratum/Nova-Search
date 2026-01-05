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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--text-secondary)",
          }}
        >
          <div
            className="loader"
            style={{
              width: "3rem",
              height: "3rem",
              borderWidth: "4px",
              marginBottom: "1rem",
            }}
          />
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
      />
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 1001,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="glass-container fade-in"
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "95vh",
          overflow: "hidden",
          padding: 0,
          border: "2px solid var(--accent-color)",
          boxShadow: "0 20px 60px rgba(56, 189, 248, 0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            borderBottom: "1px solid var(--glass-border)",
            background: "rgba(56, 189, 248, 0.05)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, marginRight: "1rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {content.title}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.05)",
              padding: "0.25rem",
              borderRadius: "8px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFormatChange(tab.id)}
                style={{
                  padding: "0.4rem 1rem",
                  fontSize: "0.85rem",
                  background:
                    content.format === tab.id
                      ? "var(--accent-color)"
                      : "transparent",
                  color:
                    content.format === tab.id
                      ? "#000"
                      : "var(--text-secondary)",
                  borderRadius: "6px",
                  fontWeight: "600",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
              lineHeight: 1,
              marginLeft: "1rem",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
