import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Id = string;

type Card = {
  id: Id;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

type Column = { id: Id; title: string; cardIds: Id[] };

export type BoardState = {
  columnsById: Record<Id, Column>;
  columnOrder: Id[];
  cardsById: Record<Id, Card>;
  searchQuery: string;
};

const now = () => Date.now();

const initialState: BoardState = {
  columnsById: {
    todo: { id: "todo", title: "Todo", cardIds: ["c1"] },
    doing: { id: "doing", title: "Doing", cardIds: [] },
    done: { id: "done", title: "Done", cardIds: [] },
  },
  columnOrder: ["todo", "doing", "done"],
  cardsById: {
    c1: {
      id: "c1",
      title: "Task #1",
      createdAt: now(),
      updatedAt: now(),
    },
  },
  searchQuery: "",
};

type AddColumnPayload = { title: string };
type RenameColumnPayload = { columnId: Id; title: string };
type DeleteColumnPayload = { columnId: Id };

type AddCardPayload = { columnId: Id; title: string };
type UpdateCardPayload = { cardId: Id; title: string; description?: string };
type DeleteCardPayload = { columnId: Id; cardId: Id };

type MoveCardPayload = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    addColumn: (state, action: PayloadAction<AddColumnPayload>) => {
      const id = nanoid();
      state.columnsById[id] = { id, title: action.payload.title, cardIds: [] };
      state.columnOrder.push(id);
    },
    renameColumn: (state, action: PayloadAction<RenameColumnPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;
      col.title = action.payload.title;
    },
    deleteColumn: (state, action: PayloadAction<DeleteColumnPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;

      col.cardIds.forEach((cardId) => {
        delete state.cardsById[cardId];
      });

      delete state.columnsById[action.payload.columnId];
      state.columnOrder = state.columnOrder.filter(
        (id) => id !== action.payload.columnId,
      );
    },

    addCard: (state, action: PayloadAction<AddCardPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;

      const id = nanoid();
      state.cardsById[id] = {
        id,
        title: action.payload.title,
        createdAt: now(),
        updatedAt: now(),
      };
      col.cardIds.unshift(id);
    },
    updateCard: (state, action: PayloadAction<UpdateCardPayload>) => {
      const card = state.cardsById[action.payload.cardId];
      if (!card) return;

      card.title = action.payload.title;
      card.description = action.payload.description;
      card.updatedAt = now();
    },
    deleteCard: (state, action: PayloadAction<DeleteCardPayload>) => {
      const col = state.columnsById[action.payload.columnId];
      if (!col) return;

      col.cardIds = col.cardIds.filter((id) => id !== action.payload.cardId);
      delete state.cardsById[action.payload.cardId];
    },

    moveCard: (state, action: PayloadAction<MoveCardPayload>) => {
      const { cardId, fromColumnId, toColumnId, toIndex } = action.payload;

      const fromCol = state.columnsById[fromColumnId];
      const toCol = state.columnsById[toColumnId];

      if (!fromCol || !toCol) return;

      // Remove from source
      fromCol.cardIds = fromCol.cardIds.filter((id) => id !== cardId);

      // Insert into destination
      const clampedIndex = Math.max(0, Math.min(toIndex, toCol.cardIds.length));
      toCol.cardIds.splice(clampedIndex, 0, cardId);
    },
  },
});

export const {
  setSearchQuery,
  addColumn,
  renameColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
} = boardSlice.actions;

export default boardSlice.reducer;
