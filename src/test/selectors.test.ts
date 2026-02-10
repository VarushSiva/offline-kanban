import { selectVisibleCardsForColumn } from "../features/board/selectors";
import type { RootState } from "../store";

function makeState(): RootState {
  return {
    board: {
      columnsById: {
        todo: { id: "todo", title: "Todo", cardIds: ["a", "b"] },
      },
      columnOrder: ["todo"],
      cardsById: {
        a: { id: "a", title: "Write tests", createdAt: 1, updatedAt: 1 },
        b: { id: "b", title: "Build UI", createdAt: 1, updatedAt: 1 },
      },
      searchQuery: "",
    },
    ui: { announcement: { text: "", nonce: 0 } },
  };
}

test("selector returns all cards when search is empty", () => {
  const state = makeState();
  const cards = selectVisibleCardsForColumn("todo")(state);
  expect(cards).toHaveLength(2);
});

test("selector filters by search query", () => {
  const state = makeState();
  state.board.searchQuery = "test";
  const cards = selectVisibleCardsForColumn("todo")(state);
  expect(cards).toHaveLength(1);
  expect(cards[0].title).toBe("Write tests");
});
