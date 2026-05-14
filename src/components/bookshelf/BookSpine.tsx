import type { Book } from "./books";
import { useSettings, SPINE_FONTS, bionicize } from "./useSettings";

type Props = {
  book: Book;
  onShelf: boolean;
  editMode: boolean;
  onClick: () => void;
  onToggle: () => void;
};

export function BookSpine({ book, onShelf, editMode, onClick, onToggle }: Props) {
  const { spineFont, bionic, colors } = useSettings();
  const fontFamily = SPINE_FONTS.find((f) => f.id === spineFont)?.css;
  const spineColor = colors[book.id] ?? book.spine;

  if (!onShelf) {
    return (
      <button
        onClick={onToggle}
        className="group flex h-12 items-center gap-2 rounded-md border border-dashed border-wood/40 bg-paper/50 px-3 text-sm text-ink/70 transition hover:border-wood hover:bg-paper"
      >
        <span
          className="h-6 w-2 rounded-sm"
          style={{ backgroundColor: spineColor }}
          aria-hidden
        />
        <span style={{ fontFamily }}>{bionicize(book.title, bionic)}</span>
        <span className="ml-1 text-xs opacity-60 group-hover:opacity-100">+ shelve</span>
      </button>
    );
  }

  return (
    <div className="relative flex items-end" style={{ height: 280 }}>
      <button
        onClick={editMode ? onToggle : onClick}
        aria-label={book.title}
        className="group relative origin-bottom cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 hover:-rotate-1"
        style={{ height: book.height, width: book.width }}
      >
        {/* spine */}
        <div
          className="relative h-full w-full overflow-hidden rounded-t-[3px] rounded-b-[2px]"
          style={{
            backgroundColor: spineColor,
            boxShadow: "var(--shadow-book), inset 0 0 24px rgba(0,0,0,0.35)",
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.10) 14%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.22) 90%, rgba(0,0,0,0.45) 100%)",
          }}
        >
          {/* gilt bands top */}
          <div className="absolute inset-x-0 top-0 h-2" style={{ background: "rgba(0,0,0,0.35)" }} />
          <div className="absolute inset-x-1 top-3 h-px" style={{ background: "var(--spine-gold)", opacity: 0.55 }} />
          <div className="absolute inset-x-2 top-5 h-px" style={{ background: "var(--spine-gold)", opacity: 0.35 }} />

          {/* gilt bands bottom */}
          <div className="absolute inset-x-2 bottom-5 h-px" style={{ background: "var(--spine-gold)", opacity: 0.35 }} />
          <div className="absolute inset-x-1 bottom-3 h-px" style={{ background: "var(--spine-gold)", opacity: 0.55 }} />
          <div className="absolute inset-x-0 bottom-0 h-2" style={{ background: "rgba(0,0,0,0.4)" }} />

          {/* ornament fleurons */}
          <div
            className="absolute inset-x-0 top-8 text-center text-[10px] leading-none"
            style={{ color: "var(--spine-gold)", opacity: 0.7 }}
            aria-hidden
          >
            ❦
          </div>
          <div
            className="absolute inset-x-0 bottom-8 text-center text-[10px] leading-none"
            style={{ color: "var(--spine-gold)", opacity: 0.7 }}
            aria-hidden
          >
            ❦
          </div>

          {/* title */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: book.textColor }}
          >
            <span
              className="font-semibold tracking-wide whitespace-nowrap"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: Math.min(book.width * 0.3, 15),
                letterSpacing: "0.14em",
                fontFamily,
                textShadow: "0 1px 0 rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.25)",
              }}
            >
              {bionicize(book.title.toUpperCase(), bionic)}
            </span>
          </div>
        </div>

        {editMode && (
          <span className="absolute -top-2 -right-2 rounded-full bg-wood-dark px-2 py-0.5 text-[10px] font-medium text-paper shadow-md">
            remove
          </span>
        )}
      </button>
    </div>
  );
}
