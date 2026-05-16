import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Sticky Notes display room.
 *
 * Layered like a real room:
 *   1. The "wall" — the modal background, painted in a chosen color.
 *   2. An ornate framed satin pinboard hanging on the wall (its own color).
 *   3. The notes themselves, pinned to the satin (their own color too).
 *
 * `basicMode` strips every atmospheric layer (no satin, no frame, no
 * colored paper) but keeps every control and accessibility wire intact.
 */

type Note = {
  id: number;
  kind: "text" | "image" | "link";
  text: string;
  src?: string;
  href?: string;
  x: number; // percent within pinboard
  y: number; // percent within pinboard
  color: string;
};

type Stroke = { color: string; width: number; pts: { x: number; y: number }[] };

const STORE_KEY = "shelf:sticky-board:v3";
const LEGACY_KEY_V2 = "shelf:sticky-board:v2";
const LEGACY_KEY_V1 = "shelf:sticky-notes:v1";

const NOTE_COLORS = ["#fff3a3", "#ffd1dc", "#c9f2d0", "#cde7ff", "#ffe0b0", "#e6d8ff"];

// The "wall" — modal backdrop color (a painted room wall).
const WALL_COLORS = [
  { id: "rose", label: "Rose", base: "#a83a52", deep: "#6b1c2e" },
  { id: "navy", label: "Deep navy", base: "#2c4570", deep: "#11203d" },
  { id: "forest", label: "Forest", base: "#2f5d3f", deep: "#173324" },
  { id: "champagne", label: "Champagne", base: "#c9a96a", deep: "#6f5424" },
  { id: "plum", label: "Plum", base: "#5a3a6e", deep: "#2c1c39" },
  { id: "linen", label: "Linen", base: "#efe5d2", deep: "#b6a385" },
];

// The satin pinboard hanging on the wall — a quilted tufted board with
// brass tacks and a gold ornate frame.
const PIN_COLORS = [
  { id: "blush", label: "Blush satin", base: "#f6c7c1", deep: "#c2746c" },
  { id: "ivory", label: "Ivory satin", base: "#f6ecd3", deep: "#bfa776" },
  { id: "mint", label: "Mint satin", base: "#cfe9d6", deep: "#7aa48a" },
  { id: "sky", label: "Sky satin", base: "#cfe0f0", deep: "#7796b3" },
  { id: "lilac", label: "Lilac satin", base: "#e2d2ef", deep: "#9f86bd" },
  { id: "rose", label: "Rose satin", base: "#e9a0a8", deep: "#a8525c" },
];

type SavedState = {
  notes: Note[];
  strokes: Stroke[];
  wallId: string;
  pinId: string;
  noteColor: string;
};

function loadInitial(): SavedState {
  if (typeof window === "undefined") {
    return { notes: [], strokes: [], wallId: "navy", pinId: "blush", noteColor: NOTE_COLORS[0] };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { strokes: [], wallId: "navy", pinId: "blush", noteColor: NOTE_COLORS[0], ...JSON.parse(raw) };
  } catch {
    /* fall through */
  }
  // Migrate from v2 (boardId was wall)
  try {
    const v2 = localStorage.getItem(LEGACY_KEY_V2);
    if (v2) {
      const p = JSON.parse(v2);
      return {
        notes: p.notes ?? [],
        strokes: p.strokes ?? [],
        wallId: p.boardId ?? "navy",
        pinId: "blush",
        noteColor: p.noteColor ?? NOTE_COLORS[0],
      };
    }
  } catch {
    /* ignore */
  }
  try {
    const legacy = localStorage.getItem(LEGACY_KEY_V1);
    if (legacy) {
      const arr = JSON.parse(legacy) as Array<{ id: number; text: string; x: number; y: number; color: string }>;
      return {
        notes: arr.map((n) => ({ ...n, kind: "text" as const })),
        strokes: [],
        wallId: "navy",
        pinId: "blush",
        noteColor: NOTE_COLORS[0],
      };
    }
  } catch {
    /* ignore */
  }
  return {
    notes: [
      { id: 1, kind: "text", text: "Pin a thought.", x: 10, y: 14, color: NOTE_COLORS[0] },
      { id: 2, kind: "text", text: "Drag me anywhere.", x: 46, y: 28, color: NOTE_COLORS[1] },
      { id: 3, kind: "text", text: "Paste an image or link.", x: 22, y: 54, color: NOTE_COLORS[2] },
    ],
    strokes: [],
    wallId: "navy",
    pinId: "blush",
    noteColor: NOTE_COLORS[0],
  };
}

