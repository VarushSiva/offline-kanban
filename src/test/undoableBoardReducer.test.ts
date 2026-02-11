import undoableBoardReducer from "../features/history/undoableBoardReducer";
import { undo, redo } from "../features/history/undoableBoardReducer";
import { renameColumn, setSearchQuery } from "../features/board/boardSlice";

test("setSearchQuery does not push to history", () => {
  const state = undoableBoardReducer(undefined, setSearchQuery("test"));
  expect(state.past).toHaveLength(0);
  expect(state.present.searchQuery).toBe("test");
});

test("undo/redo works for an undoable action", () => {
  const state = undoableBoardReducer(
    undefined,
    renameColumn({ columnId: "todo", title: "To do" }),
  );
  expect(state.past).toHaveLength(1);
  expect(state.present.columnsById.todo.title).toBe("To do");

  const secondState = undoableBoardReducer(state, undo());
  expect(secondState.present.columnsById.todo.title).toBe("Todo");

  const thirdState = undoableBoardReducer(secondState, redo());
  expect(thirdState.present.columnsById.todo.title).toBe("To do");
});
