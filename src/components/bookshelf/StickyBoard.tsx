import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The Sticky Notes display room.
 *
 * A cozy satin pinboard the reader can settle into. Notes are pinned with a
 * tiny brass tack, they can be dragged anywhere, you can draw on top of the
 * board with a stylus or finger, paste in images & links, dictate notes with
 * your voice, or have a note read back to you. The toolbar lives quietly in
 * the top-right so the board stays the centerpiece.
 *
 * `basicMode` strips every atmospheric layer — the satin, the pin shadows,
 * the colored paper — but keeps the same controls and accessibility wiring,
 * because that's the whole point of Simple Mode.
 */

type Note = {
  id: number;
  kind: "text" | "image" | "link";
  text: string;
  src?: string;
  href?: string;
  x: number; // percent
  y: number; // percent
  color: string;
};

type Stroke = { color: string; width: number; pts: { x: number; y: number }[] };

const STORE_KEY = "shelf:sticky-board:v2";
const LEGACY_KEY = "shelf:sticky-notes:v1";

const NOTE_COLORS = ["#fff3a3", "#ffd1dc", "#c9f2d0", "#cde7ff", "#ffe0b0", "#e6d8ff"];
const BOARD_COLORS = [
  { id: "rose", label: "Rose satin", base: "#a83a52", deep: "#6b1c2e" },
  { id: "navy", label: "Navy satin", base: "#2c4570", deep: "#11203d" },
  { id: "forest", label: "Forest satin", base: "#2f5d3f", deep: "#173324" },
  { id: "champagne", label: "Champagne satin", base: "#c9a96a", deep: "#6f5424" },
  { id: "plum", label: "Plum satin", base: "#5a3a6e", deep: "#2c1c39" },
];

type SavedState = {
  notes: Note[];
  strokes: Stroke[];
  boardId: string;
  noteColor: string;
};

function loadInitial(): SavedState {
  if (typeof window === "undefined") {
    return { notes: [], strokes: [], boardId: "rose", noteColor: NOTE_COLORS[0] };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { strokes: [], boardId: "rose", noteColor: NOTE_COLORS[0], ...JSON.parse(raw) };
  } catch {
    /* fall through */
  }
  // Migrate from v1 sticky list if present.
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as Array<{ id: number; text: string; x: number; y: number; color: string }>;
      return {
        notes: arr.map((n) => ({ ...n, kind: "text" as const })),
        strokes: [],
        boardId: "rose",
        noteColor: NOTE_COLORS[0],
      };
    }
  } catch {
    /* ignore */
  }
  return {
    notes: [
      { id: 1, kind: "text", text: "Pin a thought.", x: 12, y: 18, color: NOTE_COLORS[0] },
      { id: 2, kind: "text", text: "Drag me anywhere.", x: 46, y: 30, color: NOTE_COLORS[1] },
      { id: 3, kind: "text", text: "Paste an image or link.", x: 24, y: 56, color: NOTE_COLORS[2] },
    ],
    strokes: [],
    boardId: "rose",
    noteColor: NOTE_COLORS[0],
  };
}

