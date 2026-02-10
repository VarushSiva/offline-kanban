import { useMemo, useState } from "react";
import { addCard, addColumn, deleteCard } from "./boardSlice";
import { announce } from "../ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const { columnsById, columnOrder, cardsById } = useAppSelector(
    (s) => s.board,
  );

  const [newColumnTitle, setNewColumnTitle] = useState("");

  const columns = useMemo(() => {
    return columnOrder.map((id) => columnsById[id]).filter(Boolean);
  }, [columnOrder, columnsById]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      </header>

      {/* Mobile: Horizontal Scroll + Snap */}
      <section
        className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory, md:grid md:overflow-visible md:pb-0 md:snap-none md:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]"
        aria-label="Kanban board"
      >
        {columns.map((col) => (
          <div
            key={col.id}
            className="card snap-start w-72 sm:w-80 md:w-auto p-3 sm:p-4 motion-safe:animate-fade-in-up"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{col.title}</h2>
              <span className="text-xs text-zinc-400">
                {col.cardIds.length}
              </span>
            </div>

            <AddCardInline
              columnId={col.id}
              onAdd={(title) => {
                dispatch(addCard({ columnId: col.id, title }));
                dispatch(announce(`Added card ${title} to ${col.title}`));
              }}
            />

            <ul className="mt-3 space-y-2">
              {col.cardIds.map((cardId) => {
                const card = cardsById[cardId];
                if (!card) return null;

                return (
                  <li
                    key={card.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-3 motion-safe:animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{card.title}</p>
                      <button
                        type="button"
                        className="btn btn-ghost px-2 py-1 min-h-8"
                        onClick={() => {
                          dispatch(
                            deleteCard({ columnId: col.id, cardId: card.id }),
                          );
                          dispatch(announce(`Deleted card ${card.title}`));
                        }}
                        aria-label={`Delete card ${card.title}`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function AddCardInline({
  columnId,
  onAdd,
}: {
  columnId: string;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const v = title.trim();
        if (!v) return;

        onAdd(v);
        setTitle("");
      }}
    >
      <input
        type="text"
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a card..."
        aria-label={`Add card in column ${columnId}`}
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
