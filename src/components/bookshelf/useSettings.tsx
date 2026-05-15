import { useEffect, useState } from "react";

export type SpineFont = "fantasy" | "serif" | "sans" | "mono" | "custom";
export type Lighting = "dark" | "amber" | "light" | "custom";
export type BgMode = "white" | "amber" | "dark" | "custom";
export type TextColorMode = "black" | "amber" | "white" | "custom";

// Canonical theme order — used everywhere atmospheres / tones / mice are listed.
export type ThemeKey =
  | "basic"
  | "cozy"
  | "whimsical"
  | "romantic"
  | "spa"
  | "nature"
  | "paperplanner"
  | "custom";

export const THEME_ORDER: { id: ThemeKey; label: string }[] = [
  { id: "basic", label: "Simple" },
  { id: "cozy", label: "Cozy" },
  { id: "whimsical", label: "Whimsical" },
  { id: "romantic", label: "Romantic" },
  { id: "spa", label: "Spa" },
  { id: "nature", label: "Nature" },
  { id: "paperplanner", label: "Paper Planner" },
  { id: "custom", label: "Custom" },
];

export const ROMANTIC_COLORS: { id: string; label: string; hex: string }[] = [
  { id: "red", label: "Red", hex: "#c42b2b" },
  { id: "hotpink", label: "Hot pink", hex: "#ff4d8d" },
  { id: "lightpink", label: "Light pink", hex: "#f7b8cf" },
  { id: "lightpurple", label: "Light purple", hex: "#c8a8e0" },
  { id: "darkpurple", label: "Dark purple", hex: "#5a2a78" },
  { id: "black", label: "Black", hex: "#111111" },
  { id: "grey", label: "Grey", hex: "#888888" },
];

const KEY = "shelf:settings:v3";

export const SPINE_FONTS: { id: SpineFont; label: string; css: string }[] = [
  { id: "fantasy", label: "Fantasy (Cinzel)", css: '"Cinzel", "Fraunces", Georgia, serif' },
  { id: "serif", label: "Serif (Fraunces)", css: '"Fraunces", Georgia, serif' },
  { id: "sans", label: "Sans (Inter)", css: '"Inter", system-ui, sans-serif' },
  { id: "mono", label: "Mono", css: 'ui-monospace, "SF Mono", Menlo, monospace' },
  { id: "custom", label: "Custom", css: "" },
];

export type PetConfig = {
  pet: string | null; // pet id from PETS
  animations: boolean;
  todoEnabled: boolean;
  todoItems: string[];
  remindersEnabled?: boolean;
};

export const PETS: { id: string; label: string; emoji: string }[] = [
  { id: "cat", label: "Cozy Theme Companion (Cat)", emoji: "🐈" },
  { id: "dog", label: "Romance Theme Companion (Dog)", emoji: "🐕" },
  { id: "dragon", label: "Whimsical Theme Companion (Dragon)", emoji: "🐉" },
  { id: "phoenix", label: "Spa Theme Companion (Phoenix)", emoji: "🦩" },
  { id: "bird", label: "Nature Theme Companion (Bird)", emoji: "🐦" },
  { id: "hamster", label: "Paper Planner Theme Companion (Hamster)", emoji: "🐹" },
];

export type TrashItem = {
  id: string;
  kind: "pet" | "plant";
  label: string;
  data: any;
  deletedAt: number;
};

type State = {
  spineFont: SpineFont;
  customFont: string;
  bionic: boolean;
  colors: Record<string, string>;
  petsConfig: Record<string, PetConfig>;
  talkToMe: boolean;
  lighting: Lighting;
  lightingCustom: string;
  bgMode: BgMode;
  bgCustom: string;
  textSize: number;
  textColorMode: TextColorMode;
  textCustom: string;
  language: string;
  atmosphere: ThemeKey;
  tone: ThemeKey;
  mice: ThemeKey;
  sfxEnabled: boolean;
  romanticColor: string; // hex used for romantic accents
  arrowHidden: boolean; // user clicked the arrow twice to hide it
  hideSettingsBook: boolean; // remove Settings book from library
  petDismissed: boolean; // user said No / deleted pet — hide slot until restored
  plantDismissed: boolean; // hide plant widget until restored
  trash: TrashItem[];
};

const defaults: State = {
  spineFont: "fantasy",
  customFont: "",
  bionic: false,
  colors: {},
  petsConfig: {
    shelf: { pet: "cat", animations: true, todoEnabled: false, todoItems: [] },
  },
  talkToMe: false,
  lighting: "light",
  lightingCustom: "#fff4d6",
  bgMode: "white",
  bgCustom: "#f5efe4",
  textSize: 16,
  textColorMode: "black",
  textCustom: "#222222",
  language: "en",
  atmosphere: "cozy",
  tone: "cozy",
  mice: "basic",
  sfxEnabled: false,
  romanticColor: "#c42b2b",
  arrowHidden: false,
  hideSettingsBook: false,
  petDismissed: false,
  plantDismissed: false,
  trash: [],
};

