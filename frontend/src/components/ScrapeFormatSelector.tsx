import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setScrapeFormat } from "../store/uiSlice";
import { type ViewFormat } from "./FileViewerModal";

const ScrapeFormatSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const scrapeFormat = useAppSelector((state) => state.ui.scrapeFormat);

  const formats: { value: ViewFormat; label: string }[] = [
    { value: "json", label: "JSON" },
    { value: "md", label: "Markdown" },
    { value: "metadata", label: "Metadata" },
  ];

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary glass-panel px-4 py-2 rounded-full border border-glass-border">
      <span>Scrape Format:</span>
      <select
        value={scrapeFormat}
        onChange={(e) =>
          dispatch(setScrapeFormat(e.target.value as ViewFormat))
        }
        className="bg-transparent text-accent-color font-semibold focus:outline-none cursor-pointer"
      >
        {formats.map((f) => (
          <option
            key={f.value}
            value={f.value}
            className="bg-bg-color text-text-primary"
          >
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ScrapeFormatSelector;
