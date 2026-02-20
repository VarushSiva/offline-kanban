import type { BoardPresentState } from "../board/boardSlice";

const STORAGE_KEY = "offline-kanban:v1";
const SCHEMA_VERSION = 1;

type PersistedShape = {
  schemaVersion: number;
  savedAt: string;
  boardPresent: BoardPresentState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function migratePersisted(data: unknown): PersistedShape | null {
  if (!isRecord(data)) return null;

  if (data.schemaVersion !== 1) return null;

  if (!("boardPresent" in data)) return null;
  if (!isRecord((data as any).boardPresent)) return null;

  return data as PersistedShape;
}

export function loadBoardPresentFromStorage(): BoardPresentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    const migrated = migratePersisted(parsed);
    if (!migrated) return null;

    const present = migrated.boardPresent as any;

    // Ignore old persisted searchQuery if exist
    if ("searchQuery" in present) {
      const { searchQuery: _ignored, ...rest } = present;
      return rest;
    }

    return present;
  } catch {
    return null;
  }
}

export function saveBoardPresentToStorage(
  boardPresent: BoardPresentState,
): void {
  try {
    const payload: PersistedShape = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      boardPresent,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save board state to localStorage", error);
  }
}

export function clearStorage(): void {
  if (localStorage.getItem(STORAGE_KEY)) {
    localStorage.removeItem(STORAGE_KEY);
  }
}
