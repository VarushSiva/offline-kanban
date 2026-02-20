import {
  saveBoardPresentToStorage,
  loadBoardPresentFromStorage,
  clearStorage,
} from "../features/persistence/storage";

beforeEach(() => {
  localStorage.clear();
});

test("saves and loads board present", () => {
  const present: any = {
    columnOrder: ["todo"],
    columnsById: { todo: { id: "todo", title: "Todo", cardIds: [] } },
    cardsById: {},
    searchQuery: "",
  };

  saveBoardPresentToStorage(present);
  const loaded = loadBoardPresentFromStorage();

  expect(loaded).toBeTruthy();
  expect((loaded as any).columnOrder).toEqual(["todo"]);
});

test("returns null when storage is corrupted JSON", () => {
  localStorage.setItem("offline-kanban:v1", "{not valid json}");
  expect(loadBoardPresentFromStorage()).toBeNull();
});

test("clearStorage removes saved state", () => {
  const present: any = {
    columnOrder: ["todo"],
    columnsById: { todo: { id: "todo", title: "Todo", cardIds: [] } },
    cardsById: {},
    searchQuery: "",
  };

  saveBoardPresentToStorage(present);
  clearStorage();
  expect(loadBoardPresentFromStorage()).toBeNull();
});
