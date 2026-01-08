import React from "react";
import { NavLink } from "react-router-dom";

interface SearchControlsProps {
  setResults: (results: any[]) => void;
  setStatus: (status: string) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  setResults,
  setStatus,
}) => {
  const modes = [
    {
      path: "/live",
      label: "Live Search",
      desc: "Uses DuckDuckGo to browse the global internet.",
    },
    {
      path: "/local",
      label: "Local Index",
      desc: "Searches through your previously indexed websites.",
    },
    {
      path: "/site",
      label: "Direct Site",
      desc: "Crawls the entire website, stores data locally, then searches the stored index.",
    },
  ];

  return (
    <>
      <section className="flex justify-center mb-4">
        <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-glass-border">
          {modes.map((mode) => (
            <NavLink
              key={mode.path}
              to={mode.path}
              onClick={() => {
                setResults([]);
                setStatus("");
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
      </section>

      {/* Description can optionally be moved to the View or kept here if we have active route access. 
          For simplicity, we can let the view handle specific descriptions or use useLocation here. 
          But keeping it stateless here is cleaner if we just drop this description or move it.
          The user wanted tabs. I'll keep the description here using NavLink matching or just let the View show it?
          Let's keep it simple and removed the description text block to clean up the UI, 
          OR we can use a helper to show the active description. 
      */}
    </>
  );
};

export default SearchControls;
