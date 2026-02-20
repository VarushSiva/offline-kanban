import boardReducer from "../board/boardSlice";
import { setSearchQuery } from "../ui/uiSlice";
import { createAction } from "@reduxjs/toolkit";
import type { AnyAction } from "@reduxjs/toolkit";
import type { BoardState } from "../board/boardSlice";

export type UndoableState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const undo = createAction("history/undo");
export const redo = createAction("history/redo");
export const clearHistory = createAction("history/clear");

const HISTORY_LIMIT = 50;

// Initial present state by letting slice initialize itself
const initialPresent = boardReducer(undefined, { type: "@@INIT" } as AnyAction);

const initialState: UndoableState<BoardState> = {
  past: [],
  present: initialPresent,
  future: [],
};

// Set search query as not undoable
const NON_UNDOABLE = new Set<string>([setSearchQuery.type]);

export default function undoableBoardReducer(
  state: UndoableState<BoardState> = initialState,
  action: AnyAction,
): UndoableState<BoardState> {
  if (undo.match(action)) {
    if (state.past.length === 0) return state;

    const previous = state.past[state.past.length - 1];
    const nextPast = state.past.slice(0, -1);

    return {
      past: nextPast,
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (redo.match(action)) {
    if (state.future.length === 0) return state;

    const next = state.future[0];
    const nextFuture = state.future.slice(1);

    return {
      past: [...state.past, state.present],
      present: next,
      future: nextFuture,
    };
  }

  if (clearHistory.match(action)) {
    return { past: [], present: state.present, future: [] };
  }

  // Non-undoable actions just update preset without touching stacks
  if (NON_UNDOABLE.has(action.type)) {
    const nextPresent = boardReducer(state.present, action);
    if (nextPresent === state.present) return state;

    return { ...state, present: nextPresent };
  }

  // Normal undoable actions
  const nextPresent = boardReducer(state.present, action);
  if (nextPresent === state.present) return state;

  const nextPast = [...state.past, state.present];
  const trimmedPast =
    nextPast.length > HISTORY_LIMIT
      ? nextPast.slice(nextPast.length - HISTORY_LIMIT)
      : nextPast;

  return {
    past: trimmedPast,
    present: nextPresent,
    future: [],
  };
}
