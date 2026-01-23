import React from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setResults, setStatus } from "../store/searchSlice";
import { BotMessageSquare, Radar, ScanSearch } from "lucide-react";

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();

  const navItems = [
    {
      path: "/live",
      label: "Live Search",
      icon: <ScanSearch/>,
      desc: "Search the global internet",
    },
    {
      path: "/site",
      label: "Direct Site",
      icon: <Radar/>,
      desc: "Crawl and index a specific site",
    },
    {
      path: "/chat",
      label: "Chat",
      icon: <BotMessageSquare/>,
      desc: "Chat with crawled content",
    },
  ];

  const handleNavClick = () => {
    dispatch(setResults([]));
    dispatch(setStatus(""));
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white/5 backdrop-blur-2xl border-r border-glass-border flex flex-col p-6 z-50">
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <img src="/public/favicon.png" alt="logo" className="w-6 h-6" />
          <h1 className="text-2xl font-bold bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            BM Search
          </h1>
        </div>
        <p className="text-text-secondary text-xs mt-1">v22.0126.1</p>
      </div>
      <div className="border-b border-glass-border mb-4"></div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-accent-color text-bg-color shadow-lg shadow-accent-glow"
                  : "text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-semibold leading-none">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] mt-1 ${
                      isActive ? "text-bg-color/70" : "text-text-secondary"
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* <div className="mt-auto pt-6 border-t border-glass-border">
        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2">
          System Status
        </p>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agent Ready</span>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;
