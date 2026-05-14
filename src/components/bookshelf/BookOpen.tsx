import { useEffect } from "react";
import type { Book } from "./books";
import { useSettings, SPINE_FONTS, bionicize } from "./useSettings";

type Props = {
  book: Book;
  onClose: () => void;
};

export function BookOpen({ book, onClose }: Props) {
  const { spineFont, cycleSpineFont, bionic, toggleBionic, trash, restoreTrash, clearTrash } = useSettings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSettings = book.id === "settings";
  const isDashboard = book.id === "dashboard";
  const currentFontLabel = SPINE_FONTS.find((f) => f.id === spineFont)?.label ?? spineFont;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 py-8 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl animate-scale-in"
        style={{ perspective: "2000px" }}
      >
        <div
          className="relative grid grid-cols-1 overflow-hidden rounded-md shadow-2xl md:grid-cols-2"
          style={{
            background: "var(--paper)",
            boxShadow: "var(--shadow-warm), 0 30px 80px -20px rgba(0,0,0,0.5)",
            minHeight: 480,
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/25 to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-12 -translate-x-1/2 bg-gradient-to-r from-ink/10 via-transparent to-ink/10 md:block" />

          <div
            className="relative flex flex-col justify-between p-10"
            style={{
              backgroundColor: "var(--paper)",
              backgroundImage:
                "radial-gradient(ellipse at top left, rgba(0,0,0,0.04), transparent 60%)",
            }}
          >
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
                Volume
              </p>
              <h2
                className="mt-6 font-serif text-5xl font-semibold leading-tight"
                style={{ color: book.spine }}
              >
                {bionicize(book.title, bionic)}
              </h2>
              <div
                className="mt-6 h-px w-20"
                style={{ backgroundColor: book.spine }}
              />
              <p className="mt-6 max-w-xs font-serif text-sm italic text-ink/70">
                {bionicize("A small chapter of your home, opened with care.", bionic)}
              </p>
            </div>
            <p className="font-sans text-xs text-ink/50">— Library</p>
          </div>

          <div
            className="relative p-10"
            style={{
              backgroundColor: "var(--paper)",
              backgroundImage:
                "radial-gradient(ellipse at top right, rgba(0,0,0,0.04), transparent 60%)",
            }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
              Table of Contents
            </p>
            <ol className="mt-6 space-y-3">
              {book.toc.map((item, i) => {
                const isFontItem = isSettings && item === "Spine font";
                const isBionicItem = isSettings && item === "Bionic reading";
                const interactive = isFontItem || isBionicItem;
                const onItemClick = isFontItem
                  ? cycleSpineFont
                  : isBionicItem
                    ? toggleBionic
                    : undefined;
                const right = isFontItem
                  ? currentFontLabel
                  : isBionicItem
                    ? bionic
                      ? "On"
                      : "Off"
                    : String((i + 1) * 3).padStart(3, "0");
                return (
                  <li key={item}>
                    <button
                      onClick={onItemClick}
                      disabled={!interactive && !isSettings}
                      className="group flex w-full items-baseline gap-4 text-left font-serif text-lg text-ink transition"
                    >
                      <span className="w-6 text-sm tabular-nums text-ink/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 border-b border-dotted border-ink/30 pb-1 group-hover:border-ink/70">
                        {bionicize(item, bionic)}
                      </span>
                      <span className="text-sm tabular-nums text-ink/60 transition group-hover:text-ink">
                        {interactive ? right : right}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {isSettings && (
              <p className="mt-6 font-sans text-xs italic text-ink/50">
                Tap “Spine font” or “Bionic reading” to change.
              </p>
            )}
            {isDashboard && (
              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
                    Trash
                  </p>
                  {trash.length > 0 && (
                    <button
                      onClick={clearTrash}
                      className="font-sans text-[10px] uppercase tracking-wider text-ink/50 hover:text-ink"
                    >
                      empty
                    </button>
                  )}
                </div>
                {trash.length === 0 ? (
                  <p className="mt-3 font-serif text-sm italic text-ink/50">
                    Nothing here.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {trash.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-ink/10 px-3 py-2"
                      >
                        <span className="truncate font-serif text-sm text-ink">{t.label}</span>
                        <button
                          onClick={() => restoreTrash(t.id)}
                          aria-label={`Restore ${t.label}`}
                          title="Bring it back"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:opacity-80"
                        >
                          +
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="col-span-1 flex justify-center border-t border-ink/10 px-6 py-4 md:col-span-2">
            <button
              onClick={onClose}
              aria-label="Back to library"
              className="font-serif text-lg text-ink/70 transition hover:-translate-x-0.5 hover:text-ink"
            >
              ←
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full bg-wood-dark px-4 py-2 font-sans text-sm text-paper shadow-lg transition hover:bg-wood"
        >
          Close book
        </button>
      </div>
    </div>
  );
}
