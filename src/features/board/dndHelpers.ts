type MovePayload = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
};

type Board = {
  columnsById: Record<string, { id: string; cardIds: string[] }>;
  columnOrder: string[];
};

function findCard(board: Board, cardId: string) {
  for (const colId of board.columnOrder) {
    const col = board.columnsById[colId];
    const index = col.cardIds.indexOf(cardId);
    if (index !== -1) return { columnId: colId, index };
  }
  return null;
}

export function getMovePayloadFromDrag(
  board: Board,
  activeId: string,
  overId: string,
): MovePayload | null {
  const from = findCard(board, activeId);
  if (!from) return null;

  // If overId is a columnId, append to that column
  const isOverColumn = Boolean(board.columnsById[overId]);
  if (isOverColumn) {
    const destinationIds = board.columnsById[overId].cardIds.filter(
      (id) => id !== activeId,
    );
    return {
      cardId: activeId,
      fromColumnId: from.columnId,
      toColumnId: overId,
      toIndex: destinationIds.length,
    };
  }

  // Otherwise overId should be a cardId
  const overlocation = findCard(board, overId);
  if (!overlocation) return null;

  const destinationIds = board.columnsById[
    overlocation.columnId
  ].cardIds.filter((id) => id !== activeId);
  const overIndex = destinationIds.indexOf(overId);

  return {
    cardId: activeId,
    fromColumnId: from.columnId,
    toColumnId: overlocation.columnId,
    toIndex: overIndex === -1 ? destinationIds.length : overIndex,
  };
}
