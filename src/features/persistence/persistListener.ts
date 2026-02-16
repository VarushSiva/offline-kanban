import type { BoardPresentState } from "../board/boardSlice";
import { saveBoardPresentToStorage } from "./storage";

type Store = {
  subscribe: (listener: () => void) => () => void;
  getState: () => { board: { present: BoardPresentState } };
};

export function attachPersistence(store: Store) {
  let lastSerialized = "";
  let timeoutId: number | null = null;

  store.subscribe(() => {
    const present = store.getState().board.present;

    // Serialize present
    const nextSerialized = JSON.stringify(present);
    if (nextSerialized === lastSerialized) return;

    lastSerialized = nextSerialized;

    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      saveBoardPresentToStorage(present);
    }, 250);
  });
}
