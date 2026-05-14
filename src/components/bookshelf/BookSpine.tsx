import type { Book } from "./books";

type Props = {
  book: Book;
  onShelf: boolean;
  editMode: boolean;
  onClick: () => void;
  onToggle: () => void;
};

export function BookSpine({ book, onShelf, editMode, onClick, onToggle }: Props) {
  if (!onShelf) {
    return (
      <button
        onClick={onToggle}
        className="group flex h-12 items-center gap-2 rounded-md border border-dashed border-wood/40 bg-paper/50 px-3 text-sm text-ink/70 transition hover:border-wood hover:bg-paper"
      >
        <span
          className="h-6 w-2 rounded-sm"
          style={{ backgroundColor: book.spine }}
          aria-hidden
        />
        <span className="font-serif">{book.title}</span>
        <span className="ml-1 text-xs opacity-60 group-hover:opacity-100">+ shelve</span>
      </button>
    );
  }

  return (
    <div
      className="relative flex items-end"
      style={{ height: 280 }}
    >
      <button
        onClick={editMode ? onToggle : onClick}
        aria-label={book.title}
        className="group relative origin-bottom cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 hover:-rotate-1"
        style={{
          height: book.height,
          width: book.width,
        }}
      >
        {/* spine */}
        <div
          className="relative h-full w-full overflow-hidden rounded-t-[3px] rounded-b-[2px]"
          style={{
            backgroundColor: book.spine,
            boxShadow: "var(--shadow-book)",
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(255,255,255,0.08) 12%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.18) 92%, rgba(0,0,0,0.35) 100%)",
          }}
        >
          {/* top/bottom bands */}
          <div className="absolute inset-x-0 top-0 h-2 bg-black/20" />
          <div className="absolute inset-x-0 top-3 h-px bg-white/15" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-black/25" />
          <div className="absolute inset-x-0 bottom-3 h-px bg-white/15" />

          {/* title */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: book.textColor }}
          >
            <span
              className="font-serif font-semibold tracking-wide whitespace-nowrap"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: Math.min(book.width * 0.32, 16),
                letterSpacing: "0.08em",
              }}
            >
              {book.title}
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
