import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  announcement: { text: string; nonce: number };
  searchQuery: string;
};

const initialState: UiState = {
  announcement: { text: "", nonce: 0 },
  searchQuery: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    announce: (state, action: PayloadAction<string>) => {
      state.announcement = { text: action.payload, nonce: Date.now() };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { announce, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
