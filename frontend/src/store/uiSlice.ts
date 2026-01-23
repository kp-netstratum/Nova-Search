import config from "../config";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { type ViewFormat } from "../components/FileViewerModal";

interface ViewerContent {
  content: string;
  format: ViewFormat;
  title: string;
  type: "search" | "scrape";
  metadata?: any;
  url?: string;
  retrievedData?: {
    json: any;
    markdown: string;
    metadata: any;
  };
}

interface UiState {
  viewerContent: ViewerContent | null;
  isModalLoading: boolean;
  scrapeFormat: ViewFormat; // New state for user preference
}

const initialState: UiState = {
  viewerContent: null,
  isModalLoading: false,
  scrapeFormat: "json", // Default
};

export const performScrape = createAsyncThunk(
  "ui/performScrape",
  async (url: string, { rejectWithValue, getState }) => {
    try {
      // Access the selected format from state
      // @ts-ignore - Assuming root state shape, or we fix the type
      const format = (getState() as any).ui.scrapeFormat;

      // We call the download endpoint which already supports format!
      // Or we update the /scrape endpoint to accept format.
      // Let's use the /scrape endpoint but pass the format.
      // Backend needs update to accept format in body or query.

      const resp = await fetch(
        `${config.API_BASE_URL}/scrape?format=${format}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }), // body still needs url
        },
      );

      // The backend should now return JUST the content for that format (or wrapped)
      // If we want to support "one api for all" but filtered, backend changes.
      // User said "remove the json... in json". So backend should return specific data.

      const data = await resp.json();
      return { data, url, format };
    } catch (err) {
      return rejectWithValue("Failed to scrape page data.");
    }
  },
);

// We also need format switching logic which behaves like a thunk because it fetches data.
export const switchViewFormat = createAsyncThunk(
  "ui/switchViewFormat",
  async (
    args: { newFormat: ViewFormat; currentContent: ViewerContent },
    { rejectWithValue },
  ) => {
    const { newFormat, currentContent } = args;

    // Logic reflected from App.tsx handleFormatSwitch
    if (newFormat === "metadata") {
      // Metadata usually already available or doesn't need fetch if we have retrievedData
      return { content: null, format: newFormat, noFetch: true };
    }

    try {
      if (currentContent.type === "scrape" && currentContent.retrievedData) {
        // Use cached data!
        let text = "";
        if (newFormat === "json") {
          text = JSON.stringify(currentContent.retrievedData.json, null, 2);
        } else if (newFormat === "md") {
          text = currentContent.retrievedData.markdown;
        }
        return { content: text, format: newFormat };
      }

      // Fallback for search or missing data (though scrape should have it now)
      let text = "";
      if (currentContent.type === "search") {
        // Existing logic for search... fetching...
        // For now, returning empty or erroring as before if not handled
        return { content: "", format: newFormat };
      } else if (currentContent.type === "scrape" && currentContent.url) {
        // Should not happen if performScrape populated retrievedData, but keeping fallback
        const resp = await fetch(
          `${config.API_BASE_URL}/scrape/download?format=${newFormat}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentContent.url }),
          },
        );
        if (!resp.ok) throw new Error("Failed");
        text = await resp.text();
        return { content: text, format: newFormat };
      }
      return { content: "", format: newFormat }; // Fallback
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ViewerContent>) {
      state.viewerContent = action.payload;
    },
    setScrapeFormat(state, action: PayloadAction<ViewFormat>) {
      state.scrapeFormat = action.payload;
    },
    closeModal(state) {
      state.viewerContent = null;
    },
    setModalLoading(state, action: PayloadAction<boolean>) {
      state.isModalLoading = action.payload;
    },
    updateViewerFormat(state, action: PayloadAction<ViewFormat>) {
      if (state.viewerContent) {
        state.viewerContent.format = action.payload;
      }
    },
    updateViewerContent(state, action: PayloadAction<string>) {
      if (state.viewerContent) {
        state.viewerContent.content = action.payload;
      }
    },
    updateViewerMetadata(state, action: PayloadAction<any>) {
      if (state.viewerContent) {
        state.viewerContent.metadata = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performScrape.pending, (state) => {
        state.isModalLoading = true;
      })
      .addCase(performScrape.fulfilled, (state, action) => {
        state.isModalLoading = false;
        const { data, format } = action.payload;

        // Data structure from backend will now be simpler based on format,
        // OR we just map the specific field if backend returns { content: ... }
        // Let's assume backend returns { content: ..., metadata: ... } or just the content.

        // To be safe and flexible, let's map the response.
        if (state.viewerContent) {
          // We only have ONE format now.
          state.viewerContent.format = format;

          if (format === "json") {
            state.viewerContent.content = JSON.stringify(data, null, 2);
          } else if (format === "md") {
            state.viewerContent.content = data.markdown || data.content || ""; // Backend dependent
          } else {
            state.viewerContent.content = JSON.stringify(
              data.metadata || data,
              null,
              2,
            );
          }

          // We might still want metadata available?
          state.viewerContent.metadata = data.metadata;

          // Clear retrievedData because we don't have the others anymore
          state.viewerContent.retrievedData = undefined;
        }
      })
      .addCase(performScrape.rejected, (state) => {
        state.isModalLoading = false;
        state.viewerContent = null;
      })
      .addCase(switchViewFormat.fulfilled, (state, action) => {
        const { content, format } = action.payload;
        if (state.viewerContent) {
          state.viewerContent.format = format;
          if (content !== null) {
            state.viewerContent.content = content;
          }
        }
      });
  },
});

export const {
  openModal,
  setScrapeFormat,
  closeModal,
  setModalLoading,
  updateViewerFormat,
  updateViewerContent,
  updateViewerMetadata,
} = uiSlice.actions;
export default uiSlice.reducer;
