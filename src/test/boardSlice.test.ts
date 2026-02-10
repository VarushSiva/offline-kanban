import reducer from "../features/board/boardSlice";
import { addColumn, addCard } from "../features/board/boardSlice";

test(`addColumn appends a column`, () => {
  const state = reducer(undefined, addColumn({ title: "Backlog" }));
  expect(state.columnOrder.length).toBeGreaterThan(0);
});

test("addCard adds to a column", () => {
  const state1 = reducer(
    undefined,
    addCard({ columnId: "todo", title: "Test card" }),
  );
  expect(state1.columnsById.todo.cardIds.length).toBeGreaterThan(0);
});
