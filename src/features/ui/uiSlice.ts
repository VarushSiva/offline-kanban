import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  announcement: { text: string; nonce: number };
};

const initialState: UiState = {
  announcement: { text: "", nonce: 0 },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    announce: (state, action: PayloadAction<string>) => {
      state.announcement = { text: action.payload, nonce: Date.now() };
    },
  },
});

export const { announce } = uiSlice.actions;
export default uiSlice.reducer;
