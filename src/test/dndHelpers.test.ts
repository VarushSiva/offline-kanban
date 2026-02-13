import { getMovePayloadFromDrag } from "../features/board/dndHelpers";

const board = {
  columnOrder: ["todo", "doing"],
  columnsById: {
    todo: { id: "todo", cardIds: ["a", "b"] },
    doing: { id: "doing", cardIds: ["c"] },
  },
};

test("drag over a card moves before that card", () => {
  const moveCard = getMovePayloadFromDrag(board, "a", "c");
  expect(moveCard).toEqual({
    cardId: "a",
    fromColumnId: "todo",
    toColumnId: "doing",
    toIndex: 0,
  });
});

test("drag over a column --> append", () => {
  const moveCard = getMovePayloadFromDrag(board, "a", "doing");
  expect(moveCard).toEqual({
    cardId: "a",
    fromColumnId: "todo",
    toColumnId: "doing",
    toIndex: 1,
  });
});
