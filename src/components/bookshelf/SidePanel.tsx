import { useEffect, useRef, useState } from "react";
import { BOOKS } from "./books";
import { useSettings, SPINE_FONTS } from "./useSettings";

type ViewMode = "shelf" | "simple";
type Theme = "light" | "dark";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  theme: Theme;
  setTheme: (v: Theme) => void;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  onOpenBook: (id: string) => void;
};

const PANEL_BG = "#2b2b30";
const PANEL_FG = "#e6e3da";
const PANEL_SOFT = "rgba(255,255,255,0.04)";

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md" style={{ backgroundColor: PANEL_SOFT }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
      >
        <span className="font-medium tracking-wide">{title}</span>
        <span className="text-xs opacity-50">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="space-y-3 border-t px-3 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs opacity-80">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider transition"
      style={{
        backgroundColor: active ? PANEL_FG : "transparent",
        color: active ? PANEL_BG : PANEL_FG,
        border: `1px solid ${active ? PANEL_FG : "rgba(255,255,255,0.18)"}`,
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 rounded-full transition"
      style={{ backgroundColor: on ? "#a48a52" : "rgba(255,255,255,0.18)" }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

function ColorSwatchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label
      className="relative inline-block h-6 w-6 cursor-pointer overflow-hidden rounded border"
      style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: value }}
      title="Custom color"
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

export function SidePanel(props: Props) {
  const { open, setOpen, viewMode, setViewMode, theme, setTheme, editMode, setEditMode } = props;
  const s = useSettings();
  const startX = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Swipe to close on the panel + swipe from right edge to open
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX.current = t.clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current == null) return;
      const x = e.changedTouches[0].clientX;
      const dx = x - startX.current;
      const sx = startX.current;
      startX.current = null;
      const w = window.innerWidth;
      if (!open && sx > w - 24 && dx < -40) setOpen(true);
      if (open && dx > 60) setOpen(false);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, setOpen]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open menu"
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg px-2.5 py-3 text-[10px] uppercase tracking-[0.25em] shadow-lg"
        style={{ backgroundColor: PANEL_BG, color: PANEL_FG, writingMode: "vertical-rl" }}
      >
        {open ? "Close" : "Menu"}
      </button>

      <aside
        ref={panelRef}
        className="fixed right-0 top-0 z-40 flex h-full w-[88vw] max-w-sm flex-col overflow-y-auto p-4 shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: PANEL_BG,
          color: PANEL_FG,
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
        }}
        aria-hidden={!open}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] opacity-60">Workshop</p>
            <h2 className="font-serif text-xl">Customize</h2>
          </div>
          <span className="text-[10px] opacity-40">swipe →</span>
        </div>

        <div className="space-y-2">
          <Section title="View" defaultOpen>
            <Row label="Mode">
              <Pill active={viewMode === "shelf"} onClick={() => setViewMode("shelf")}>Shelf</Pill>
              <Pill active={viewMode === "simple"} onClick={() => setViewMode("simple")}>Simple</Pill>
            </Row>
            {viewMode === "shelf" && (
              <Row label="Arrange">
                <Pill active={editMode} onClick={() => setEditMode(!editMode)}>{editMode ? "Done" : "Arrange"}</Pill>
              </Row>
            )}
            <Row label="Talk to me">
              <Toggle on={s.talkToMe} onChange={s.setTalkToMe} />
            </Row>
          </Section>

          <Section title="Lighting">
            <Row label="Mood">
              <Pill active={s.lighting === "dark"} onClick={() => { s.setLighting("dark"); setTheme("dark"); }}>Dark</Pill>
              <Pill active={s.lighting === "amber"} onClick={() => { s.setLighting("amber"); setTheme("light"); }}>Amber</Pill>
              <Pill active={s.lighting === "light"} onClick={() => { s.setLighting("light"); setTheme("light"); }}>Light</Pill>
            </Row>
            <Row label="Custom">
              <Pill active={s.lighting === "custom"} onClick={() => s.setLighting("custom")}>Use</Pill>
              <ColorSwatchInput value={s.lightingCustom} onChange={(v) => { s.setLightingCustom(v); s.setLighting("custom"); }} />
            </Row>
          </Section>

          <Section title="Background">
            <Row label="Base">
              <Pill active={s.bgMode === "white"} onClick={() => s.setBgMode("white")}>White</Pill>
              <Pill active={s.bgMode === "amber"} onClick={() => s.setBgMode("amber")}>Amber</Pill>
              <Pill active={s.bgMode === "dark"} onClick={() => s.setBgMode("dark")}>Dark</Pill>
            </Row>
            <Row label="Custom">
              <Pill active={s.bgMode === "custom"} onClick={() => s.setBgMode("custom")}>Use</Pill>
              <ColorSwatchInput value={s.bgCustom} onChange={(v) => { s.setBgCustom(v); s.setBgMode("custom"); }} />
            </Row>
          </Section>

          <Section title="Text">
            <Row label="Size">
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={s.textSize}
                onChange={(e) => s.setTextSize(parseInt(e.target.value, 10))}
                className="w-32"
              />
              <span className="w-6 text-right text-xs opacity-70">{s.textSize}</span>
            </Row>
            <Row label="Color">
              <Pill active={s.textColorMode === "black"} onClick={() => s.setTextColorMode("black")}>Black</Pill>
              <Pill active={s.textColorMode === "amber"} onClick={() => s.setTextColorMode("amber")}>Amber</Pill>
              <Pill active={s.textColorMode === "white"} onClick={() => s.setTextColorMode("white")}>White</Pill>
            </Row>
            <Row label="Custom">
              <Pill active={s.textColorMode === "custom"} onClick={() => s.setTextColorMode("custom")}>Use</Pill>
              <ColorSwatchInput value={s.textCustom} onChange={(v) => { s.setTextCustom(v); s.setTextColorMode("custom"); }} />
            </Row>
            <Row label="Bionic reading">
              <Toggle on={s.bionic} onChange={s.toggleBionic} />
            </Row>
          </Section>

          <Section title="Atmospheres">
            <p className="text-[11px] opacity-60">Sub-menu coming soon. Current: <em>{s.atmosphere}</em></p>
          </Section>

          <Section title="Language">
            <Row label="Choose">
              <select
                value={s.language}
                onChange={(e) => s.setLanguage(e.target.value)}
                className="rounded-md border bg-transparent px-2 py-1 text-sm"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: PANEL_FG, backgroundColor: PANEL_BG }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </Row>
          </Section>

          <Section title="Tones">
            <p className="text-[11px] opacity-60">Sub-menu coming soon. Current: <em>{s.tone}</em></p>
          </Section>

          <Section title="Fonts">
            <Row label="Spine font">
              <select
                value={s.spineFont}
                onChange={(e) => s.setSpineFont(e.target.value as typeof s.spineFont)}
                className="rounded-md border bg-transparent px-2 py-1 text-sm"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: PANEL_FG, backgroundColor: PANEL_BG }}
              >
                {SPINE_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </Row>
            {s.spineFont === "custom" && (
              <Row label="Custom CSS">
                <input
                  type="text"
                  value={s.customFont}
                  onChange={(e) => s.setCustomFont(e.target.value)}
                  placeholder='"Times New Roman", serif'
                  className="w-44 rounded-md border bg-transparent px-2 py-1 text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.18)", color: PANEL_FG }}
                />
              </Row>
            )}
          </Section>

          <Section title="Mice">
            <Row label="Enable trails">
              <Toggle on={s.mouseTrails} onChange={s.setMouseTrails} />
            </Row>
            <p className="text-[11px] opacity-60">Themed mouse animations coming soon.</p>
          </Section>

          <Section title="Accessibility">
            <p className="text-[11px] opacity-60 mb-2">Open the Accessibility book for full options.</p>
            <Pill active={false} onClick={() => { setOpen(false); props.onOpenBook("accessibility"); }}>Open book</Pill>
          </Section>

          <Section title="Notifications">
            <p className="text-[11px] opacity-60 mb-2">Coming soon.</p>
          </Section>

          <Section title="Social">
            <p className="text-[11px] opacity-60 mb-2">Coming soon.</p>
          </Section>

          <Section title="Books on shelf">
            <Row label="Theme">
              <Pill active={theme === "light"} onClick={() => setTheme("light")}>Light</Pill>
              <Pill active={theme === "dark"} onClick={() => setTheme("dark")}>Dark</Pill>
            </Row>
            <ul className="mt-2 space-y-1.5">
              {BOOKS.map((b) => {
                const hex = (s.colors[b.id] ?? (b.spine.startsWith("#") ? b.spine : "#888888"));
                const isCustom = !!s.colors[b.id];
                return (
                  <li key={b.id} className="flex items-center gap-2 rounded-md px-1.5 py-1" style={{ backgroundColor: PANEL_SOFT }}>
                    <ColorSwatchInput value={hex} onChange={(v) => s.setBookColor(b.id, v)} />
                    <span className="flex-1 truncate text-xs">{b.title}</span>
                    {isCustom && (
                      <button onClick={() => s.setBookColor(b.id, null)} className="text-[10px] opacity-60 hover:opacity-100">reset</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        <p className="mt-6 text-center text-[10px] opacity-40">Swipe right to close</p>
      </aside>
    </>
  );
}
