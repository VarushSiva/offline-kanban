import "./App.css";

export default function App() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md bg-violet-500/20"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold leading-5">Offline Kanban</p>
              <p className="text-xs text-zinc-400 leading-4">
                React + Redux • Undo/Redo • Offline-first
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost">
              Import
            </button>
            <button type="button" className="btn btn-primary">
              New Board
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="card p-4">
          <h1 className="text-lg font-semibold">Testing UI</h1>
          <p className="mt-1 text-sm text-zinc-400">Testing UI and Styles</p>

          <div className="mt-4 flex gap-3">
            <input type="text" className="input" placeholder="Quick Search" />
            <button type="button" className="btn btn-primary">
              Add Column
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
