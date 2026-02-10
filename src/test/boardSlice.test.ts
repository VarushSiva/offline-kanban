import reducer from "../features/board/boardSlice";
import {
  addColumn,
  addCard,
  renameColumn,
  deleteColumn,
  updateCard,
  setSearchQuery,
} from "../features/board/boardSlice";

test(`addColumn appends a column`, () => {
  const state = reducer(undefined, addColumn({ title: "Backlog" }));
  expect(state.columnOrder.length).toBeGreaterThan(0);
});

test(`renameColumn changes title`, () => {
  const state = reducer(
    undefined,
    renameColumn({ columnId: "todo", title: "To do" }),
  );
  expect(state.columnsById.todo.title).toBe("To do");
});

test("addCard adds to a column", () => {
  const state = reducer(
    undefined,
    addCard({ columnId: "todo", title: "Test card" }),
  );
  expect(state.columnsById.todo.cardIds.length).toBeGreaterThan(0);
});

test("updateCard updates title", () => {
  const state = reducer(
    undefined,
    updateCard({ cardId: "c1", title: "Updated", description: "x" }),
  );
  expect(state.cardsById.c1.title).toBe("Updated");
  expect(state.cardsById.c1.description).toBe("x");
});

test("deleteColumn removes column and its cards", () => {
  const state = reducer(undefined, deleteColumn({ columnId: "todo" }));
  expect(state.columnsById.todo).toBeUndefined();
  expect(state.cardsById.c1).toBeUndefined();
});

test("setSearchQuery updates query", () => {
  const state = reducer(undefined, setSearchQuery("test"));
  expect(state.searchQuery).toBe("test");
});
