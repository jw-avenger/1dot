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
        {/* Top three priority buttons */}
        <button
          onClick={() => s.slapToBasic()}
          className="mb-1.5 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
          style={{
            color: PANEL_FG,
            opacity: 0.7,
            border: "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "transparent",
          }}
          title="Take everything to simple mode"
        >
          [ SIMPLE MODE NOW ]
        </button>
        <button
          onClick={() => s.shutIt()}
          className="mb-1.5 w-full rounded-lg py-2.5 text-[13px] font-semibold tracking-wide"
          style={{ backgroundColor: "#3a3a40", color: PANEL_FG, border: "1px solid rgba(255,255,255,0.1)" }}
        >
          SHUT IT!
        </button>
        <button
          onClick={() => s.setTalkToMe(!s.talkToMe)}
          className="mb-3 w-full rounded-lg py-2.5 text-[13px] font-semibold tracking-wide"
          style={{
            backgroundColor: s.talkToMe ? PANEL_FG : "#3a3a40",
            color: s.talkToMe ? PANEL_BG : PANEL_FG,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          TALK TO ME{s.talkToMe ? " · on" : ""}
        </button>

        {/* All options visible inline */}
        <Row>
          <Toggle label="Shelf view" on={viewMode === "shelf"} onChange={() => setViewMode(viewMode === "shelf" ? "simple" : "shelf")} />
        </Row>
        {viewMode === "shelf" && (
          <Row>
            <Toggle label="Arrange shelf" on={editMode} onChange={() => setEditMode(!editMode)} />
          </Row>
        )}
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

        <Row>
          <Toggle label="Notifications" on={false} onChange={() => {}} />
          <div className="text-[11px]" style={{ color: DIM }}>soon</div>
        </Row>
        <Row>
          <Toggle label="Social" on={false} onChange={() => {}} />
          <div className="text-[11px]" style={{ color: DIM }}>soon</div>
        </Row>
        <Row>
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between text-left text-[14px]"
          >
            <span>Accessibility</span>
            <span style={{ color: DIM }}>open book</span>
          </button>
        </Row>

        <Row>
          <div className="mb-1.5 flex items-center justify-between">
            <Label>Trash</Label>
            {s.trash.length > 0 && (
              <button
                onClick={() => s.clearTrash()}
                className="text-[10px] uppercase tracking-wider"
                style={{ color: DIM }}
              >
                empty
              </button>
            )}
          </div>
          {s.trash.length === 0 ? (
            <div className="text-[12px] italic" style={{ color: DIM }}>Nothing here.</div>
          ) : (
            <ul className="space-y-1">
              {s.trash.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <span className="truncate text-[12px]">{t.label}</span>
                  <button
                    onClick={() => s.restoreTrash(t.id)}
                    aria-label={`Restore ${t.label}`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[14px]"
                    style={{
                      backgroundColor: PANEL_FG,
                      color: PANEL_BG,
                    }}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Row>

        <div className="flex-1" />

        <button
          onClick={() => s.setHideSettingsBook(!s.hideSettingsBook)}
          className="mt-3 w-full rounded-lg py-2 text-[12px]"
          style={{
            backgroundColor: "transparent",
            color: PANEL_FG,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {s.hideSettingsBook ? "Add Settings book to shelf" : "Remove Settings book from shelf"}
        </button>

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
