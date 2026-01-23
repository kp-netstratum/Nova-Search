import React from "react";
import type { CrawlHistoryItem } from "../store/searchSlice";

interface CrawlHistoryCardProps {
  item: CrawlHistoryItem;
  onLoad: (url: string) => void;
  onDelete: (url: string) => void;
}

const CrawlHistoryCard: React.FC<CrawlHistoryCardProps> = ({
  item,
  onLoad,
  onDelete,
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card p-6 hover:border-accent-color/50 transition-all cursor-pointer group bg-slate-700 rounded-lg">
      <div onClick={() => onLoad(item.url)}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium text-sm truncate flex-1 group-hover:text-accent-color transition-colors">
            {item.url}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.url);
            }}
            className="ml-2 text-text-secondary hover:text-red-400 transition-colors text-xs"
            aria-label="Delete"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            📄 {item.pagesStored} pages
          </span>
          <span>•</span>
          <span>{formatDate(item.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default CrawlHistoryCard;
