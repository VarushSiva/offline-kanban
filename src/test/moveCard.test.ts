import reducer from "../features/board/boardSlice";
import { moveCard } from "../features/board/boardSlice";

test("moveCard moves a card between columns", () => {
  const state = reducer(
    undefined,
    moveCard({
      cardId: "c1",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 0,
    }),
  );
  expect(state.columnsById.todo.cardIds.includes("c1")).toBe(false);
  expect(state.columnsById.doing.cardIds[0]).toBe("c1");
});

test("moveCard clamps insertion index", () => {
  const state = reducer(
    undefined,
    moveCard({
      cardId: "c1",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 999,
    }),
  );
  expect(state.columnsById.doing.cardIds.includes("c1")).toBe(true);
});
