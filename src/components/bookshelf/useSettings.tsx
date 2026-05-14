import { useEffect, useState } from "react";

export type SpineFont = "fantasy" | "serif" | "sans" | "mono";

const FONT_KEY = "shelf:spineFont";
const BIONIC_KEY = "shelf:bionic";
const COLORS_KEY = "shelf:bookColors";

export const SPINE_FONTS: { id: SpineFont; label: string; css: string }[] = [
  { id: "fantasy", label: "Fantasy (Cinzel)", css: '"Cinzel", "Fraunces", Georgia, serif' },
  { id: "serif", label: "Serif (Fraunces)", css: '"Fraunces", Georgia, serif' },
  { id: "sans", label: "Sans (Inter)", css: '"Inter", system-ui, sans-serif' },
  { id: "mono", label: "Mono", css: 'ui-monospace, "SF Mono", Menlo, monospace' },
];

type Listener = () => void;
const listeners = new Set<Listener>();

let state = {
  spineFont: "fantasy" as SpineFont,
  bionic: false,
  colors: {} as Record<string, string>, // bookId -> color override
};

function load() {
  try {
    const f = localStorage.getItem(FONT_KEY);
    const b = localStorage.getItem(BIONIC_KEY);
    const c = localStorage.getItem(COLORS_KEY);
    if (f === "fantasy" || f === "serif" || f === "sans" || f === "mono") state.spineFont = f;
    if (b === "true") state.bionic = true;
    if (c) state.colors = JSON.parse(c);
  } catch {
    // ignore
  }
}
let loaded = false;

function emit() {
  listeners.forEach((l) => l());
}

export function useSettings() {
  if (!loaded && typeof window !== "undefined") {
    load();
    loaded = true;
  }
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    spineFont: state.spineFont,
    bionic: state.bionic,
    colors: state.colors,
    setSpineFont(f: SpineFont) {
      state = { ...state, spineFont: f };
      try {
        localStorage.setItem(FONT_KEY, f);
      } catch {
        // ignore
      }
      emit();
    },
    cycleSpineFont() {
      const idx = SPINE_FONTS.findIndex((x) => x.id === state.spineFont);
      const next = SPINE_FONTS[(idx + 1) % SPINE_FONTS.length].id;
      this.setSpineFont(next);
    },
    toggleBionic() {
      state = { ...state, bionic: !state.bionic };
      try {
        localStorage.setItem(BIONIC_KEY, String(state.bionic));
      } catch {
        // ignore
      }
      emit();
    },
    setBookColor(id: string, color: string | null) {
      const next = { ...state.colors };
      if (color) next[id] = color;
      else delete next[id];
      state = { ...state, colors: next };
      try {
        localStorage.setItem(COLORS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      emit();
    },
  };
}

export function bionicize(text: string, on: boolean): React.ReactNode {
  if (!on) return text;
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (/^\s+$/.test(part) || part.length === 0) return part;
    const head = part.slice(0, 2).toUpperCase();
    const tail = part.slice(2);
    return (
      <span key={i}>
        <strong>{head}</strong>
        {tail}
      </span>
    );
  });
}
