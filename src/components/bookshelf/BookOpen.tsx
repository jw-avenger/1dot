import { useEffect, useRef, useState } from "react";
import type { Book, SpaceNode } from "./books";
import { useSettings, SPINE_FONTS, bionicize } from "./useSettings";
import { SUGGESTED } from "./CatFigurine";
import { StickyBoard } from "./StickyBoard";
import { DonateBook } from "./DonateBook";

type Props = {
  book: Book;
  onClose: () => void;
  basicMode?: boolean;
};


export function BookOpen({ book, onClose, basicMode = false }: Props) {
  const {
    spineFont,
    cycleSpineFont,
    bionic,
    toggleBionic,
    trash,
    restoreTrash,
    clearTrash,
    sfxEnabled,
    setSfxEnabled,
    purrsVolume,
    setPurrsVolume,
    sniffsVolume,
    setSniffsVolume,
    petsConfig,
    setPetConfig,
  } = useSettings();
  const [trashOpen, setTrashOpen] = useState(false);
  const [newPetTask, setNewPetTask] = useState("");


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Gentle digital affection: a tiny sparkle drifts up over the companion
    // whenever the reader settles into a book — a quiet "well done, focus".
    try {
      window.dispatchEvent(new CustomEvent("shelf:affection", { detail: { kind: "open-book" } }));
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSettings = book.id === "settings";
  const isDashboard = book.id === "dashboard";
  const isMusic = book.id === "music";
  const isSpaces = book.id === "spaces";
  const isStickyNotes = book.id === "stickynotes";
  const isDonate = book.id === "donate";
  const currentFontLabel = SPINE_FONTS.find((f) => f.id === spineFont)?.label ?? spineFont;
  const purrsOn = purrsVolume > 0;
  const sniffsOn = sniffsVolume > 0;

  const shelfPet = petsConfig["shelf"];
  const petCareItems: string[] =
    shelfPet?.todoItems && shelfPet.todoItems.length > 0
      ? shelfPet.todoItems
      : SUGGESTED;
  const updatePetCare = (next: string[]) => {
    const base =
      shelfPet ?? { pet: null, animations: true, todoEnabled: true, todoItems: [] };
    setPetConfig("shelf", { ...base, todoItems: next });
  };
  const addPetTask = () => {
    const v = newPetTask.trim();
    if (!v) return;
    updatePetCare([...petCareItems, v]);
    setNewPetTask("");
  };
  const removePetTask = (i: number) => {
    updatePetCare(petCareItems.filter((_, idx) => idx !== i));
    try {
      window.dispatchEvent(new CustomEvent("shelf:affection", { detail: { kind: "task-done" } }));
    } catch {
      /* ignore */
    }
  };



  const renderNode = (node: SpaceNode, depth: number, key: string) => (
    <li key={key} className="space-y-2">
      <div
        className="flex items-baseline gap-3 border-b border-dotted border-ink/20 pb-1"
        style={{ paddingLeft: depth * 14 }}
      >
        <span
          className="font-serif text-ink"
          style={{ fontSize: depth === 0 ? 18 : depth === 1 ? 15 : 13 }}
        >
          {bionicize(node.title, bionic)}
        </span>
      </div>
      {node.list === "petcare" && shelfPet?.todoEnabled && (
        <div className="ml-2 space-y-1.5" style={{ paddingLeft: depth * 14 }}>
          {petCareItems.map((item, i) => (
            <div key={`${item}-${i}`} className="flex items-center gap-2">
              <span className="font-serif text-sm text-ink/80">• {bionicize(item, bionic)}</span>
              <button
                onClick={() => removePetTask(i)}
                aria-label={`Remove ${item}`}
                className="ml-auto text-xs text-ink/40 hover:text-ink"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={newPetTask}
              onChange={(e) => setNewPetTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPetTask()}
              placeholder="Add pet care task…"
              className="flex-1 border-b border-ink/15 bg-transparent py-1 font-serif text-sm text-ink placeholder:text-ink/35 focus:border-ink/50 focus:outline-none"
            />
            <button
              onClick={addPetTask}
              className="font-sans text-xs uppercase tracking-wider text-ink/60 hover:text-ink"
            >
              add
            </button>
          </div>
        </div>
      )}
      {node.children && node.children.length > 0 && (
        <ul className="space-y-2">
          {node.children.map((c, i) => renderNode(c, depth + 1, `${key}-${i}`))}
        </ul>
      )}
    </li>
  );

  if (isStickyNotes) {
    return <StickyBoard onClose={onClose} basicMode={basicMode} />;
  }

  const [textScale, setTextScale] = useState(1);
  const pinchRef = useRef<{ baseDist: number; baseScale: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { baseDist: Math.hypot(dx, dy), baseScale: textScale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = Math.max(0.7, Math.min(2.4, pinchRef.current.baseScale * (dist / pinchRef.current.baseDist)));
      setTextScale(next);
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setTextScale((s) => Math.max(0.7, Math.min(2.4, s - e.deltaY * 0.002)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 py-8 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl animate-scale-in"
        style={{ perspective: "2000px" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <div className="absolute -top-3 left-2 z-10 flex items-center gap-1 rounded-full bg-paper/90 px-2 py-1 text-xs text-ink/60 shadow-sm">
          <button aria-label="Shrink text" onClick={() => setTextScale((s) => Math.max(0.7, s - 0.1))} className="px-1 hover:text-ink">A−</button>
          <span className="tabular-nums">{Math.round(textScale * 100)}%</span>
          <button aria-label="Grow text" onClick={() => setTextScale((s) => Math.min(2.4, s + 0.1))} className="px-1 hover:text-ink">A+</button>
        </div>
        <div
          className="relative grid grid-cols-1 overflow-auto rounded-md shadow-2xl md:grid-cols-2"
          style={{
            background: "var(--paper)",
            boxShadow: "var(--shadow-warm), 0 30px 80px -20px rgba(0,0,0,0.5)",
            minHeight: 480,
            maxHeight: "85vh",
            fontSize: `${textScale}em`,
            touchAction: "pan-y pinch-zoom",
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
              <h2
                className="font-serif text-5xl font-semibold leading-tight"
                style={{ color: book.spine }}
              >
                {bionicize(book.title, bionic)}
              </h2>
              <div
                className="mt-6 h-px w-20"
                style={{ backgroundColor: book.spine }}
              />
              {!isDonate && (
                <p className="mt-6 max-w-xs font-serif text-sm italic text-ink/70">
                  {bionicize("A small chapter of your home, opened with care.", bionic)}
                </p>
              )}
            </div>
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
            {isSpaces && book.sections ? (
              <ul className="mt-6 space-y-3">
                {book.sections.map((s, i) => renderNode(s, 0, `s-${i}`))}
              </ul>
            ) : isDonate ? (
              <div className="mt-6"><DonateBook /></div>
            ) : (
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
            )}
            {isSettings && (
              <p className="mt-6 font-sans text-xs italic text-ink/50">
                Tap “Spine font” or “Bionic reading” to change.
              </p>
            )}
            {isDashboard && (
              <div className="mt-8">
                <button
                  onClick={() => setTrashOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md border border-ink/15 px-3 py-2 font-sans text-xs uppercase tracking-[0.25em] text-ink/70 transition hover:border-ink/40 hover:text-ink"
                  aria-expanded={trashOpen}
                >
                  <span>Trash{trash.length > 0 ? ` · ${trash.length}` : ""}</span>
                  <span className="text-ink/50">{trashOpen ? "−" : "+"}</span>
                </button>
                {trashOpen && (
                  <div className="mt-3 animate-fade-in">
                    {trash.length > 0 && (
                      <div className="mb-2 flex justify-end">
                        <button
                          onClick={clearTrash}
                          className="font-sans text-[10px] uppercase tracking-wider text-ink/50 hover:text-ink"
                        >
                          empty
                        </button>
                      </div>
                    )}
                    {trash.length === 0 ? (
                      <p className="font-serif text-sm italic text-ink/50">
                        Nothing here.
                      </p>
                    ) : (
                      <ul className="space-y-2">
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
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={onClose}
                    aria-label="Back to library"
                    className="font-serif text-lg text-ink/70 transition hover:-translate-x-0.5 hover:text-ink"
                  >
                    ←
                  </button>
                </div>
              </div>
            )}
            {isMusic && (
              <div className="mt-8 space-y-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/50">
                  Sound
                </p>

                {/* Sound effects toggle (moved here from settings menu) */}
                <button
                  onClick={() => setSfxEnabled(!sfxEnabled)}
                  className="flex w-full items-center justify-between gap-4 rounded-md border border-ink/15 px-3 py-2 font-serif text-sm text-ink transition hover:border-ink/40"
                  aria-pressed={sfxEnabled}
                >
                  <span>Sound effects</span>
                  <span
                    className="font-sans text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: sfxEnabled ? book.spine : "var(--ink)", opacity: sfxEnabled ? 1 : 0.5 }}
                  >
                    {sfxEnabled ? "On" : "Off"}
                  </span>
                </button>

                {/* Cat purrs — fragile-bar volume slider; auto-off at zero */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="purrs-volume" className="font-serif text-sm text-ink">
                      Cat purrs
                    </label>
                    <span
                      className="font-sans text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: purrsOn ? book.spine : "var(--ink)", opacity: purrsOn ? 1 : 0.5 }}
                    >
                      {purrsOn ? `${Math.round(purrsVolume * 100)}%` : "Off"}
                    </span>
                  </div>
                  {/* Fragile bar: a thin hairline track with a delicate thumb.
                      Slide all the way to the left to turn purrs off. */}
                  <div className="relative h-6">
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
                      style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
                    />
                    <div
                      className="pointer-events-none absolute left-0 top-1/2 h-px -translate-y-1/2 transition-all"
                      style={{
                        width: `${purrsVolume * 100}%`,
                        backgroundColor: purrsOn ? book.spine : "transparent",
                        opacity: purrsOn ? 0.85 : 0,
                      }}
                    />
                    <input
                      id="purrs-volume"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(purrsVolume * 100)}
                      onChange={(e) => setPurrsVolume(Number(e.target.value) / 100)}
                      aria-label="Cat purr volume — drag to zero to turn purrs off"
                      className="purrs-fragile absolute inset-0 w-full appearance-none bg-transparent"
                      style={{ height: "100%" }}
                    />
                    <style>{`
                      .purrs-fragile::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: ${purrsOn ? book.spine : "rgba(0,0,0,0.35)"};
                        border: 1px solid rgba(0,0,0,0.25);
                        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
                        cursor: pointer;
                        margin-top: 0;
                      }
                      .purrs-fragile::-moz-range-thumb {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: ${purrsOn ? book.spine : "rgba(0,0,0,0.35)"};
                        border: 1px solid rgba(0,0,0,0.25);
                        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
                        cursor: pointer;
                      }
                      .purrs-fragile::-webkit-slider-runnable-track {
                        background: transparent;
                        height: 100%;
                      }
                      .purrs-fragile::-moz-range-track {
                        background: transparent;
                        height: 100%;
                      }
                    `}</style>
                  </div>
                  <p className="font-sans text-[10px] italic text-ink/55">
                    {purrsOn
                      ? "Slide to the left edge to silence."
                      : "At zero, purrs are off."}
                  </p>
                </div>

                {/* Dog sniffing — gentle gated WebAudio sniff loop */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="sniffs-volume" className="font-serif text-sm text-ink">
                      Dog sniffing
                    </label>
                    <span
                      className="font-sans text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: sniffsOn ? book.spine : "var(--ink)", opacity: sniffsOn ? 1 : 0.5 }}
                    >
                      {sniffsOn ? `${Math.round(sniffsVolume * 100)}%` : "Off"}
                    </span>
                  </div>
                  <div className="relative h-6">
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
                      style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
                    />
                    <div
                      className="pointer-events-none absolute left-0 top-1/2 h-px -translate-y-1/2 transition-all"
                      style={{
                        width: `${sniffsVolume * 100}%`,
                        backgroundColor: sniffsOn ? book.spine : "transparent",
                        opacity: sniffsOn ? 0.85 : 0,
                      }}
                    />
                    <input
                      id="sniffs-volume"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(sniffsVolume * 100)}
                      onChange={(e) => setSniffsVolume(Number(e.target.value) / 100)}
                      aria-label="Dog sniffing volume — drag to zero to turn off"
                      className="purrs-fragile absolute inset-0 w-full appearance-none bg-transparent"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <p className="font-sans text-[10px] italic text-ink/55">
                    {sniffsOn
                      ? "Soft nose-work — slide left to silence."
                      : "At zero, sniffing is off."}
                  </p>
                </div>
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