export function StickyBoard({ onClose, basicMode = false }: { onClose: () => void; basicMode?: boolean }) {
  const initial = useMemo(loadInitial, []);
  const [notes, setNotes] = useState<Note[]>(initial.notes);
  const [strokes, setStrokes] = useState<Stroke[]>(initial.strokes);
  const [boardId, setBoardId] = useState<string>(initial.boardId);
  const [noteColor, setNoteColor] = useState<string>(initial.noteColor);
  const [drawing, setDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#1a1a1a");
  const [listening, setListening] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const currentStroke = useRef<Stroke | null>(null);

  const board = BOARD_COLORS.find((b) => b.id === boardId) ?? BOARD_COLORS[0];

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ notes, strokes, boardId, noteColor }));
    } catch {
      /* ignore */
    }
  }, [notes, strokes, boardId, noteColor]);

  // Paste handler — images, urls, plain text
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      // Don't intercept paste inside an actual editable note (let textarea handle it).
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
        x: 12 + (prev.length * 11) % 60,
        y: 14 + (prev.length * 9) % 56,
        color: noteColor,
        ...partial,
      },
    ]);
  };
  const updateNote = (id: number, patch: Partial<Note>) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const removeNote = (id: number) => setNotes((prev) => prev.filter((n) => n.id !== id));

  // Drag handler — one per note via pointer events
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

  // Drawing — pointer events on the canvas overlay
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
    // Force redraw by cloning state
    setStrokes((prev) => [...prev]);
  };
  const onDrawUp = () => {
    if (currentStroke.current && currentStroke.current.pts.length > 1) {
      setStrokes((prev) => [...prev, currentStroke.current as Stroke]);
    }
    currentStroke.current = null;
  };
  const clearDrawing = () => setStrokes([]);

  // Text-to-speech: read a note (or all visible notes if none selected)
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  // Speech-to-text: dictate a new note
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

  const satinBg = basicMode
    ? "#ffffff"
    : `radial-gradient(ellipse 90% 60% at 50% 0%, ${board.base} 0%, ${board.deep} 70%), ` +
      `repeating-linear-gradient(115deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 9px), ` +
      `repeating-linear-gradient(65deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 14px)`;
  const subtleInk = basicMode ? "#222" : "#f6efe2";

  const strokePath = (s: Stroke) =>
    s.pts.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"}${p.x} ${p.y} `, "");

  const liveStroke = currentStroke.current;

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
          background: satinBg,
          borderRadius: basicMode ? 0 : 14,
          border: basicMode ? "none" : "1px solid rgba(0,0,0,0.35)",
          boxShadow: basicMode ? "none" : "0 30px 90px -28px rgba(0,0,0,0.7), inset 0 0 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4">
          <h2 className="font-serif text-xl font-semibold" style={{ color: subtleInk, textShadow: basicMode ? "none" : "0 1px 2px rgba(0,0,0,0.4)" }}>
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
            boardId={boardId}
            onBoard={setBoardId}
          />
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className="relative mx-auto h-[64vh] min-h-[460px] w-full max-w-5xl"
          style={{
            margin: basicMode ? "0 auto" : "0 auto",
            background: basicMode
              ? "transparent"
              : `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(255,255,255,0.04))`,
            borderRadius: basicMode ? 0 : 8,
            boxShadow: basicMode ? "none" : "inset 0 0 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
            cursor: drawing ? "crosshair" : "default",
          }}
          onPointerDown={onDrawDown}
          onPointerMove={onDrawMove}
          onPointerUp={onDrawUp}
          onPointerCancel={onDrawUp}
        >
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
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: -8 }}
                  aria-hidden
                >
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

              {/* Per-note quick actions */}
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                {note.kind === "text" && note.text && (
                  <button
                    onClick={() => speak(note.text)}
                    title="Read aloud"
                    aria-label="Read this note aloud"
                    className="text-xs"
                    style={{ color: basicMode ? "#111" : "#3a2410", opacity: 0.6 }}
                  >
                    ♪
                  </button>
                )}
                <button
                  onClick={() => removeNote(note.id)}
                  aria-label="Remove note"
                  className="text-sm"
                  style={{ color: basicMode ? "#111" : "#3a2410", opacity: 0.55 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {drawing && (
            <p
              className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.22em]"
              style={{ color: subtleInk, opacity: 0.7 }}
            >
              Drawing — tap the pencil again to stop
            </p>
          )}
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
  boardId: string;
  onBoard: (id: string) => void;
}) {
  const [openPicker, setOpenPicker] = useState<null | "note" | "board" | "draw">(null);
  const btn = "font-sans text-[10px] uppercase tracking-[0.22em] transition hover:opacity-100";
  const ink = props.ink;
  return (
    <div className="flex items-center gap-3" style={{ color: ink }}>
      <button className={btn} style={{ opacity: 0.8 }} onClick={props.onAdd}>+ note</button>
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
            style={{ opacity: 0.7 }}
            onClick={() => setOpenPicker(openPicker === "note" ? null : "note")}
          >
            note·
            <span className="inline-block h-2.5 w-2.5 translate-y-[1px] rounded-full align-middle" style={{ background: props.noteColor, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }} />
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
            <span className="inline-block h-2.5 w-2.5 translate-y-[1px] rounded-full align-middle" style={{ background: props.drawColor }} />
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
            style={{ opacity: 0.7 }}
            onClick={() => setOpenPicker(openPicker === "board" ? null : "board")}
          >
            board
          </button>
          {openPicker === "board" && (
            <div className="absolute right-0 top-full z-10 mt-2 flex gap-1.5 rounded-sm border border-black/30 bg-black/60 p-2 backdrop-blur-sm">
              {BOARD_COLORS.map((b) => (
                <button
                  key={b.id}
                  title={b.label}
                  aria-label={b.label}
                  onClick={() => { props.onBoard(b.id); setOpenPicker(null); }}
                  className="h-5 w-5 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${b.base}, ${b.deep})`,
                    boxShadow: props.boardId === b.id ? "0 0 0 2px rgba(255,255,255,0.7)" : "inset 0 0 0 1px rgba(0,0,0,0.4)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
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
