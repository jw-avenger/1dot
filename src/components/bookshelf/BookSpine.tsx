import { memo } from "react";
import type { Book } from "./books";
import { useSettings, resolveSpineFontCss, bionicize } from "./useSettings";

type Props = {
  book: Book;
  onShelf: boolean;
  editMode: boolean;
  onClick: () => void;
  onToggle: () => void;
  /** When true, render a gentle drifting-sparkle cue above the spine. */
  sparkle?: boolean;
};

function BookSpineImpl({ book, onShelf, editMode, onClick, onToggle, sparkle = false }: Props) {
  const { spineFont, customFont, bionic, colors } = useSettings();
  const fontFamily = resolveSpineFontCss(spineFont, customFont);
  const spineColor = colors[book.id] ?? book.spine;
  const w = book.width;
  const h = book.height;

  if (!onShelf) {
    return (
      <button
        onClick={onToggle}
        className="group flex h-10 items-center gap-2 rounded-md border border-dashed border-wood/40 bg-paper/50 px-2.5 text-xs text-ink/70 transition hover:border-wood hover:bg-paper"
      >
        <span className="h-5 w-1.5 rounded-sm" style={{ backgroundColor: spineColor }} aria-hidden />
        <span style={{ fontFamily }}>{bionicize(book.title, bionic)}</span>
        <span className="ml-1 text-[10px] opacity-60 group-hover:opacity-100">+ shelve</span>
      </button>
    );
  }

  return (
    <button
      onClick={editMode ? onToggle : onClick}
      aria-label={book.title}
      className="group relative origin-bottom cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 hover:-rotate-1"
      style={{ height: h, width: w }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-t-[3px] rounded-b-[2px]"
        style={{
          backgroundColor: spineColor,
          boxShadow: "var(--shadow-book), inset 0 0 18px rgba(0,0,0,0.35)",
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.10) 14%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.22) 90%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "rgba(0,0,0,0.35)" }} />
        <div className="absolute inset-x-1 top-2 h-px" style={{ background: "var(--spine-gold)", opacity: 0.55 }} />
        <div className="absolute inset-x-2 bottom-4 h-px" style={{ background: "var(--spine-gold)", opacity: 0.35 }} />
        <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: "rgba(0,0,0,0.4)" }} />

        <div className="absolute inset-0 flex items-center justify-center" style={{ color: book.textColor }}>
          <span
            className="font-semibold whitespace-nowrap"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontSize: Math.min(w * 0.32, 12),
              letterSpacing: "0.12em",
              fontFamily,
              textShadow: "0 1px 0 rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.25)",
            }}
          >
            {bionicize(book.title.toUpperCase(), bionic)}
          </span>
        </div>
      </div>

      {editMode && (
        <span className="absolute -top-2 -right-2 rounded-full bg-wood-dark px-1.5 py-0.5 text-[9px] font-medium text-paper shadow-md">
          remove
        </span>
      )}
    </button>
  );
}

export const BookSpine = memo(BookSpineImpl);
