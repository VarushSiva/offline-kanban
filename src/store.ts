import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { loadBoardPresentFromStorage } from "./features/persistence/storage";
import undoableBoardReducer from "./features/history/undoableBoardReducer";
import uiReducer from "./features/ui/uiSlice";

const rootReducer = combineReducers({
  board: undoableBoardReducer,
  ui: uiReducer,
});

const persistedPresent = loadBoardPresentFromStorage();

const preloadedState: Partial<RootState> | undefined = persistedPresent
  ? {
      board: {
        past: [],
        present: persistedPresent,
        future: [],
      },
    }
  : undefined;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
