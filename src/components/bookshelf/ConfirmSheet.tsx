import { useEffect } from "react";
import { useSettings, useViewMode } from "./useSettings";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
  showSimplify?: boolean;
};

export const SHEET_BG = "#2b2b30";
export const SHEET_FG = "#e6e3da";

export function ConfirmSheet({ open, onClose, title, children, maxWidth = 360, showSimplify = true }: Props) {
  const { slapToBasic, expandModes } = useSettings();
  const viewMode = useViewMode();
  const isSimple = viewMode === "simple";
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-2xl p-5 shadow-2xl animate-scale-in"
        style={{ backgroundColor: SHEET_BG, color: SHEET_FG, maxWidth }}
      >
        {title && (
          <p className="mb-4 text-center text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            {title}
          </p>
        )}
        {children}
        {showSimplify && (
          <button
            onClick={() => { if (isSimple) expandModes(); else slapToBasic(); onClose(); }}
            className="mt-4 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
            style={{
              color: SHEET_FG,
              opacity: 0.55,
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "transparent",
            }}
            title={isSimple ? "Re-enable expanded modes everywhere" : "Take everything to simple mode"}
          >
            {isSimple ? "[ EXPANDED MODE NOW ]" : "[ SIMPLE MODE NOW ]"}
          </button>
        )}
      </div>
    </div>
  );
}

export function SheetButton({
  children,
  onClick,
  variant = "ghost",
  full = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost" | "danger";
  full?: boolean;
}) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? { backgroundColor: SHEET_FG, color: SHEET_BG }
      : variant === "danger"
        ? { backgroundColor: "transparent", color: "#f0a0a0", border: "1px solid rgba(240,160,160,0.4)" }
        : { backgroundColor: "transparent", color: SHEET_FG, border: "1px solid rgba(255,255,255,0.18)" };
  return (
    <button onClick={onClick} className={`${base} ${full ? "w-full" : ""}`} style={styles}>
      {children}
    </button>
  );
}
