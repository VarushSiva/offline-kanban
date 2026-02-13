import { useMemo, useState, useEffect, useRef } from "react";
import { announce } from "../ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectColumns,
  selectSearchQuery,
  selectVisibleCardsForColumn,
} from "./selectors";
import { redo, undo } from "../history/undoableBoardReducer";
import {
  addCard,
  addColumn,
  deleteCard,
  deleteColumn,
  renameColumn,
  setSearchQuery,
  updateCard,
  moveCard,
} from "./boardSlice";
import type { RootState } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrashCan,
  faXmark,
  faArrowsUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectColumns);
  const searchQuery = useAppSelector(selectSearchQuery);
  const canUndo = useAppSelector((selector) => selector.board.past.length > 0);
  const canRedo = useAppSelector(
    (selector) => selector.board.future.length > 0,
  );
  const boardPresent = useAppSelector(
    (state: RootState) => state.board.present,
  );
  const { columnsById, columnOrder, cardsById } = boardPresent;

  type MoveState = null | {
    cardId: string;
    fromColumnId: string;
    toColumnId: string;
    toIndex: number;
  };

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [moveState, setMoveState] = useState<MoveState>(null);
  const [focusAfterMoveCardId, setFocusAfterMoveCardId] = useState<
    string | null
  >(null);
  const moveRef = useRef<HTMLDivElement | null>(null);

  const findCardLocation = (cardId: string) => {
    for (const colId of columnOrder) {
      const col = columnsById[colId];
      const index = col.cardIds.indexOf(cardId);
      if (index !== -1) return { columnId: colId, index: index };
    }
    return null;
  };

  const startMove = (cardId: string) => {
    const location = findCardLocation(cardId);
    if (!location) return;

    const cardTitle = cardsById[cardId]?.title ?? "Card";
    const colTite = columnsById[location.columnId]?.title ?? "column";

    const destinationIds = columnsById[location.columnId].cardIds.filter(
      (id) => id !== cardId,
    );
    const toIndex = Math.min(location.index, destinationIds.length);

    setMoveState({
      cardId,
      fromColumnId: location.columnId,
      toColumnId: location.columnId,
      toIndex,
    });

    dispatch(
      announce(
        `Picked up ${cardTitle} from ${colTite}. Use arrow keys to move. Press Enter to drop, Escape to cancel.`,
      ),
    );
  };

  const cancelMove = () => {
    if (!moveState) return;

    const cardTitle = cardsById[moveState.cardId]?.title ?? "Card";
    setMoveState(null);
    dispatch(announce(`Cancelled moving ${cardTitle}.`));
    setFocusAfterMoveCardId(moveState.cardId);
  };

  const dropMove = () => {
    if (!moveState) return;

    const cardTitle = cardsById[moveState.cardId]?.title ?? "Card";
    const destinationTitle =
      columnsById[moveState.toColumnId]?.title ?? "column";

    dispatch(
      moveCard({
        cardId: moveState.cardId,
        fromColumnId: moveState.fromColumnId,
        toColumnId: moveState.toColumnId,
        toIndex: moveState.toIndex,
      }),
    );

    dispatch(announce(`Moved ${cardTitle} to ${destinationTitle}.`));
    setFocusAfterMoveCardId(moveState.cardId);
    setMoveState(null);
  };

  useEffect(() => {
    if (!moveState) return;

    moveRef.current?.focus();
  }, [moveState]);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (moveState) {
        const key = e.key;

        if (key === "Escape") {
          e.preventDefault();
          cancelMove();
          return;
        }

        if (key === "Enter" || key === " " || key === "Spacebar") {
          e.preventDefault();
          dropMove();
          return;
        }

        const currentColIndex = columnOrder.indexOf(moveState.toColumnId);

        const getDestinationIds = (colId: string) => {
          const col = columnsById[colId];
          if (!col) return [];

          return col.cardIds.filter((id) => id !== moveState.cardId);
        };

        if (key === "ArrowLeft") {
          e.preventDefault();
          const nextIndex = Math.max(0, currentColIndex - 1);
          const nextColId = columnOrder[nextIndex];
          const destinationIds = getDestinationIds(nextColId);

          setMoveState({
            ...moveState,
            toColumnId: nextColId,
            toIndex: Math.min(moveState.toIndex, destinationIds.length),
          });

          dispatch(
            announce(`Target column ${columnsById[nextColId]?.title ?? ""}`),
          );
          return;
        }

        if (key === "ArrowRight") {
          e.preventDefault();
          const nextIndex = Math.min(
            columnOrder.length - 1,
            currentColIndex + 1,
          );
          const nextColId = columnOrder[nextIndex];
          const destinationIds = getDestinationIds(nextColId);

          setMoveState({
            ...moveState,
            toColumnId: nextColId,
            toIndex: Math.min(moveState.toIndex, destinationIds.length),
          });

          dispatch(
            announce(`Target column ${columnsById[nextColId]?.title ?? ""}`),
          );
          return;
        }

        if (key === "ArrowUp") {
          e.preventDefault();
          setMoveState({
            ...moveState,
            toIndex: Math.max(0, moveState.toIndex - 1),
          });
          return;
        }

        if (key === "ArrowDown") {
          e.preventDefault();
          const destinationIds = getDestinationIds(moveState.toColumnId);
          setMoveState({
            ...moveState,
            toIndex: Math.min(destinationIds.length, moveState.toIndex + 1),
          });
          return;
        }
      }

      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (!mod) return;

      const isUndo = key === "z" && !e.shiftKey;
      const isRedo = key === "y" || (key === "z" && e.shiftKey);

      if (isUndo) {
        if (!canUndo) return;
        e.preventDefault();
        dispatch(undo());
        dispatch(announce("Undid last action"));
      }

      if (isRedo) {
        if (!canRedo) return;
        e.preventDefault();
        dispatch(redo());
        dispatch(announce("Redid last action"));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, canUndo, canRedo, moveState, columnOrder, columnsById]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <header className="card p-3 sm:p-4">
        {/* Row 1: Title + Undo/Redo */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              Offline Kanban
            </h1>
            <p className="text-sm text-zinc-400">
              Mobile-first • Accesssible • Offline Kanban
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost icon-btn"
              onClick={() => {
                dispatch(undo());
                dispatch(announce("Undid last action"));
              }}
              disabled={!canUndo}
              aria-keyshortcuts="Control+Z Meta+Z"
            >
              Undo
            </button>

            <button
              type="button"
              className="btn btn-ghost icon-btn"
              onClick={() => {
                dispatch(redo());
                dispatch(announce("Redid last action"));
              }}
              disabled={!canRedo}
              aria-keyshortcuts="Control+Y Meta+Shift+Z"
            >
              Redo
            </button>
          </div>
        </div>

        {/* Row 2: Search + Add Column */}
        <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:items-start">
          <div className="w-full">
            <label htmlFor="search" className="sr-only">
              Quick search cards
            </label>
            <input
              type="text"
              id="search"
              className="input min-h-10"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search cards..."
            />
            <p className="mt-1 text-xs text-zinc-400">
              Tip: search filters titles per column
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-2 sm:justify-end"
            onSubmit={(e) => {
              e.preventDefault();
              const title = newColumnTitle.trim();
              if (!title) return;

              dispatch(addColumn({ title }));
              dispatch(announce(`Added column ${title}`));
              setNewColumnTitle("");
            }}
          >
            <label htmlFor="new-col" className="sr-only">
              New column title
            </label>
            <input
              id="new-col"
              className="input min-h-10 sm:w-64"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="New column title..."
            />
            <button
              type="submit"
              className="btn btn-primary min-h-10 whitespace-nowrap"
            >
              Add Column
            </button>
          </form>
        </div>
      </header>

      {moveState ? (
        <div
          ref={moveRef}
          tabIndex={-1}
          className="mt-3 card p-3 sm:p-4 border-violet-500/40 bg-violet-500/10"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <p className="text-zinc-200">
                {cardsById[moveState.cardId]?.title ?? "Card"} →{" "}
                {columnsById[moveState.toColumnId]?.title ?? "column"} (position{" "}
                {moveState.toIndex + 1})
              </p>
              <span className="font-semibold">Move:</span>{" "}
              <span className="text-zinc-200">
                Arrow keys to move • Enter to drop • Esc to cancel
              </span>
            </p>

            <button
              type="button"
              className="btn btn-ghost min-h-10"
              onClick={cancelMove}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Mobile: Horizontal Scroll + Snap */}
      <section
        className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:overflow-visible md:pb-0 md:snap-none md:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]"
        aria-label="Kanban board"
      >
        {columns.map((col) => (
          <ColumnView
            key={col.id}
            columnId={col.id}
            title={col.title}
            onRename={(title) => {
              dispatch(renameColumn({ columnId: col.id, title }));
              dispatch(announce(`Renamed column to ${title}`));
            }}
            onDelete={() => {
              const ok = window.confirm(
                `Delete column "${col.title}" and its cards?`,
              );
              if (!ok) return;

              dispatch(deleteColumn({ columnId: col.id }));
              dispatch(announce(`Deleted column ${col.title}`));
            }}
            onAddCard={(title) => {
              dispatch(addCard({ columnId: col.id, title }));
              dispatch(announce(`Added card ${title} to ${col.title}`));
            }}
            onDeleteCard={(cardId, cardTitle) => {
              dispatch(deleteCard({ columnId: col.id, cardId }));
              dispatch(announce(`Deleted card ${cardTitle}`));
            }}
            onUpdateCard={(cardId, title, description) => {
              dispatch(updateCard({ cardId, title, description }));
              dispatch(announce(`Update card ${title}`));
            }}
            moveState={moveState}
            onStartMove={(cardId) => startMove(cardId)}
            focusAfterMoveCardId={focusAfterMoveCardId}
            onDidFocusCard={(cardId) => {
              if (focusAfterMoveCardId === cardId)
                setFocusAfterMoveCardId(null);
            }}
          />
        ))}
      </section>
    </div>
  );
}