export function StickyBoard({ onClose, basicMode = false }: { onClose: () => void; basicMode?: boolean }) {
  const initial = useMemo(loadInitial, []);
  const [notes, setNotes] = useState<Note[]>(initial.notes);
  const [strokes, setStrokes] = useState<Stroke[]>(initial.strokes);
  const [wallId, setWallId] = useState<string>(initial.wallId);
  const [pinId, setPinId] = useState<string>(initial.pinId);
  const [noteColor, setNoteColor] = useState<string>(initial.noteColor);
  const [drawing, setDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#1a1a1a");
  const [listening, setListening] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const currentStroke = useRef<Stroke | null>(null);

  const wall = WALL_COLORS.find((b) => b.id === wallId) ?? WALL_COLORS[0];
  const pin = PIN_COLORS.find((b) => b.id === pinId) ?? PIN_COLORS[0];

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ notes, strokes, wallId, pinId, noteColor }));
    } catch {
      /* ignore */
    }
  }, [notes, strokes, wallId, pinId, noteColor]);

  // Paste handler — images, urls, plain text
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const src = String(reader.result || "");
            addNote({ kind: "image", text: "", src });
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          return;
        }
      }
      const text = e.clipboardData.getData("text/plain").trim();
      if (text) {
        const isUrl = /^https?:\/\/\S+$/i.test(text);
        addNote(isUrl ? { kind: "link", text, href: text } : { kind: "text", text });
        e.preventDefault();
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteColor, notes]);

  const addNote = (partial: { kind: Note["kind"]; text: string; src?: string; href?: string }) => {
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        x: 10 + (prev.length * 11) % 60,
        y: 12 + (prev.length * 9) % 56,
        color: noteColor,
        ...partial,
      },
    ]);
  };
  const updateNote = (id: number, patch: Partial<Note>) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const removeNote = (id: number) => setNotes((prev) => prev.filter((n) => n.id !== id));

  // Drag note inside the pinboard
  const startDrag = (e: React.PointerEvent, id: number) => {
    if (drawing) return;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = note.x;
    const origY = note.y;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      updateNote(id, {
        x: Math.max(0, Math.min(92, origX + dx)),
        y: Math.max(0, Math.min(88, origY + dy)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Drawing — pointer events on the pinboard
  const onDrawDown = (e: React.PointerEvent) => {
    if (!drawing) return;
    const rect = boardRef.current!.getBoundingClientRect();
    currentStroke.current = {
      color: drawColor,
      width: e.pointerType === "pen" ? Math.max(1, (e.pressure || 0.5) * 4) : 2,
      pts: [{ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }],
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onDrawMove = (e: React.PointerEvent) => {
    if (!drawing || !currentStroke.current) return;
    const rect = boardRef.current!.getBoundingClientRect();
    currentStroke.current.pts.push({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    setStrokes((prev) => [...prev]);
  };
  const onDrawUp = () => {
    if (currentStroke.current && currentStroke.current.pts.length > 1) {
      setStrokes((prev) => [...prev, currentStroke.current as Stroke]);
    }
    currentStroke.current = null;
  };
  const clearDrawing = () => setStrokes([]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const dictate = () => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      addNote({ kind: "text", text: "Voice input isn't supported in this browser." });
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      if (t) addNote({ kind: "text", text: t });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  // ---- Render helpers ----------------------------------------------------

  const wallBg = basicMode
    ? "#ffffff"
    : `radial-gradient(ellipse 110% 70% at 50% 0%, ${wall.base} 0%, ${wall.deep} 75%), ` +
      `repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 9px)`;

  // The satin pinboard surface — tufted look via radial-gradient pin dots
  // overlaid on the satin color and a soft sheen.
  const pinBg = basicMode
    ? "#ffffff"
    : `radial-gradient(ellipse 80% 60% at 50% 30%, ${pin.base} 0%, ${pin.deep} 100%)`;

  const subtleInk = basicMode ? "#222" : "#f6efe2";

  const strokePath = (s: Stroke) =>
    s.pts.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"}${p.x} ${p.y} `, "");

  const liveStroke = currentStroke.current;

  // Ornate gold frame styles
  const frameBorder = basicMode
    ? "1px solid #ddd"
    : "10px solid transparent";
  const frameImage = basicMode
    ? undefined
    : "linear-gradient(135deg, #f5d27a, #b6852a 30%, #f7e3a1 50%, #8a5e16 70%, #f5d27a)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 animate-fade-in"
      style={{ background: basicMode ? "#ffffff" : "rgba(20,15,15,0.7)", backdropFilter: basicMode ? "none" : "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl overflow-hidden"
        style={{
          minHeight: "min(82vh, 760px)",
          background: wallBg,
          borderRadius: basicMode ? 0 : 14,
          border: basicMode ? "none" : "1px solid rgba(0,0,0,0.35)",
          boxShadow: basicMode ? "none" : "0 30px 90px -28px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-2 px-6 py-4">
          <h2 className="font-serif text-xl font-semibold" style={{ color: subtleInk, textShadow: basicMode ? "none" : "0 1px 2px rgba(0,0,0,0.5)" }}>
            Sticky Notes
          </h2>
          <Toolbar
            basicMode={basicMode}
            ink={subtleInk}
            drawing={drawing}
            listening={listening}
            onAdd={() => addNote({ kind: "text", text: "" })}
            onToggleDraw={() => setDrawing((d) => !d)}
            onClearDraw={clearDrawing}
            onDictate={dictate}
            onSpeak={() => speak(notes.map((n) => n.text || n.href || "").filter(Boolean).join(". "))}
            noteColor={noteColor}
            onNoteColor={setNoteColor}
            drawColor={drawColor}
            onDrawColor={setDrawColor}
            wallId={wallId}
            onWall={setWallId}
            pinId={pinId}
            onPin={setPinId}
          />
        </div>

        {/* Framed satin pinboard */}
        <div
          className="relative mx-auto"
          style={{
            width: "min(92%, 880px)",
            height: "min(64vh, 560px)",
            minHeight: 420,
            margin: "0 auto 36px",
            padding: basicMode ? 0 : 4,
            background: basicMode ? "transparent" : frameImage,
            borderRadius: basicMode ? 0 : 8,
            boxShadow: basicMode ? "none" : "0 24px 50px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          {/* Inner satin board */}
          <div
            ref={boardRef}
            className="relative h-full w-full overflow-hidden"
            style={{
              background: pinBg,
              borderRadius: basicMode ? 0 : 4,
              border: frameBorder,
              borderImage: basicMode ? undefined : `${frameImage} 1`,
              boxShadow: basicMode
                ? "none"
                : `inset 0 0 60px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.18)`,
              cursor: drawing ? "crosshair" : "default",
            }}
            onPointerDown={onDrawDown}
            onPointerMove={onDrawMove}
            onPointerUp={onDrawUp}
            onPointerCancel={onDrawUp}
          >
            {/* Quilted ribbon lattice with brass tacks at intersections */}
            {!basicMode && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`ribbon-${pinId}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
                  </linearGradient>
                </defs>
                {/* diagonals "/" */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line
                    key={`a-${i}`}
                    x1={-20 + i * 16}
                    y1={120}
                    x2={60 + i * 16}
                    y2={-20}
                    stroke={`url(#ribbon-${pinId})`}
                    strokeWidth={0.35}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {/* diagonals "\" */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line
                    key={`b-${i}`}
                    x1={-20 + i * 16}
                    y1={-20}
                    x2={60 + i * 16}
                    y2={120}
                    stroke={`url(#ribbon-${pinId})`}
                    strokeWidth={0.35}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {/* brass tacks at intersections (approximated grid) */}
                {Array.from({ length: 6 }).flatMap((_, r) =>
                  Array.from({ length: 7 }).map((_, c) => (
                    <circle
                      key={`t-${r}-${c}`}
                      cx={(c + 0.5) * (100 / 7)}
                      cy={(r + 0.5) * (100 / 6)}
                      r={0.55}
                      fill="#d6a64a"
                      stroke="#5e3d11"
                      strokeWidth={0.18}
                    />
                  ))
                )}
              </svg>
            )}

            {/* Drawing layer */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {strokes.map((s, i) => (
                <path key={i} d={strokePath(s)} stroke={s.color} strokeWidth={s.width / 4} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              ))}
              {liveStroke && (
                <path d={strokePath(liveStroke)} stroke={liveStroke.color} strokeWidth={liveStroke.width / 4} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              )}
            </svg>

            {/* Notes */}
            {notes.map((note, i) => (
              <div
                key={note.id}
                className="group absolute"
                style={{
                  left: `${note.x}%`,
                  top: `${note.y}%`,
                  width: note.kind === "image" ? 200 : 176,
                  transform: basicMode ? "none" : `rotate(${[-2.4, 1.6, -1, 2.2, -0.8, 1.1][i % 6]}deg)`,
                  background: basicMode ? "#ffffff" : note.color,
                  border: basicMode ? "1px solid #ddd" : "1px solid rgba(58,36,16,0.12)",
                  boxShadow: basicMode ? "none" : "0 16px 26px -16px rgba(0,0,0,0.55)",
                  touchAction: drawing ? "none" : "auto",
                }}
              >
                {/* Pin */}
                {!basicMode && (
                  <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -8 }} aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <defs>
                        <radialGradient id={`pin-${note.id}`} cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#ffe79a" />
                          <stop offset="55%" stopColor="#c98b2a" />
                          <stop offset="100%" stopColor="#5a3a0a" />
                        </radialGradient>
                      </defs>
                      <circle cx="9" cy="9" r="6" fill={`url(#pin-${note.id})`} stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
                      <circle cx="6.5" cy="6.5" r="1.6" fill="rgba(255,255,255,0.7)" />
                    </svg>
                  </div>
                )}

                {/* Drag handle (top strip) */}
                <div
                  className="h-3 w-full"
                  onPointerDown={(e) => startDrag(e, note.id)}
                  style={{ cursor: drawing ? "crosshair" : "grab" }}
                />

                {note.kind === "image" && note.src ? (
                  <div className="px-2 pb-2">
                    <img src={note.src} alt="" className="max-h-44 w-full rounded-sm object-cover" />
                  </div>
                ) : note.kind === "link" && note.href ? (
                  <a
                    href={note.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-words px-3 pb-3 font-serif text-sm underline"
                    style={{ color: basicMode ? "#111" : "#3a2410" }}
                  >
                    {note.text || note.href}
                  </a>
                ) : (
                  <textarea
                    value={note.text}
                    onChange={(e) => updateNote(note.id, { text: e.target.value })}
                    placeholder="Write…"
                    className="min-h-[88px] w-full resize-none bg-transparent px-3 pb-3 font-serif text-sm outline-none"
                    style={{ color: basicMode ? "#111" : "#3a2410" }}
                  />
                )}

                {/* Per-note quick actions — X is always visible */}
                <div className="absolute right-1 top-1 flex items-center gap-1">
                  {note.kind === "text" && note.text && (
                    <button
                      onClick={() => speak(note.text)}
                      title="Read aloud"
                      aria-label="Read this note aloud"
                      className="text-xs opacity-50 transition hover:opacity-100"
                      style={{ color: basicMode ? "#111" : "#3a2410" }}
                    >
                      ♪
                    </button>
                  )}
                  <button
                    onClick={() => removeNote(note.id)}
                    aria-label="Delete note"
                    title="Delete note"
                    className="flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none transition hover:scale-110"
                    style={{
                      color: basicMode ? "#111" : "#3a2410",
                      background: basicMode ? "transparent" : "rgba(255,255,255,0.55)",
                      border: basicMode ? "1px solid #ccc" : "1px solid rgba(58,36,16,0.25)",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {drawing && (
              <p
                className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.22em]"
                style={{ color: basicMode ? "#444" : "#3a2410", opacity: 0.7 }}
              >
                Drawing — tap the pencil again to stop
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Back to library"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 font-serif text-lg"
          style={{ color: subtleInk, opacity: 0.75 }}
        >
          ←
        </button>
      </div>
    </div>
  );
}

/* ---- Toolbar ---------------------------------------------------------- */

function Toolbar(props: {
  basicMode: boolean;
  ink: string;
  drawing: boolean;
  listening: boolean;
  onAdd: () => void;
  onToggleDraw: () => void;
  onClearDraw: () => void;
  onDictate: () => void;
  onSpeak: () => void;
  noteColor: string;
  onNoteColor: (c: string) => void;
  drawColor: string;
  onDrawColor: (c: string) => void;
  wallId: string;
  onWall: (id: string) => void;
  pinId: string;
  onPin: (id: string) => void;
}) {
  const [openPicker, setOpenPicker] = useState<null | "note" | "wall" | "pin" | "draw">(null);
  const btn = "font-sans text-[10px] uppercase tracking-[0.22em] transition hover:opacity-100";
  const ink = props.ink;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2" style={{ color: ink }}>
      <button className={btn} style={{ opacity: 0.85 }} onClick={props.onAdd}>+ note</button>
      <button className={btn} style={{ opacity: props.drawing ? 1 : 0.65 }} onClick={props.onToggleDraw}>
        {props.drawing ? "drawing" : "draw"}
      </button>
      {props.drawing && (
        <button className={btn} style={{ opacity: 0.6 }} onClick={props.onClearDraw}>clear</button>
      )}
      <button className={btn} style={{ opacity: props.listening ? 1 : 0.7 }} onClick={props.onDictate}>
        {props.listening ? "listening…" : "speak"}
      </button>
      <button className={btn} style={{ opacity: 0.7 }} onClick={props.onSpeak}>read</button>

      {!props.basicMode && (
        <div className="relative">
          <button
            className={btn}
            style={{ opacity: 0.75 }}
            onClick={() => setOpenPicker(openPicker === "note" ? null : "note")}
          >
            note·
            <span className="ml-1 inline-block h-2.5 w-2.5 translate-y-[1px] rounded-full align-middle" style={{ background: props.noteColor, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }} />
          </button>
          {openPicker === "note" && (
            <Swatches
              colors={NOTE_COLORS}
              selected={props.noteColor}
              onPick={(c) => { props.onNoteColor(c); setOpenPicker(null); }}
            />
          )}
        </div>
      )}

      {props.drawing && (
        <div className="relative">
          <button
            className={btn}
            style={{ opacity: 0.7 }}
            onClick={() => setOpenPicker(openPicker === "draw" ? null : "draw")}
          >
            ink·
            <span className="ml-1 inline-block h-2.5 w-2.5 translate-y-[1px] rounded-full align-middle" style={{ background: props.drawColor }} />
          </button>
          {openPicker === "draw" && (
            <Swatches
              colors={["#1a1a1a", "#c42b2b", "#1f4ea1", "#1f8a3a", "#c98b2a", "#ffffff"]}
              selected={props.drawColor}
              onPick={(c) => { props.onDrawColor(c); setOpenPicker(null); }}
            />
          )}
        </div>
      )}

      {!props.basicMode && (
        <div className="relative">
          <button
            className={btn}
            style={{ opacity: 0.75 }}
            onClick={() => setOpenPicker(openPicker === "pin" ? null : "pin")}
          >
            board
          </button>
          {openPicker === "pin" && (
            <PalettePicker
              palette={PIN_COLORS}
              selected={props.pinId}
              onPick={(id) => { props.onPin(id); setOpenPicker(null); }}
            />
          )}
        </div>
      )}

      {!props.basicMode && (
        <div className="relative">
          <button
            className={btn}
            style={{ opacity: 0.75 }}
            onClick={() => setOpenPicker(openPicker === "wall" ? null : "wall")}
          >
            wall
          </button>
          {openPicker === "wall" && (
            <PalettePicker
              palette={WALL_COLORS}
              selected={props.wallId}
              onPick={(id) => { props.onWall(id); setOpenPicker(null); }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PalettePicker({
  palette,
  selected,
  onPick,
}: {
  palette: { id: string; label: string; base: string; deep: string }[];
  selected: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="absolute right-0 top-full z-10 mt-2 flex gap-1.5 rounded-sm border border-black/30 bg-black/60 p-2 backdrop-blur-sm">
      {palette.map((b) => (
        <button
          key={b.id}
          title={b.label}
          aria-label={b.label}
          onClick={() => onPick(b.id)}
          className="h-5 w-5 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${b.base}, ${b.deep})`,
            boxShadow: selected === b.id ? "0 0 0 2px rgba(255,255,255,0.7)" : "inset 0 0 0 1px rgba(0,0,0,0.4)",
          }}
        />
      ))}
    </div>
  );
}

function Swatches({ colors, selected, onPick }: { colors: string[]; selected: string; onPick: (c: string) => void }) {
  return (
    <div className="absolute right-0 top-full z-10 mt-2 flex gap-1.5 rounded-sm border border-black/30 bg-black/60 p-2 backdrop-blur-sm">
      {colors.map((c) => (
        <button
          key={c}
          aria-label={`Pick ${c}`}
          onClick={() => onPick(c)}
          className="h-5 w-5 rounded-full"
          style={{
            background: c,
            boxShadow: selected === c ? "0 0 0 2px rgba(255,255,255,0.7)" : "inset 0 0 0 1px rgba(0,0,0,0.3)",
          }}
        />
      ))}
    </div>
  );
}
