import { useEffect, useState } from "react";

export type SpineFont = "fantasy" | "serif" | "sans" | "mono" | "custom";
export type TriMode<T extends string> = T;
export type Lighting = "dark" | "amber" | "light" | "custom";
export type BgMode = "white" | "amber" | "dark" | "custom";
export type TextColorMode = "black" | "amber" | "white" | "custom";

const KEY = "shelf:settings:v2";

export const SPINE_FONTS: { id: SpineFont; label: string; css: string }[] = [
  { id: "fantasy", label: "Fantasy (Cinzel)", css: '"Cinzel", "Fraunces", Georgia, serif' },
  { id: "serif", label: "Serif (Fraunces)", css: '"Fraunces", Georgia, serif' },
  { id: "sans", label: "Sans (Inter)", css: '"Inter", system-ui, sans-serif' },
  { id: "mono", label: "Mono", css: 'ui-monospace, "SF Mono", Menlo, monospace' },
  { id: "custom", label: "Custom", css: "" },
];

type State = {
  spineFont: SpineFont;
  customFont: string;
  bionic: boolean;
  colors: Record<string, string>;
  pets: Record<string, string>; // bookId -> emoji/text
  talkToMe: boolean;
  lighting: Lighting;
  lightingCustom: string;
  bgMode: BgMode;
  bgCustom: string;
  textSize: number; // px base
  textColorMode: TextColorMode;
  textCustom: string;
  language: string;
  mouseTrails: boolean;
  atmosphere: string;
  tone: string;
  mouse: string;
};

const defaults: State = {
  spineFont: "fantasy",
  customFont: "",
  bionic: false,
  colors: {},
  pets: {},
  talkToMe: false,
  lighting: "light",
  lightingCustom: "#fff4d6",
  bgMode: "white",
  bgCustom: "#f5efe4",
  textSize: 16,
  textColorMode: "black",
  textCustom: "#222222",
  language: "en",
  mouseTrails: false,
  atmosphere: "cozy",
  tone: "warm",
  mouse: "default",
};

let state: State = { ...defaults };
let loaded = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...defaults, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function set<K extends keyof State>(key: K, value: State[K]) {
  state = { ...state, [key]: value };
  save();
  emit();
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
    ...state,
    setSpineFont: (f: SpineFont) => set("spineFont", f),
    setCustomFont: (f: string) => set("customFont", f),
    cycleSpineFont: () => {
      const idx = SPINE_FONTS.findIndex((x) => x.id === state.spineFont);
      set("spineFont", SPINE_FONTS[(idx + 1) % SPINE_FONTS.length].id);
    },
    toggleBionic: () => set("bionic", !state.bionic),
    setBookColor: (id: string, color: string | null) => {
      const next = { ...state.colors };
      if (color) next[id] = color;
      else delete next[id];
      set("colors", next);
    },
    setPet: (id: string, pet: string | null) => {
      const next = { ...state.pets };
      if (pet) next[id] = pet;
      else delete next[id];
      set("pets", next);
    },
    setTalkToMe: (v: boolean) => set("talkToMe", v),
    setLighting: (v: Lighting) => set("lighting", v),
    setLightingCustom: (v: string) => set("lightingCustom", v),
    setBgMode: (v: BgMode) => set("bgMode", v),
    setBgCustom: (v: string) => set("bgCustom", v),
    setTextSize: (v: number) => set("textSize", v),
    setTextColorMode: (v: TextColorMode) => set("textColorMode", v),
    setTextCustom: (v: string) => set("textCustom", v),
    setLanguage: (v: string) => set("language", v),
    setMouseTrails: (v: boolean) => set("mouseTrails", v),
    setAtmosphere: (v: string) => set("atmosphere", v),
    setTone: (v: string) => set("tone", v),
    setMouse: (v: string) => set("mouse", v),
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

export function resolveSpineFontCss(spineFont: SpineFont, customFont: string) {
  if (spineFont === "custom") return customFont || '"Fraunces", Georgia, serif';
  return SPINE_FONTS.find((f) => f.id === spineFont)?.css ?? "";
}

// Map presets to actual values applied to root
export const LIGHTING_VALUES: Record<Lighting, string> = {
  dark: "rgba(40,40,55,0.4)",
  amber: "#f8d28a",
  light: "#fff4d6",
  custom: "",
};
export const BG_VALUES: Record<BgMode, string> = {
  white: "#f7f1e6",
  amber: "#f0d8a8",
  dark: "#1c1a1a",
  custom: "",
};
export const TEXT_VALUES: Record<TextColorMode, string> = {
  black: "#1a1a1a",
  amber: "#7a4f1c",
  white: "#f5efe4",
  custom: "",
};
