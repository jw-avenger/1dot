import { useEffect, useRef } from "react";
import { useSettings, THEME_ORDER, ROMANTIC_COLORS, type ThemeKey, type Lighting, type BgMode, type TextColorMode } from "./useSettings";

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
};

const PANEL_BG = "#2b2b30";
const PANEL_FG = "#e6e3da";
const DIM = "rgba(255,255,255,0.55)";
const LINE = "1px solid rgba(255,255,255,0.06)";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-2.5" style={{ borderBottom: LINE }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] uppercase tracking-wider" style={{ color: DIM }}>
      {children}
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between text-left text-[14px]"
    >
      <span>{label}</span>
      <span style={{ color: on ? PANEL_FG : DIM }}>{on ? "on" : "off"}</span>
    </button>
  );
}

function Dropdown({
  options,
  current,
  onPick,
}: {
  options: { id: string; label: string }[];
  current: string;
  onPick: (id: any) => void;
}) {
  return (
    <select
      value={current}
      onChange={(e) => onPick(e.target.value)}
      className="w-full rounded-md px-2 py-1.5 text-[13px]"
      style={{
        backgroundColor: "#1f1f24",
        color: PANEL_FG,
        border: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id} style={{ backgroundColor: "#1f1f24", color: PANEL_FG }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SidePanel(props: Props) {
  const { open, setOpen, viewMode, setViewMode, theme, setTheme, editMode, setEditMode } = props;
  const s = useSettings();
  const startX = useRef<number | null>(null);

  // Swipe to open from right edge / close panel
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
      if (!open && sx > w - 24 && dx < -40) {
        setOpen(true);
        s.setArrowHidden(false);
      }
      if (open && dx > 60) setOpen(false);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, setOpen, s]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (s.arrowHidden && e.clientX > window.innerWidth - 8) {
        s.setArrowHidden(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [s]);

  const handleArrowClick = () => {
    if (!open) {
      setOpen(true);
    } else {
      setOpen(false);
      s.setArrowHidden(true);
    }
  };

  return (
    <>
      {!s.arrowHidden && (
        <button
          onClick={handleArrowClick}
          aria-label={open ? "Hide menu arrow" : "Open menu"}
          className="fixed right-1 top-1/2 z-40 -translate-y-1/2 rounded-full px-1.5 py-2 text-base opacity-70 transition hover:opacity-100"
          style={{ color: PANEL_FG, backgroundColor: "rgba(43,43,48,0.55)" }}
        >
          {open ? "›" : "‹"}
        </button>
      )}

      <aside
        className="fixed right-0 top-0 z-40 flex h-full w-[56vw] max-w-[240px] flex-col overflow-y-auto px-3 py-4 shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: PANEL_BG,
          color: PANEL_FG,
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: LINE,
          fontSize: 13,
        }}
        aria-hidden={!open}
      >
        {/* Top three priority buttons — all share the SIMPLE-MODE-NOW pill look */}
        <button
          onClick={() => (viewMode === "simple" ? s.expandModes() : s.slapToBasic())}
          className="mb-1.5 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
          style={{
            color: PANEL_FG,
            opacity: 0.7,
            border: "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "transparent",
          }}
          title={viewMode === "simple" ? "Re-enable expanded modes everywhere" : "Take everything to simple mode"}
        >
          {viewMode === "simple" ? "[ EXPANDED MODE NOW ]" : "[ SIMPLE MODE NOW ]"}
        </button>
        <button
          onClick={() => s.shutIt()}
          className="mb-1.5 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
          style={{
            color: PANEL_FG,
            opacity: 0.7,
            border: "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "transparent",
          }}
          title="Silence sound effects"
        >
          [ SHUT IT! ]
        </button>
        <button
          onClick={() => s.setTalkToMe(!s.talkToMe)}
          className="mb-3 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
          style={{
            color: PANEL_FG,
            opacity: s.talkToMe ? 1 : 0.7,
            border: s.talkToMe ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "transparent",
          }}
          title="Toggle Talk to Me"
        >
          [ TALK TO ME{s.talkToMe ? " · ON" : ""} ]
        </button>
        <button
          onClick={() => s.togglePersistMode()}
          className="mb-3 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
          style={{
            color: PANEL_FG,
            opacity: s.persistMode === "24h" ? 1 : 0.7,
            border: s.persistMode === "24h" ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "transparent",
          }}
          title={
            s.persistMode === "24h"
              ? "Settings will reset to defaults after 24h of no changes. Tap to save indefinitely."
              : "Settings are saved indefinitely. Tap to switch to 24h default mode."
          }
        >
          {s.persistMode === "24h" ? "[ 24H DEFAULT · ON ]" : "[ SAVE INDEFINITELY ]"}
        </button>

        {/* Expanded/Simple mode toggle is unified into the top [ SIMPLE MODE NOW ] / [ EXPANDED MODE NOW ] button above. */}
        <Row>
          <Toggle label="Dark theme" on={theme === "dark"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
        </Row>
        {/* Sound effects controls have moved to the Music book — open it
            from the shelf to toggle SFX and adjust the cat-purr volume. */}
        <Row>
          <Toggle label="Bionic reading" on={s.bionic} onChange={() => s.toggleBionic()} />
        </Row>

        <Row>
          <Label>Atmosphere</Label>
          <Dropdown options={THEME_ORDER} current={s.atmosphere} onPick={(v: ThemeKey) => s.setAtmosphere(v)} />
        </Row>
        <Row>
          <Label>Tone</Label>
          <Dropdown options={THEME_ORDER} current={s.tone} onPick={(v: ThemeKey) => s.setTone(v)} />
        </Row>
        <Row>
          <Label>Mice trails</Label>
          <Dropdown options={THEME_ORDER} current={s.mice} onPick={(v: ThemeKey) => s.setMice(v)} />
          {s.mice === "romantic" && (
            <div className="mt-2 flex flex-wrap gap-1">
              {ROMANTIC_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => s.setRomanticColor(c.hex)}
                  aria-label={c.label}
                  className="h-5 w-5 rounded-full"
                  style={{
                    backgroundColor: c.hex,
                    border: s.romanticColor === c.hex ? `2px solid ${PANEL_FG}` : "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          )}
        </Row>

        <Row>
          <Label>Lighting</Label>
          <Dropdown
            options={[
              { id: "light", label: "Light" },
              { id: "amber", label: "Amber" },
              { id: "dark", label: "Dark" },
              { id: "custom", label: "Custom" },
            ]}
            current={s.lighting}
            onPick={(v: Lighting) => s.setLighting(v)}
          />
          {s.lighting === "custom" && (
            <input
              type="color"
              value={s.lightingCustom}
              onChange={(e) => s.setLightingCustom(e.target.value)}
              className="mt-1.5 h-7 w-full rounded"
            />
          )}
        </Row>
        <Row>
          <Label>Background color</Label>
          <Dropdown
            options={[
              { id: "white", label: "Paper" },
              { id: "amber", label: "Amber" },
              { id: "dark", label: "Dark" },
              { id: "custom", label: "Custom" },
            ]}
            current={s.bgMode}
            onPick={(v: BgMode) => s.setBgMode(v)}
          />
          {s.bgMode === "custom" && (
            <input
              type="color"
              value={s.bgCustom}
              onChange={(e) => s.setBgCustom(e.target.value)}
              className="mt-1.5 h-7 w-full rounded"
            />
          )}
          {s.bgMode === "custom" && (
            <div className="mt-2 space-y-1.5">
              <Label>Wallpaper image (optional)</Label>
              <div className="flex items-center gap-1.5">
                <label
                  className="flex-1 cursor-pointer truncate rounded-md px-2 py-1.5 text-center text-[11px]"
                  style={{
                    backgroundColor: "#1f1f24",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  {s.bgImage ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => {
                        const v = typeof r.result === "string" ? r.result : null;
                        if (v) s.setBgImage(v);
                      };
                      r.readAsDataURL(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {s.bgImage && (
                  <button
                    onClick={() => s.setBgImage(null)}
                    className="rounded-md px-2 py-1.5 text-[11px]"
                    style={{ backgroundColor: "#1f1f24", border: "1px solid rgba(255,255,255,0.14)" }}
                    title="Remove wallpaper"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                type="url"
                placeholder="…or paste image URL"
                defaultValue={s.bgImage && s.bgImage.startsWith("http") ? s.bgImage : ""}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && /^https?:\/\//.test(v)) s.setBgImage(v);
                }}
                className="w-full rounded-md px-2 py-1.5 text-[11px]"
                style={{ backgroundColor: "#1f1f24", color: PANEL_FG, border: "1px solid rgba(255,255,255,0.14)" }}
              />
            </div>
          )}
        </Row>
        <Row>
          <Label>Shelf color</Label>
          <Dropdown
            options={[
              { id: "default", label: theme === "dark" ? "Dark (default)" : "Light (default)" },
              { id: "custom", label: "Custom" },
            ]}
            current={s.shelfColor ? "custom" : "default"}
            onPick={(v: string) => {
              if (v === "default") s.setShelfColor(null);
              else s.setShelfColor(s.shelfColor ?? "#6b4423");
            }}
          />
          {s.shelfColor && (
            <input
              type="color"
              value={s.shelfColor}
              onChange={(e) => s.setShelfColor(e.target.value)}
              className="mt-1.5 h-7 w-full rounded"
            />
          )}
        </Row>
        <Row>
          <Label>Text color</Label>
          <Dropdown
            options={[
              { id: "black", label: "Ink" },
              { id: "amber", label: "Amber" },
              { id: "white", label: "Cream" },
              { id: "custom", label: "Custom" },
            ]}
            current={s.textColorMode}
            onPick={(v: TextColorMode) => s.setTextColorMode(v)}
          />
          {s.textColorMode === "custom" && (
            <input
              type="color"
              value={s.textCustom}
              onChange={(e) => s.setTextCustom(e.target.value)}
              className="mt-1.5 h-7 w-full rounded"
            />
          )}
        </Row>

        <Row>
          <div className="flex items-center justify-between">
            <span className="text-[14px]">Text size</span>
            <span className="text-[12px]" style={{ color: DIM }}>{s.textSize}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            value={s.textSize}
            onChange={(e) => s.setTextSize(parseInt(e.target.value, 10))}
            className="mt-1.5 w-full"
          />
        </Row>

        {/* Notifications and Social now live as their own books on the shelf —
            see books.ts. The old placeholder rows have been removed. */}

        <div className="flex-1" />

        {viewMode === "shelf" && (
          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-3 w-full rounded-lg py-2 text-[12px]"
            style={{
              backgroundColor: "transparent",
              color: PANEL_FG,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {editMode ? "Done arranging shelf" : "Arrange shelf"}
          </button>
        )}

        <div className="mt-3 flex items-center gap-1.5">
          <button
            onClick={() => s.setHideSettingsBook(!s.hideSettingsBook)}
            className="flex-1 rounded-lg py-2 text-[12px]"
            style={{
              backgroundColor: "transparent",
              color: PANEL_FG,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {s.hideSettingsBook ? "Replace Settings book on shelf" : "Remove Settings book from shelf"}
          </button>
          {s.hideSettingsBook && (
            <button
              onClick={() => s.trashSettingsBook()}
              aria-label="Send Settings book to trash"
              title="Send Settings book to trash — restore from Dashboard › Trash"
              className="rounded-lg px-2 py-2 text-[12px]"
              style={{
                backgroundColor: "transparent",
                color: DIM,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => s.undo()}
          disabled={!s.canUndo}
          className="mt-1.5 w-full rounded-lg py-2 text-[12px]"
          style={{
            backgroundColor: "transparent",
            color: s.canUndo ? PANEL_FG : DIM,
            border: "1px solid rgba(255,255,255,0.12)",
            opacity: s.canUndo ? 1 : 0.5,
          }}
        >
          ↶ Undo last change
        </button>
      </aside>
    </>
  );
}
