import { useEffect, useRef, useState } from "react";
import { useSettings, THEME_ORDER, ROMANTIC_COLORS, type ThemeKey } from "./useSettings";

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

function ListRow({
  label,
  right,
  onClick,
}: {
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const Cmp: any = onClick ? "button" : "div";
  return (
    <Cmp
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-1 py-3 text-left"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span className="text-[15px]">{label}</span>
      <span className="text-[13px] opacity-70">{right}</span>
    </Cmp>
  );
}

function ThemeSheet({
  open,
  onClose,
  title,
  current,
  onPick,
  extras,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  current: ThemeKey;
  onPick: (k: ThemeKey) => void;
  extras?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-2xl p-4 shadow-2xl"
        style={{ backgroundColor: PANEL_BG, color: PANEL_FG }}
      >
        <p className="mb-3 text-center text-base" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
          {title}
        </p>
        <ul className="space-y-1">
          {THEME_ORDER.map((t) => {
            const active = current === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => { onPick(t.id); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] transition"
                  style={{
                    backgroundColor: active ? PANEL_FG : "transparent",
                    color: active ? PANEL_BG : PANEL_FG,
                  }}
                >
                  <span>{t.label}</span>
                  {active && <span className="text-xs">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
        {extras}
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full border px-4 py-2 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.18)" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function SidePanel(props: Props) {
  const { open, setOpen, viewMode, setViewMode, theme, setTheme, editMode, setEditMode } = props;
  const s = useSettings();
  const startX = useRef<number | null>(null);

  const [openAtmos, setOpenAtmos] = useState(false);
  const [openTones, setOpenTones] = useState(false);
  const [openMice, setOpenMice] = useState(false);

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

  // Reveal arrow when user slides from edge
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
      // second click while open → hide arrow
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
        className="fixed right-0 top-0 z-40 flex h-full w-[64vw] max-w-[280px] flex-col overflow-y-auto px-4 py-5 shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: PANEL_BG,
          color: PANEL_FG,
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          fontSize: 15,
        }}
        aria-hidden={!open}
      >
        {/* Top three priority buttons */}
        <button
          onClick={() => s.slapToBasic()}
          className="mb-2 w-full rounded-xl py-3 text-base font-semibold tracking-wide"
          style={{ backgroundColor: "#3a3a40", color: PANEL_FG, border: "1px solid rgba(255,255,255,0.1)" }}
        >
          SLAP TO BASIC
        </button>
        <button
          onClick={() => s.shutIt()}
          className="mb-2 w-full rounded-xl py-3 text-base font-semibold tracking-wide"
          style={{ backgroundColor: "#3a3a40", color: PANEL_FG, border: "1px solid rgba(255,255,255,0.1)" }}
        >
          SHUT IT!
        </button>
        <button
          onClick={() => s.setTalkToMe(!s.talkToMe)}
          className="mb-3 w-full rounded-xl py-3 text-base font-semibold tracking-wide"
          style={{
            backgroundColor: s.talkToMe ? PANEL_FG : "#3a3a40",
            color: s.talkToMe ? PANEL_BG : PANEL_FG,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          TALK TO ME {s.talkToMe ? "· on" : ""}
        </button>

        {/* Flat list of individual settings */}
        <ListRow label="View" right={viewMode === "shelf" ? "Shelf" : "Simple"} onClick={() => setViewMode(viewMode === "shelf" ? "simple" : "shelf")} />
        {viewMode === "shelf" && (
          <ListRow label="Arrange shelf" right={editMode ? "On" : "Off"} onClick={() => setEditMode(!editMode)} />
        )}
        <ListRow label="Theme" right={theme === "dark" ? "Dark" : "Light"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />

        <ListRow
          label="Atmosphere"
          right={THEME_ORDER.find((t) => t.id === s.atmosphere)?.label}
          onClick={() => setOpenAtmos(true)}
        />
        <ListRow
          label="Tone"
          right={THEME_ORDER.find((t) => t.id === s.tone)?.label}
          onClick={() => setOpenTones(true)}
        />
        <ListRow
          label="Mice trails"
          right={THEME_ORDER.find((t) => t.id === s.mice)?.label}
          onClick={() => setOpenMice(true)}
        />
        <ListRow
          label="Sound effects"
          right={s.sfxEnabled ? "On" : "Off"}
          onClick={() => s.setSfxEnabled(!s.sfxEnabled)}
        />
        <ListRow
          label="Bionic reading"
          right={s.bionic ? "On" : "Off"}
          onClick={() => s.toggleBionic()}
        />
        <div className="flex items-center justify-between gap-3 px-1 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[15px]">Text size</span>
          <input
            type="range"
            min={12}
            max={24}
            value={s.textSize}
            onChange={(e) => s.setTextSize(parseInt(e.target.value, 10))}
            className="w-24"
          />
        </div>
        <ListRow
          label="Notifications"
          right="Soon"
          onClick={() => {}}
        />
        <ListRow
          label="Social"
          right="Soon"
          onClick={() => {}}
        />
        <ListRow
          label="Accessibility"
          right="Open"
          onClick={() => {
            // Accessibility settings live in their own book — keep panel simple
            setOpen(false);
          }}
        />

        <div className="flex-1" />

        <button
          onClick={() => s.setHideSettingsBook(!s.hideSettingsBook)}
          className="mt-4 w-full rounded-xl py-3 text-sm"
          style={{
            backgroundColor: "transparent",
            color: PANEL_FG,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {s.hideSettingsBook ? "Add Settings book back to library" : "Remove Settings section from library"}
        </button>
      </aside>

      <ThemeSheet
        open={openAtmos}
        onClose={() => setOpenAtmos(false)}
        title="Atmosphere"
        current={s.atmosphere}
        onPick={(k) => s.setAtmosphere(k)}
      />
      <ThemeSheet
        open={openTones}
        onClose={() => setOpenTones(false)}
        title="Tone"
        current={s.tone}
        onPick={(k) => s.setTone(k)}
      />
      <ThemeSheet
        open={openMice}
        onClose={() => setOpenMice(false)}
        title="Mice trails"
        current={s.mice}
        onPick={(k) => s.setMice(k)}
        extras={
          s.mice === "romantic" ? (
            <div className="mt-3">
              <p className="mb-2 text-xs opacity-70">Heart color</p>
              <div className="flex flex-wrap gap-1.5">
                {ROMANTIC_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => s.setRomanticColor(c.hex)}
                    aria-label={c.label}
                    className="h-6 w-6 rounded-full border"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: s.romanticColor === c.hex ? PANEL_FG : "rgba(255,255,255,0.2)",
                      outline: s.romanticColor === c.hex ? `2px solid ${PANEL_FG}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          ) : s.mice === "custom" ? (
            <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              Paste your custom mouse code in the slot below when ready. Optional sound slot appears if Sound effects is on.
              <input
                placeholder="Custom mouse code"
                className="mt-2 w-full rounded border bg-transparent px-2 py-1 text-sm"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: PANEL_FG }}
              />
              {s.sfxEnabled && (
                <input
                  placeholder="Custom sound URL"
                  className="mt-2 w-full rounded border bg-transparent px-2 py-1 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.18)", color: PANEL_FG }}
                />
              )}
            </div>
          ) : null
        }
      />
    </>
  );
}
