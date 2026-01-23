import React from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setResults, setStatus } from "../store/searchSlice";
// import { setScrapeFormat } from "../store/uiSlice";
import ScrapeFormatSelector from "./ScrapeFormatSelector";
// import { type ViewFormat } from "./FileViewerModal";

const SearchControls: React.FC = () => {
  const dispatch = useAppDispatch();
  // const scrapeFormat = useAppSelector((state) => state.ui.scrapeFormat);

  const modes = [
    {
      path: "/live",
      label: "Live Search",
      desc: "Uses DuckDuckGo to browse the global internet.",
    },
    {
      path: "/site",
      label: "Direct Site",
      desc: "Crawls the entire website, stores data locally, then searches the stored index.",
    },
  ];

  // const formats: { value: ViewFormat; label: string }[] = [
  //   { value: "json", label: "JSON" },
  //   { value: "md", label: "Markdown" },
  //   { value: "metadata", label: "Metadata" },
  // ];

  return (
    <section className="flex flex-col items-center mb-6 gap-4">
      {/* Search Modes */}
      <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-glass-border">
        {modes.map((mode) => (
          <NavLink
            key={mode.path}
            to={mode.path}
            onClick={() => {
              dispatch(setResults([]));
              dispatch(setStatus(""));
            }}
            className={({ isActive }) =>
              `px-6 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-accent-color text-bg-color shadow-md transform scale-105"
                  : "bg-transparent text-white hover:bg-white/5"
              }`
            }
          >
            {mode.label}
          </NavLink>
        ))}
      </div>
      <ScrapeFormatSelector />
    </section>
  );
};

export default SearchControls;
