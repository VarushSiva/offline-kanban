import type { RootState } from "../../store";

export const selectBoard = (state: RootState) => state.board;
export const selectSearchQuery = (state: RootState) => state.board.searchQuery;
export const selectColumns = (state: RootState) => {
  const { columnsById, columnOrder } = state.board;
  return columnOrder.map((id) => columnsById[id]).filter(Boolean);
};

export const selectVisibleCardsForColumn =
  (columnId: string) => (state: RootState) => {
    const { columnsById, cardsById, searchQuery } = state.board;
    const col = columnsById[columnId];
    if (!col) return [];

    const query = searchQuery.trim().toLowerCase();
    const cards = col.cardIds.map((id) => cardsById[id]).filter(Boolean);

    if (!query) return cards;
    return cards.filter((card) => card.title.toLowerCase().includes(query));
  };
