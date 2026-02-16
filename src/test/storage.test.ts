import {
  saveBoardPresentToStorage,
  loadBoardPresentFromStorage,
} from "../features/persistence/storage";

beforeEach(() => {
  localStorage.clear();
});

test("saves and loads board present", () => {
  const present = {
    columnOrder: ["todo"],
    columnsById: { todo: { id: "todo", title: "Todo", cardIds: [] } },
    cardsById: {},
    searchQuery: "",
  } as any;

  saveBoardPresentToStorage(present);
  const loaded = loadBoardPresentFromStorage();

  expect(loaded).toBeTruthy();
  expect((loaded as any).columnOrder).toEqual(["todo"]);
});
