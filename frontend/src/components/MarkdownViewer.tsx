import type { ReactNode } from "react";
import React from "react";

const MarkdownViewer = ({
  content,
  style,
  className,
}: {
  content: string;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const parseMarkdown = (text: string): ReactNode[] => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre
              key={`code-${idx}`}
              style={{
                background: "rgba(0,0,0,0.5)",
                padding: "1rem",
                borderRadius: "8px",
                overflowX: "auto",
                margin: "1rem 0",
                border: "1px solid rgba(56, 189, 248, 0.2)",
              }}
            >
              <code
                style={{
                  color: "#10b981",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.85rem",
                  whiteSpace: "pre",
                }}
              >
                {codeBlockContent.join("\n")}
              </code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const headerStyle = {
          fontSize:
            level === 1
              ? "2rem"
              : level === 2
              ? "1.5rem"
              : level === 3
              ? "1.25rem"
              : "1.1rem",
          fontWeight: "700" as const,
          color: "var(--accent-color)",
          marginTop: level === 1 ? "0" : "2rem",
          marginBottom: "1rem",
          lineHeight: "1.3",
          borderBottom:
            level <= 2 ? "2px solid rgba(56, 189, 248, 0.2)" : "none",
          paddingBottom: level <= 2 ? "0.5rem" : "0",
        };

        const headerContent = parseInlineMarkdown(text);

        if (level === 1) {
          elements.push(
            <h1 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h3>
          );
        } else if (level === 4) {
          elements.push(
            <h4 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h4>
          );
        } else if (level === 5) {
          elements.push(
            <h5 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h5>
          );
        } else {
          elements.push(
            <h6 key={`h-${idx}`} style={headerStyle}>
              {headerContent}
            </h6>
          );
        }
        return;
      }

      // Horizontal rules
      if (line.trim().match(/^[-*_]{3,}$/)) {
        elements.push(
          <hr
            key={`hr-${idx}`}
            style={{
              border: "none",
              borderTop: "1px solid var(--glass-border)",
              margin: "2rem 0",
            }}
          />
        );
        return;
      }

      // List items
      if (line.trim().match(/^[-*+]\s/)) {
        const text = line.trim().substring(2);
        elements.push(
          <li
            key={`li-${idx}`}
            style={{
              marginLeft: "1.5rem",
              marginBottom: "0.5rem",
              lineHeight: "1.6",
              color: "var(--text-primary)",
            }}
          >
            {parseInlineMarkdown(text)}
          </li>
        );
        return;
      }

      // Numbered lists
      const numberedListMatch = line.trim().match(/^\d+\.\s(.+)$/);
      if (numberedListMatch) {
        const text = numberedListMatch[1];
        elements.push(
          <li
            key={`oli-${idx}`}
            style={{
              marginLeft: "1.5rem",
              marginBottom: "0.5rem",
              lineHeight: "1.6",
              color: "var(--text-primary)",
              listStyleType: "decimal",
            }}
          >
            {parseInlineMarkdown(text)}
          </li>
        );
        return;
      }

      // Blockquotes
      if (line.trim().startsWith(">")) {
        const text = line.trim().substring(1).trim();
        elements.push(
          <blockquote
            key={`quote-${idx}`}
            style={{
              borderLeft: "4px solid var(--accent-color)",
              paddingLeft: "1rem",
              margin: "1rem 0",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              background: "rgba(56, 189, 248, 0.05)",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
            }}
          >
            {parseInlineMarkdown(text)}
          </blockquote>
        );
        return;
      }

      // Regular paragraphs
      if (line.trim()) {
        elements.push(
          <p
            key={`p-${idx}`}
            style={{
              marginBottom: "1rem",
              lineHeight: "1.7",
              color: "var(--text-primary)",
            }}
          >
            {parseInlineMarkdown(line)}
          </p>
        );
      } else {
        // Empty line for spacing
        elements.push(<br key={`br-${idx}`} />);
      }
    });

    return elements;
  };

  const parseInlineMarkdown = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    let currentIndex = 0;
    let keyCounter = 0;

    const boldPattern = /\*\*(.+?)\*\*/g;
    const italicPattern = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const codePattern = /`([^`]+)`/g;

    const allMatches: Array<{
      start: number;
      end: number;
      type: string;
      content: string;
      url?: string;
      alt?: string;
    }> = [];

    let match;
    while ((match = boldPattern.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "bold",
        content: match[1],
      });
    }
    while ((match = italicPattern.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "italic",
        content: match[1],
      });
    }
    while ((match = linkPattern.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "link",
        content: match[1],
        url: match[2],
      });
    }
    while ((match = imagePattern.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "image",
        content: match[2],
        alt: match[1],
      });
    }
    while ((match = codePattern.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "code",
        content: match[1],
      });
    }

    allMatches.sort((a, b) => a.start - b.start);

    allMatches.forEach((match) => {
      if (match.start > currentIndex) {
        const beforeText = text.substring(currentIndex, match.start);
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      switch (match.type) {
        case "bold":
          parts.push(
            <strong
              key={`bold-${keyCounter++}`}
              style={{ color: "var(--accent-color)", fontWeight: "700" }}
            >
              {match.content}
            </strong>
          );
          break;
        case "italic":
          parts.push(
            <em
              key={`italic-${keyCounter++}`}
              style={{ fontStyle: "italic", color: "var(--text-secondary)" }}
            >
              {match.content}
            </em>
          );
          break;
        case "link":
          parts.push(
            <a
              key={`link-${keyCounter++}`}
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent-color)",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              {match.content}
            </a>
          );
          break;
        case "image":
          parts.push(
            <img
              key={`img-${keyCounter++}`}
              src={match.content}
              alt={match.alt || "Image"}
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                margin: "1rem 0",
                border: "1px solid var(--glass-border)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          );
          break;
        case "code":
          parts.push(
            <code
              key={`code-${keyCounter++}`}
              style={{
                background: "rgba(0,0,0,0.4)",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontFamily: "'Courier New', monospace",
                fontSize: "0.9em",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              {match.content}
            </code>
          );
          break;
      }

      currentIndex = match.end;
    });

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div
      className={className || "markdown-viewer"}
      style={
        style || {
          background: "rgba(0,0,0,0.2)",
          padding: "2rem",
          borderRadius: "12px",
          color: "var(--text-primary)",
          fontSize: "1rem",
          lineHeight: "1.7",
          overflowX: "auto",
          maxHeight: "70vh",
          overflowY: "auto",
        }
      }
    >
      {parseMarkdown(content).map((el, idx) => (
        <div key={idx}>{el}</div>
      ))}
    </div>
  );
};

export default MarkdownViewer;