let state: State = { ...defaults };
let loaded = false;
let history: State[] = [];
const HISTORY_MAX = 30;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function snapshot() {
  history.push(state);
  if (history.length > HISTORY_MAX) history.shift();
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...defaults, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  // One-time restore: bring pet + plant back to their original library spots
  // with their original first-encounter programming (cat figurine populated).
  const RESTORE_KEY = "shelf:trash:restore:v2";
  try {
    if (!localStorage.getItem(RESTORE_KEY)) {
      state = {
        ...state,
        petsConfig: {
          shelf: { pet: "cat", animations: true, todoEnabled: false, todoItems: [] },
        },
        petDismissed: false,
        plantDismissed: false,
        trash: state.trash.filter((t) => t.kind !== "pet" && t.kind !== "plant"),
      };
      save();
      localStorage.setItem(RESTORE_KEY, "1");
    }
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
  snapshot();
  state = { ...state, [key]: value };
  save();
  emit();
}

function patch(p: Partial<State>) {
  snapshot();
  state = { ...state, ...p };
  save();
  emit();
}

function undo() {
  const prev = history.pop();
  if (!prev) return;
  state = prev;
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
    setPetConfig: (id: string, cfg: PetConfig | null) => {
      const next = { ...state.petsConfig };
      if (cfg) next[id] = cfg;
      else delete next[id];
      patch({ petsConfig: next, petDismissed: cfg ? false : state.petDismissed });
    },
    dismissPet: () => patch({ petDismissed: true }),
    deletePet: (id: string) => {
      const existing = state.petsConfig[id];
      const nextPets = { ...state.petsConfig };
      let nextTrash = state.trash;
      // Rule: only one item of each kind may exist across the app + trash.
      // If a pet is already in the trash, don't add another — just remove the
      // active one and mark dismissed.
      const alreadyInTrash = state.trash.some((t) => t.kind === "pet");
      if (existing) {
        delete nextPets[id];
        if (!alreadyInTrash) {
          const petMeta = PETS.find((p) => p.id === existing.pet);
          const trashItem: TrashItem = {
            id: `pet-${id}-${Date.now()}`,
            kind: "pet",
            label: petMeta ? `${petMeta.emoji} ${petMeta.label}` : "Companion",
            data: { slot: id, config: existing },
            deletedAt: Date.now(),
          };
          nextTrash = [trashItem, ...state.trash];
        }
      }
      patch({ petsConfig: nextPets, trash: nextTrash, petDismissed: true });
    },
    restoreTrash: (trashId: string) => {
      const item = state.trash.find((t) => t.id === trashId);
      if (!item) return;
      const nextTrash = state.trash.filter((t) => t.id !== trashId);
      // Restored companions come back already saved as the cozy default
      // (cat). The user can change them anytime, but they persist on the
      // shelf without needing to reopen the popup to confirm.
      if (item.kind === "pet") {
        const nextPets = { ...state.petsConfig };
        const slot = item.data?.slot ?? "shelf";
        nextPets[slot] = {
          pet: "cat",
          animations: true,
          todoEnabled: false,
          todoItems: [],
          remindersEnabled: false,
        };
        patch({
          petsConfig: nextPets,
          trash: nextTrash,
          petDismissed: false,
        });
      } else if (item.kind === "plant") {
        patch({ trash: nextTrash, plantDismissed: false });
      } else {
        patch({ trash: nextTrash });
      }
    },
    clearTrash: () => set("trash", []),
    setTalkToMe: (v: boolean) => set("talkToMe", v),
    setLighting: (v: Lighting) => set("lighting", v),
    setLightingCustom: (v: string) => set("lightingCustom", v),
    setBgMode: (v: BgMode) => set("bgMode", v),
    setBgCustom: (v: string) => set("bgCustom", v),
    setTextSize: (v: number) => set("textSize", v),
    setTextColorMode: (v: TextColorMode) => set("textColorMode", v),
    setTextCustom: (v: string) => set("textCustom", v),
    setLanguage: (v: string) => set("language", v),
    setAtmosphere: (v: ThemeKey) => set("atmosphere", v),
    setTone: (v: ThemeKey) => set("tone", v),
    setMice: (v: ThemeKey) => set("mice", v),
    setSfxEnabled: (v: boolean) => set("sfxEnabled", v),
    setRomanticColor: (v: string) => set("romanticColor", v),
    setArrowHidden: (v: boolean) => set("arrowHidden", v),
    setHideSettingsBook: (v: boolean) => set("hideSettingsBook", v),

    // High-level resets
    slapToBasic: () => {
      patch({
        atmosphere: "basic",
        tone: "basic",
        mice: "basic",
        sfxEnabled: false,
        spineFont: "serif",
        lighting: "light",
        bgMode: "white",
        textColorMode: "black",
        bionic: false,
        talkToMe: false,
      });
      try {
        localStorage.setItem("shelf:viewMode", "simple");
        window.dispatchEvent(new CustomEvent("shelf:viewMode", { detail: "simple" }));
      } catch {
        // ignore
      }
    },
    shutIt: () => patch({ sfxEnabled: false, mice: state.mice }), // sound off only
    undo,
    canUndo: history.length > 0,
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
