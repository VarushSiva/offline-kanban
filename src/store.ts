import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./features/board/boardSlice";
import uiReducer from "./features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
