import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Id = string;

type Card = { id: Id; title: string };
type Column = { id: Id; title: string; cardIds: Id[] };

export type BoardState = {
  columnsById: Record<Id, Column>;
  columnOrder: Id[];
  cardsById: Record<Id, Card>;
};

const initialState: BoardState = {
  columnsById: {
    todo: { id: "todo", title: "Todo", cardIds: ["c1"] },
    doing: { id: "doing", title: "Doing", cardIds: [] },
    done: { id: "done", title: "Done", cardIds: [] },
  },
  columnOrder: ["todo", "doing", "done"],
  cardsById: {
    c1: { id: "c1", title: "Test responsive board shell" },
  },
};

type AddColumnPayload = { title: string };
type AddCardPayload = { columnId: Id; title: string };
type DeleteCardPayload = { columnId: Id; cardId: Id };

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    addColumn: (state, action: PayloadAction<AddColumnPayload>) => {
      const id = nanoid();
      state.columnsById[id] = { id, title: action.payload.title, cardIds: [] };
      state.columnOrder.push(id);
    },
    addCard: (state, action: PayloadAction<AddCardPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;

      const id = nanoid();
      state.cardsById[id] = { id, title: action.payload.title };
      col.cardIds.unshift(id);
    },
    deleteCard: (state, action: PayloadAction<DeleteCardPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;

      col.cardIds = col.cardIds.filter((id) => id !== action.payload.cardId);
      delete state.cardsById[action.payload.cardId];
    },
  },
});

export const { addColumn, addCard, deleteCard } = boardSlice.actions;
export default boardSlice.reducer;
