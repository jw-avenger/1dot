import { useEffect, useState } from "react";
import { BOOKS } from "./books";
import { BookSpine } from "./BookSpine";
import { BookOpen } from "./BookOpen";
import { SimpleMenu } from "./SimpleMenu";
import { SidePanel } from "./SidePanel";
import { PetPopup } from "./PetPopup";
import { ShelfPet } from "./ShelfPet";
import { ShelfPlant } from "./ShelfPlant";
import { MiceTrails } from "./MiceTrails";
import { TalkToMe } from "./TalkToMe";
import { useShelfState } from "./useShelfState";
import { useSettings, BG_VALUES, TEXT_VALUES, LIGHTING_VALUES } from "./useSettings";

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
  const [petOpen, setPetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useLocalState<ViewMode>("shelf:viewMode", "shelf");
  const [theme, setTheme] = useLocalState<Theme>("shelf:theme", "light");
  const allIds = BOOKS.map((b) => b.id);
  const { onShelf, toggle, reshelveAll } = useShelfState(allIds);
  const settings = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const bg = settings.bgMode === "custom" ? settings.bgCustom : BG_VALUES[settings.bgMode];
    const fg = settings.textColorMode === "custom" ? settings.textCustom : TEXT_VALUES[settings.textColorMode];
    const lamp = settings.lighting === "custom" ? settings.lightingCustom : LIGHTING_VALUES[settings.lighting];
    root.style.setProperty("--background", bg);
    root.style.setProperty("--wall", bg);
    root.style.setProperty("--foreground", fg);
    root.style.setProperty("--ink", fg);
    root.style.setProperty("--lamp-glow", lamp);
    root.style.fontSize = `${settings.textSize}px`;
    return () => {
      root.style.removeProperty("font-size");
    };
  }, [settings.bgMode, settings.bgCustom, settings.textColorMode, settings.textCustom, settings.lighting, settings.lightingCustom, settings.textSize]);

  // Filter out hidden books (e.g. Settings removed from library)
  const visibleBooks = BOOKS.filter((b) => !(settings.hideSettingsBook && b.id === "settings"));

  const handleOpenBook = (id: string) => {
    if (id === "settings") {
      // Mood Settings toggles the slide-out menu
      setPanelOpen(!panelOpen);
      return;
    }
    setOpenId(id);
  };

  const openBook = visibleBooks.find((b) => b.id === openId) ?? null;
  const offShelf = visibleBooks.filter((b) => !onShelf.has(b.id));
  const shelved = visibleBooks.filter((b) => onShelf.has(b.id));
  const showShelfPet = settings.atmosphere !== "basic";

  const panelProps = {
    open: panelOpen,
    setOpen: setPanelOpen,
    viewMode,
    setViewMode,
    theme,
    setTheme,
    editMode,
    setEditMode,
  };

  if (viewMode === "simple") {
    return (
      <div style={{ backgroundColor: "var(--background)" }} className="min-h-screen">
        <header className="px-6 pt-8 md:px-12">
          <p className="font-serif text-lg font-semibold" style={{ color: "var(--foreground)" }}>Library</p>
        </header>
        <SimpleMenu onSelect={handleOpenBook} />
        <SidePanel {...panelProps} />
        <MiceTrails />
        <TalkToMe />
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
      <header className="relative z-10 px-6 pt-8 md:px-12">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--ink)" }}>Library</h1>
      </header>

      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 opacity-70"
        style={{ background: "radial-gradient(ellipse at top, var(--lamp-glow) 0%, transparent 70%)" }}
      />

      <main className="relative z-10 mx-auto mt-10 w-full max-w-5xl px-2 md:mt-16 md:px-12">
        <div className="relative">
          <div
            className="relative flex flex-nowrap items-end justify-center gap-x-0.5 gap-y-3 px-2 pb-2 sm:gap-x-1 sm:px-3"
            style={{ minHeight: 180 }}
          >
            {showShelfPet && (
              <div className="hidden sm:flex shrink-0 self-end">
                <ShelfPlant />
              </div>
            )}
            <div className="flex flex-1 flex-wrap items-end justify-center gap-x-0.5 gap-y-3 sm:gap-x-1">
              {shelved.map((book) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  onShelf
                  editMode={editMode}
                  onClick={() => handleOpenBook(book.id)}
                  onToggle={() => toggle(book.id)}
                />
              ))}
            </div>
            {showShelfPet && (
              <div className="hidden sm:flex shrink-0 self-end">
                <ShelfPet onClick={() => setPetOpen(true)} />
              </div>
            )}
            {shelved.length === 0 && (
              <p className="py-16 font-serif italic" style={{ color: "var(--ink)", opacity: 0.5 }}>
                The shelf is bare. Open the menu to reshelve.
              </p>
            )}
          </div>

          <div
            className="relative h-9 rounded-sm"
            style={{
              background: "linear-gradient(180deg, var(--wood-light) 0%, var(--wood) 40%, var(--wood-dark) 100%)",
              boxShadow: "0 14px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          />
          <div
            className="h-4 rounded-b-sm"
            style={{ background: "linear-gradient(180deg, var(--wood-dark) 0%, oklch(0.22 0.04 40) 100%)" }}
          />
          <div className="absolute -bottom-12 left-6 h-12 w-4 rounded-b-sm" style={{ background: "var(--wood-dark)" }} />
          <div className="absolute -bottom-12 right-6 h-12 w-4 rounded-b-sm" style={{ background: "var(--wood-dark)" }} />
        </div>

        {showShelfPet && (
          <div className="mt-6 flex items-end justify-around gap-6 sm:hidden">
            <ShelfPlant size={36} />
            <ShelfPet onClick={() => setPetOpen(true)} height={110} />
          </div>
        )}

        {editMode && (
          <div className="mt-20 rounded-lg border border-wood/30 bg-paper/60 p-5 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink/60">Off the shelf</p>
              <button
                onClick={reshelveAll}
                disabled={offShelf.length === 0}
                className="rounded-full bg-wood-dark px-4 py-1.5 font-sans text-xs text-paper shadow-sm transition hover:bg-wood disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reshelve all books
              </button>
            </div>
            {offShelf.length === 0 ? (
              <p className="mt-3 font-serif italic text-ink/50">Every book is on the shelf.</p>
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
      </main>

      <SidePanel {...panelProps} />
      <MiceTrails />
      <TalkToMe />
      <PetPopup open={petOpen} onClose={() => setPetOpen(false)} />
      {openBook && <BookOpen book={openBook} onClose={() => setOpenId(null)} />}
    </div>
  );
}
