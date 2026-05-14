import { useEffect } from "react";
import type { Book } from "./books";

type Props = {
  book: Book;
  onClose: () => void;
};

export function BookOpen({ book, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
          {/* book gutter */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/25 to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-12 -translate-x-1/2 bg-gradient-to-r from-ink/10 via-transparent to-ink/10 md:block" />

          {/* left page — title */}
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
                className="mt-6 font-serif text-5xl font-semibold leading-tight text-ink"
                style={{ color: book.spine }}
              >
                {book.title}
              </h2>
              <div
                className="mt-6 h-px w-20"
                style={{ backgroundColor: book.spine }}
              />
              <p className="mt-6 max-w-xs font-serif text-sm italic text-ink/70">
                A small chapter of your home, opened with care.
              </p>
            </div>
            <p className="font-sans text-xs text-ink/50">— Stress-Free Home Help</p>
          </div>

          {/* right page — TOC */}
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
              {book.toc.map((item, i) => (
                <li key={item}>
                  <button
                    // TODO: route when submenus exist
                    className="group flex w-full items-baseline gap-4 text-left font-serif text-lg text-ink transition hover:text-ink"
                  >
                    <span className="w-6 text-sm tabular-nums text-ink/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 border-b border-dotted border-ink/30 pb-1 group-hover:border-ink/70">
                      {item}
                    </span>
                    <span
                      className="text-sm tabular-nums text-ink/40 transition group-hover:text-ink/70"
                    >
                      {String((i + 1) * 3).padStart(3, "0")}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
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
