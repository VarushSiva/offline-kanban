import type { RootState } from "../../store";

export const selectSearchQuery = (state: RootState) => state.ui.searchQuery;