function ColumnView({
  columnId,
  title,
  onRename,
  onDelete,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  moveState,
  onStartMove,
  focusAfterMoveCardId,
  onDidFocusCard,
}: {
  columnId: string;
  title: string;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddCard: (title: string) => void;
  onDeleteCard: (cardId: string, cardTitle: string) => void;
  onUpdateCard: (cardId: string, title: string, description?: string) => void;
  moveState: null | {
    cardId: string;
    fromColumnId: string;
    toColumnId: string;
    toIndex: number;
  };
  onStartMove: (cardId: string) => void;
  focusAfterMoveCardId: string | null;
  onDidFocusCard: (cardId: string) => void;
}) {
  const cards = useAppSelector(
    useMemo(() => selectVisibleCardsForColumn(columnId), [columnId]),
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  return (
    <div
      className={`card snap-start w-72 sm:w-80 md:w-auto p-3 sm:p-4 motion-safe:animate-fade-in-up ${moveState?.toColumnId === columnId ? "ring-2 ring-violet-500/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        {isRenaming ? (
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const value = draftTitle.trim();
              if (!value) return;

              onRename(value);
              setIsRenaming(false);
            }}
          >
            <label htmlFor={`col-${columnId}-title`} className="sr-only">
              Column title
            </label>
            <input
              id={`col-${columnId}-title`}
              className="input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => {
                const value = draftTitle.trim();
                if (!value) return;

                onRename(value);
                setIsRenaming(false);
              }}
              autoFocus
            />
          </form>
        ) : (
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">{title}</h2>
            <p className="text-xs text-zinc-400">{cards.length} shown</p>
          </div>
        )}

        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost px-2 py-1 min-h-8"
            onClick={() => {
              setDraftTitle(title);
              setIsRenaming(true);
            }}
            aria-label={`Rename column ${title}`}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            type="button"
            className="btn btn-ghost px-2 py-1 min-h-8"
            onClick={onDelete}
            aria-label={`Delete column ${title}`}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      </div>

      <AddCardInline columnTitle={title} onAdd={(t) => onAddCard(t)} />

      <ul className="mt-3 space-y-2">
        {(() => {
          const movingId = moveState?.cardId ?? null;

          // Remove moving card from columns visibility
          const visibleCards = movingId
            ? cards.filter((card) => card.id !== movingId)
            : cards;
          const isTargetColumn = moveState?.toColumnId === columnId;

          // Build Ghost placeholder
          const items: Array<
            | { type: "card"; id: string; title: string; description?: string }
            | { type: "placeholder"; key: string }
          > = visibleCards.map((card) => ({
            type: "card",
            id: card.id,
            title: card.title,
            description: card.description,
          }));

          if (moveState && isTargetColumn) {
            const insertAt = Math.max(
              0,
              Math.min(moveState.toIndex, items.length),
            );
            items.splice(insertAt, 0, {
              type: "placeholder",
              key: `ph-${columnId}-${insertAt}`,
            });
          }

          return items.map((item) => {
            if (item.type === "placeholder") {
              return (
                <li
                  key={item.key}
                  aria-hidden="true"
                  className="rounded-md border-2 border-dashed border-violet-500/50 bg-violet-500/10 p-3"
                >
                  <p className="text-xs text-violet-200">Drop here</p>
                </li>
              );
            }

            const isBeingMoved = moveState?.cardId === item.id;
            const shouldFocusMoveButton = focusAfterMoveCardId === item.id;

            return (
              <CardItem
                key={item.id}
                cardId={item.id}
                title={item.title}
                description={item.description}
                onDelete={() => onDeleteCard(item.id, item.title)}
                onSave={(nextTitle, nextDesc) =>
                  onUpdateCard(item.id, nextTitle, nextDesc)
                }
                onStartMove={() => onStartMove(item.id)}
                isBeingMoved={isBeingMoved}
                shouldFocusMoveButton={shouldFocusMoveButton}
                onDidFocus={() => onDidFocusCard(item.id)}
              />
            );
          });
        })()}
      </ul>
    </div>
  );
}

function AddCardInline({
  columnTitle,
  onAdd,
}: {
  columnTitle: string;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const value = title.trim();
        if (!value) return;

        onAdd(value);
        setTitle("");
      }}
    >
      <label htmlFor={`add-card-${columnTitle}`} className="sr-only">
        Add card in {columnTitle}
      </label>
      <input
        type="text"
        className="input"
        id={`add-card-${columnTitle}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a card..."
      />
      <button
        type="submit"
        className="btn btn-primary min-h-10 whitespace-nowrap"
      >
        Add
      </button>
    </form>
  );
}

function CardItem({
  cardId,
  title,
  description,
  onDelete,
  onSave,
  onStartMove,
  isBeingMoved,
  shouldFocusMoveButton,
  onDidFocus,
}: {
  cardId: string;
  title: string;
  description?: string;
  onDelete: () => void;
  onSave: (title: string, description?: string) => void;
  onStartMove: () => void;
  isBeingMoved: boolean;
  shouldFocusMoveButton: boolean;
  onDidFocus: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDesc, setDraftDesc] = useState(description ?? "");

  const moveBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!shouldFocusMoveButton) return;
    moveBtnRef.current?.focus();
    onDidFocus();
  }, [shouldFocusMoveButton, onDidFocus]);

  if (isEditing) {
    return (
      <li className="rounded-md border border-zinc-700 bg-zinc-900 p-3 motion-safe:animate-fade-in">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = draftTitle.trim();
            if (!value) return;

            onSave(value, draftDesc.trim() ? draftDesc : undefined);
            setIsEditing(false);
          }}
        >
          <label htmlFor={`card-${cardId}-title`} className="sr-only">
            Card title
          </label>
          <input
            type="text"
            id={`card-${cardId}-title`}
            className="input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            autoFocus
          />

          <label htmlFor={`card-${cardId}-desc`} className="sr-only">
            Card description
          </label>
          <textarea
            id={`card-${cardId}-desc`}
            className="input min-h-24"
            value={draftDesc}
            onChange={(e) => setDraftDesc(e.target.value)}
            placeholder="Description (optional)"
          />

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setDraftTitle(title);
                setDraftDesc(description ?? "");
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`rounded-md border bg-zinc-900 p-3 motion-safe:animate-fade-in ${isBeingMoved ? "border-violet-500/60 bg-violet-500/10" : "border-zinc-700"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm wrap-break-word">{title}</p>
          {description ? (
            <p className="mt-1 text-xs text-zinc-400 wrap-break-word">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost px-2 py-1 min-h-8"
            onClick={() => {
              setDraftTitle(title);
              setDraftDesc(description ?? "");
              setIsEditing(true);
            }}
            aria-label={`Edit card ${title}`}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            type="button"
            className="btn btn-ghost px-2 py-1 min-h-8"
            onClick={onStartMove}
            aria-label={`Move card ${title}`}
            ref={moveBtnRef}
            disabled={isBeingMoved}
          >
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
          </button>
          <button
            type="button"
            className="btn btn-ghost px-2 py-1 min-h-8"
            onClick={onDelete}
            aria-label={`Delete card ${title}`}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>
    </li>
  );
}
