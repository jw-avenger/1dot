import { useEffect, useState } from "react";
import { BOOKS } from "./books";
import { BookSpine } from "./BookSpine";
import { BookOpen } from "./BookOpen";
import { SimpleMenu } from "./SimpleMenu";
import { useShelfState } from "./useShelfState";

type ViewMode = "shelf" | "simple";
type Theme = "light" | "dark";

function useLocalState<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(raw as T);
    } catch {
      // ignore
    }
  }, [key]);
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      // ignore
    }
  };
  return [value, set];
}

export function Bookshelf() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useLocalState<ViewMode>("shelf:viewMode", "shelf");
  const [theme, setTheme] = useLocalState<Theme>("shelf:theme", "light");
  const allIds = BOOKS.map((b) => b.id);
  const { onShelf, toggle, reshelveAll } = useShelfState(allIds);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const openBook = BOOKS.find((b) => b.id === openId) ?? null;
  const offShelf = BOOKS.filter((b) => !onShelf.has(b.id));

  const Controls = (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex overflow-hidden rounded-full border text-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--paper)" }}
      >
        <button
          onClick={() => setViewMode("shelf")}
          className="px-3 py-1.5 transition"
          style={{
            backgroundColor: viewMode === "shelf" ? "var(--wood-dark)" : "transparent",
            color: viewMode === "shelf" ? "var(--paper)" : "var(--ink)",
          }}
        >
          Shelf
        </button>
        <button
          onClick={() => setViewMode("simple")}
          className="px-3 py-1.5 transition"
          style={{
            backgroundColor: viewMode === "simple" ? "var(--wood-dark)" : "transparent",
            color: viewMode === "simple" ? "var(--paper)" : "var(--ink)",
          }}
        >
          Simple
        </button>
      </div>
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="rounded-full border px-3 py-1.5 text-sm transition"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
        }}
        aria-label="Toggle theme"
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      {viewMode === "shelf" && (
        <button
          onClick={() => setEditMode((v) => !v)}
          className="rounded-full border px-4 py-1.5 text-sm shadow-sm transition"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--paper)",
            color: "var(--ink)",
          }}
        >
          {editMode ? "Done arranging" : "Arrange shelf"}
        </button>
      )}
    </div>
  );

  if (viewMode === "simple") {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <header
          className="flex flex-wrap items-center justify-between gap-3 px-6 pt-8 md:px-12"
          style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >
          <p className="font-serif text-lg font-semibold">Library</p>
          {Controls}
        </header>
        <SimpleMenu onSelect={(id) => setOpenId(id)} />
        {openBook && <BookOpen book={openBook} onClose={() => setOpenId(null)} />}
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans"
      style={{
        backgroundColor: "var(--wall)",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 20%, var(--lamp-glow) 0%, transparent 60%), repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0 2px, transparent 2px 6px)",
      }}
    >
      {/* header */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 pt-8 md:px-12">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
            Stress-Free Home Help
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
            Your Library
          </h1>
        </div>
        {Controls}
      </header>

      {/* lamp glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--lamp-glow) 0%, transparent 70%)",
        }}
      />

      {/* shelf */}
      <main className="relative z-10 mx-auto mt-16 max-w-5xl px-6 md:mt-24 md:px-12">
        <div className="relative">
          {/* (back wall removed — shelf is transparent so wall/dark mode shows through) */}


          {/* books row */}
          <div
            className="relative flex items-end justify-center gap-1 px-6 pb-2"
            style={{ minHeight: 300 }}
          >
            {BOOKS.filter((b) => onShelf.has(b.id)).map((book) => (
              <BookSpine
                key={book.id}
                book={book}
                onShelf
                editMode={editMode}
                onClick={() => setOpenId(book.id)}
                onToggle={() => toggle(book.id)}
              />
            ))}
            {onShelf.size === 0 && (
              <p className="py-20 font-serif italic text-ink/50">
                The shelf is bare. Add some books below.
              </p>
            )}
          </div>

          {/* shelf plank */}
          <div
            className="relative h-6 rounded-sm"
            style={{
              background:
                "linear-gradient(180deg, var(--wood-light) 0%, var(--wood) 40%, var(--wood-dark) 100%)",
              boxShadow:
                "0 12px 24px -10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          />
          {/* plank front edge */}
          <div
            className="h-3 rounded-b-sm"
            style={{
              background:
                "linear-gradient(180deg, var(--wood-dark) 0%, oklch(0.22 0.04 40) 100%)",
            }}
          />
          {/* brackets */}
          <div
            className="absolute -bottom-10 left-8 h-10 w-3 rounded-b-sm"
            style={{ background: "var(--wood-dark)" }}
          />
          <div
            className="absolute -bottom-10 right-8 h-10 w-3 rounded-b-sm"
            style={{ background: "var(--wood-dark)" }}
          />
        </div>

        {/* off-shelf tray */}
        {editMode && (
          <div className="mt-20 rounded-lg border border-wood/30 bg-paper/60 p-5 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink/60">
                Off the shelf
              </p>
              <button
                onClick={reshelveAll}
                disabled={offShelf.length === 0}
                className="rounded-full bg-wood-dark px-4 py-1.5 font-sans text-xs text-paper shadow-sm transition hover:bg-wood disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reshelve all books
              </button>
            </div>
            {offShelf.length === 0 ? (
              <p className="mt-3 font-serif italic text-ink/50">
                Every book is on the shelf.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {offShelf.map((book) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onShelf={false}
                    editMode
                    onClick={() => {}}
                    onToggle={() => toggle(book.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-16 pb-12 text-center font-serif text-sm italic text-ink/50">
          Pick up a book to begin. Everything in its place, nothing in a hurry.
        </p>
      </main>

      {openBook && <BookOpen book={openBook} onClose={() => setOpenId(null)} />}
    </div>
  );
}
