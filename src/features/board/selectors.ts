import type { RootState } from "../../store";

export const selectBoardPresent = (state: RootState) => state.board.present;
export const selectSearchQuery = (state: RootState) =>
  state.board.present.searchQuery;
export const selectColumns = (state: RootState) => {
  const { columnsById, columnOrder } = state.board.present;
  return columnOrder.map((id) => columnsById[id]).filter(Boolean);
};

export const selectVisibleCardsForColumn =
  (columnId: string) => (state: RootState) => {
    const { columnsById, cardsById, searchQuery } = state.board.present;
    const col = columnsById[columnId];
    if (!col) return [];

    const query = searchQuery.trim().toLowerCase();
    const cards = col.cardIds.map((id) => cardsById[id]).filter(Boolean);

    if (!query) return cards;
    return cards.filter((card) => card.title.toLowerCase().includes(query));
  };
