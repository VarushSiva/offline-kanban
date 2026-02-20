import type { RootState } from "../../store";
import { createSelector } from "@reduxjs/toolkit";
import { selectSearchQuery } from "../ui/selectors";

export const selectBoardPresent = (state: RootState) => state.board.present;

export const selectColumns = createSelector([selectBoardPresent], (present) => {
  return present.columnOrder.map((id) => present.columnsById[id]);
});

export const selectVisibleCardsForColumn = (columnId: string) =>
  createSelector(
    [selectBoardPresent, selectSearchQuery],
    (present, searchQuery) => {
      const col = present.columnsById[columnId];
      if (!col) return [];

      const query = searchQuery.trim().toLowerCase();
      const cards = col.cardIds
        .map((id) => present.cardsById[id])
        .filter(Boolean);

      if (!query) return cards;
      return cards.filter((card) => card.title.toLowerCase().includes(query));
    },
  );
