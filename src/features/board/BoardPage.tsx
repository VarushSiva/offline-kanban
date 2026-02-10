import { useMemo, useState } from "react";
import { announce } from "../ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectColumns,
  selectSearchQuery,
  selectVisibleCardsForColumn,
} from "./selectors";
import {
  addCard,
  addColumn,
  deleteCard,
  deleteColumn,
  renameColumn,
  setSearchQuery,
  updateCard,
} from "./boardSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectColumns);
  const searchQuery = useAppSelector(selectSearchQuery);

  const [newColumnTitle, setNewColumnTitle] = useState("");

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Offline Kanban</h1>
            <p className="text-sm text-zinc-400">
              Mobile-first • Accesssible • Offline Kanban
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-2 sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              const title = newColumnTitle.trim();
              if (!title) return;

              dispatch(addColumn({ title }));
              dispatch(announce(`Added column ${title}`));
              setNewColumnTitle("");
            }}
          >
            <input
              className="input sm:w-64"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="New column title..."
            />
            <button type="submit" className="btn btn-primary min-h-10">
              Add Column
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="search" className="sr-only">
              Quick search cards
            </label>
            <input
              id="search"
              className="input"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search cards..."
            />
          </div>

          <p className="text-xs text-zinc-400">
            Tip: search filters titles per column
          </p>
        </div>
      </header>

      {/* Mobile: Horizontal Scroll + Snap */}
      <section
        className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory, md:grid md:overflow-visible md:pb-0 md:snap-none md:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]"
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
}: {
  columnId: string;
  title: string;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddCard: (title: string) => void;
  onDeleteCard: (cardId: string, cardTitle: string) => void;
  onUpdateCard: (cardId: string, title: string, description?: string) => void;
}) {
  const cards = useAppSelector(
    useMemo(() => selectVisibleCardsForColumn(columnId), [columnId]),
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  return (
    <div className="card snap-start w-72 sm:w-80 md:w-auto p-3 sm:p-4 motion-safe:animate-fade-in-up">
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
        {cards.map((card) => (
          <CardItem
            key={card.id}
            cardId={card.id}
            title={card.title}
            description={card.description}
            onDelete={() => onDeleteCard(card.id, card.title)}
            onSave={(nextTitle, nextDesc) =>
              onUpdateCard(card.id, nextTitle, nextDesc)
            }
          />
        ))}
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
}: {
  cardId: string;
  title: string;
  description?: string;
  onDelete: () => void;
  onSave: (title: string, description?: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDesc, setDraftDesc] = useState(description ?? "");

  if (isEditing) {
    return (
      <li className="rounded-md border border-zinc-800 bg-zinc-900 p-3 motion-safe:animate-fade-in">
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
    <li className="rounded-md border border-zinc-800 bg-zinc-900 p-3 motion-safe:animate-fade-in">
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
