AI Generation Prompt: Nova Search Agent (Smart Scraper)
Role: You are an expert Full-Stack Engineer specializing in Python (FastAPI), React, and Web Automation.

Goal: Build a sophisticated AI-powered web automation and search platform called "Nova Search Agent". The platform should allow users to perform live web searches, crawl specific sites, index data into a vector-capable database, and chat with an AI about the content.

1. Technical Stack
   Backend: FastAPI (Python 3.10+), Playwright (for automation/scraping), PostgreSQL (with FTS/Vector support), Ollama/LLM integration.
   Frontend: React (Vite, TypeScript), Redux Toolkit (State Management), Tailwind CSS (for modern UI), WebSockets (for live streaming).
   Design System: Premium "Glassmorphism" aesthetic with a deep slate/indigo color palette, smooth transitions, and a split-screen dashboard.
2. Core Backend Modules
   crawler.py
   : Implement a recursive crawler using Playwright and BeautifulSoup. Features: Link extraction with relevance scoring, depth control, and a robust HTML-to-Markdown engine.
   indexer.py
   : Create a PostgreSQL-based indexing system. Table schema should include
   id
   , parentUrl, childrenUrls, content (Markdown), and a searchVector for Full-Text Search. Use triggers to auto-update the vector.
   main.py
   :
   REST Endpoints: /search (local DB), /live_search (real-time scripts), /site_search (crawl then search), and /scrape (extract single URL).
   WebSocket (/ws/smartsearch): A high-performance bridge that streams a live browser session (screenshots + current action) and status updates to the client.
   SSE Endpoint (/chat/site): Stream AI responses from a local LLM (like Ollama) using context retrieved from the indexed database (RAG).
3. Core Frontend Subsystems
   Smart Scraper Dashboard:
   Left side: Search input and an auto-scrolling status message feed.
   Right side: A "Live Browser View" window that displays the real-time stream of the agent's actions (Playwright frame screenshots).
   Search Experience: Modular views for "Live Home", "Search Results" (with snippet highlighting), and "Site Specific" targeting.
   Interactive Chat: A specialized chat interface to interact with crawled data. Include markdown rendering for AI responses and a history sidebar.
   Global UI Components: A sophisticated "File Viewer" modal to toggle between JSON and Markdown views of any scraped document.
4. Key Implementation Requirements
   Hardware/OS Support: Ensure Playwright is configured to run robustly on Windows (support for ProactorEventLoopPolicy).
   Resiliency: Handle timeouts, cookie consent popups, and dynamic content variations during scraping.
   Performance: Use asynchronous processing throughout the backend; use Redux thunks for complex frontend API orchestrations.
   Instruction to AI: "Start by scaffolding the project structure. Focus on the Backend first (API and Crawling logic), then build the Design System tokens in the Frontend, and finally integrate the WebSockets and AI Chat components. The application must look and feel like a premium, enterprise-grade tool."
