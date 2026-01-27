import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setResults, setStatus } from "../store/searchSlice";
import {
  Atom,
  BotMessageSquare,
  Radar,
  ScanSearch,
  LogOut,
} from "lucide-react";
import { getTokenFromLocalStorage, tryLogout } from "../auth/auth.v2";

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Decode JWT token to extract user information
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Extract user email from token on component mount
  useEffect(() => {
    const tokenInfo = getTokenFromLocalStorage();
    if (tokenInfo && tokenInfo.access_token) {
      const decodedToken = decodeJWT(tokenInfo.access_token);
      if (decodedToken) {
        // Keycloak typically stores email in 'email' field
        setUserEmail(
          decodedToken.email || decodedToken.preferred_username || "User",
        );
      }
    }
  }, []);

  const handleLogout = async () => {
    const success = await tryLogout();
    if (success) {
      navigate("/login");
    }
  };

  const navItems = [
    {
      path: "/live",
      label: "Live Search",
      icon: <ScanSearch />,
      desc: "Search the global internet",
    },
    {
      path: "/site",
      label: "Direct Site",
      icon: <Radar />,
      desc: "Crawl and index a specific site",
    },
    {
      path: "/chat",
      label: "Chat",
      icon: <BotMessageSquare />,
      desc: "Chat with crawled content",
    },
    {
      path: "/smartscraper",
      label: "Smart Scraper",
      icon: <Atom />,
      desc: "Smartly scrape content from a website",
    },
  ];

  const handleNavClick = () => {
    dispatch(setResults([]));
    dispatch(setStatus(""));
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white/5 backdrop-blur-2xl border-r border-glass-border flex flex-col p-6 z-50">
      <div className="mb-4">
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

      <div className="mt-auto pt-6 border-t border-glass-border">
        {/* User Profile Section */}
        {userEmail && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-sky-400 to-indigo-400 flex items-center justify-center text-white font-semibold shadow-lg">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary">Logged in as</p>
                <p
                  className="text-sm font-medium text-white truncate"
                  title={userEmail}
                >
                  {userEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 border border-red-500/20"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
