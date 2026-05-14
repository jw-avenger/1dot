import { useIsMobile } from "@/hooks/use-mobile";
import type { Book } from "./books";
import { useSettings, resolveSpineFontCss, bionicize, PETS } from "./useSettings";

type Props = {
  book: Book;
  onShelf: boolean;
  editMode: boolean;
  onClick: () => void;
  onToggle: () => void;
  onPetClick: () => void;
};

export function BookSpine({ book, onShelf, editMode, onClick, onToggle, onPetClick }: Props) {
  const isMobile = useIsMobile();
  const { spineFont, customFont, bionic, colors, petsConfig, atmosphere } = useSettings();
  const fontFamily = resolveSpineFontCss(spineFont, customFont);
  const spineColor = colors[book.id] ?? book.spine;
  const cfg = petsConfig[book.id];
  const petEmoji = cfg?.pet ? PETS.find((p) => p.id === cfg.pet)?.emoji : null;

  const scale = isMobile ? 0.62 : 1;
  const w = Math.round(book.width * scale);
  const h = Math.round(book.height * scale);

  const showPetSlot = atmosphere !== "basic";

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
    <div className="relative flex flex-col items-center" style={{ width: w }}>
      {showPetSlot ? (
        <button
          onClick={(e) => { e.stopPropagation(); onPetClick(); }}
          aria-label={petEmoji ? "Change or remove pet" : "Add pet"}
          className="mb-1 flex items-center justify-center rounded-sm leading-none transition hover:bg-paper/30"
          style={{ width: w, height: 22, fontSize: 16 }}
        >
          {petEmoji ? (
            <span>{petEmoji}</span>
          ) : (
            <span className="text-[10px] opacity-30">+</span>
          )}
        </button>
      ) : (
        <div style={{ width: w, height: 6 }} />
      )}

      <button
        onClick={editMode ? onToggle : onClick}
        aria-label={book.title}
        className="group relative origin-bottom cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 hover:-rotate-1"
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

          <div
            className="absolute inset-x-0 top-5 text-center leading-none"
            style={{ color: "var(--spine-gold)", opacity: 0.7, fontSize: 8 }}
            aria-hidden
          >
            ❦
          </div>

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
    </div>
  );
}
