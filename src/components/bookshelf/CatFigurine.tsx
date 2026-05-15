/**
 * Companion bundle — the entire animal-companion feature lives in this single
 * file so it can be deleted and restored as one cohesive unit. Internal
 * identifiers (CatFigurine, PetFigurine, ShelfPet, PetPopup, PETS, PetConfig,
 * petsConfig, petDismissed, deletePet) intentionally keep the legacy "pet"
 * naming so the restoration anchor stays stable across renames; user-facing
 * copy says "Companion".
 *
 * Exports:
 *   • CatFigurine   – high-fidelity SVG cat (the cozy default companion)
 *   • PetFigurine   – generic CSS figurines for the other companion species
 *                     (dog, dragon, phoenix, bird, hamster)
 *   • ShelfPet      – the shelf widget slot. Renders the chosen companion or
 *                     a hatched empty placeholder, with a hover × to remove.
 *   • PetPopup      – the two-phase configuration window:
 *                       phase "ask"      — "Would you like to visit with an
 *                                          animal companion today?" with
 *                                          Yes | No, a SIMPLE MODE NOW
 *                                          escape hatch, and ← / → arrows.
 *                       phase "configure" — Choose Companion? title, the
 *                                          ▲ label ▼ stepper across PETS,
 *                                          three "Enable …" toggles
 *                                          (animations, starter list,
 *                                          gentle reminders), Save for now?,
 *                                          a Yes | No try-it-out row, and
 *                                          ← / → arrows. All controls are
 *                                          borderless Fraunces text;
 *                                          checked toggles get a subtle
 *                                          text-only highlight.
 *
 * Restoration contract: state lives in useSettings (PETS, petsConfig,
 * petDismissed, deletePet/restoreTrash, and the optional remindersEnabled
 * field on PetConfig). deletePet moves the active companion into the shared
 * trash with a clean "🐈 Cozy Theme Companion (Cat)"-style label; the
 * "Restore" path returns the companion to its first-encounter state
 * (cat selected, animations on, list off, reminders off). As long as this
 * file exists and its exports are imported wherever needed, the widget
 * reliably comes back without losing wiring.
 */


import { useEffect, useState } from "react";
import { ConfirmSheet, SheetButton, SHEET_FG } from "./ConfirmSheet";
import { PETS, useSettings, type PetConfig } from "./useSettings";

/* ========================================================================
   CatFigurine — high-fidelity SVG cat
   ======================================================================== */

type CatProps = {
  /** Render size in px. SVG scales cleanly to any size. */
  size?: number;
  /** When true, the cat is rigged with idle animations (breathing, tail sway,
   *  ear twitch, blinks, pupil darts, paw tap, whisker quiver). */
  animated?: boolean;
};

/* Per-instance id suffix so multiple cats on the same page can each carry
   their own <style> scope without colliding. */
let __catUid = 0;

export function CatFigurine({ size = 96, animated = true }: CatProps) {
  const w = size;
  const h = (size * 140) / 200;
  // stable per-instance id (kept across renders via useState lazy init)
  const [uid] = useState(() => ++__catUid);
  const ns = `cf${uid}`;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 140"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${ns}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c98a" />
          <stop offset="35%" stopColor="#e3a158" />
          <stop offset="75%" stopColor="#b3712f" />
          <stop offset="100%" stopColor="#6e3f15" />
        </linearGradient>
        <linearGradient id={`${ns}-cream`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe7c4" stopOpacity="0" />
          <stop offset="100%" stopColor="#fbe7c4" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`${ns}-ear`} cx="50%" cy="70%" r="65%">
          <stop offset="0%" stopColor="#f0a6ad" />
          <stop offset="100%" stopColor="#7a3a3d" />
        </radialGradient>
        <radialGradient id={`${ns}-eye`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cfe89a" />
          <stop offset="60%" stopColor="#7aa84a" />
          <stop offset="100%" stopColor="#2c5018" />
        </radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <linearGradient id={`${ns}-stripe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a2f10" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5a2f10" stopOpacity="0" />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          .${ns}-rig * { transform-box: view-box; }
          /* breathing — subtle vertical scale around mid-body */
          .${ns}-breath { transform-origin: 117px 108px; animation: ${ns}-breath 4.2s ease-in-out infinite; }
          @keyframes ${ns}-breath {
            0%,100% { transform: scaleY(1) translateY(0); }
            50%     { transform: scaleY(1.025) translateY(-0.6px); }
          }
          /* shadow pulses with breath */
          .${ns}-shadow { transform-origin: 105px 128px; animation: ${ns}-shadowp 4.2s ease-in-out infinite; }
          @keyframes ${ns}-shadowp {
            0%,100% { transform: scaleX(1); opacity: 0.32; }
            50%     { transform: scaleX(0.96); opacity: 0.28; }
          }
          /* tail — slow S-sway from base */
          .${ns}-tail { transform-origin: 162px 92px; animation: ${ns}-tail 3.6s ease-in-out infinite; }
          @keyframes ${ns}-tail {
            0%,100% { transform: rotate(-6deg); }
            50%     { transform: rotate(10deg); }
          }
          /* head — gentle bob + tilt, syncs with breath */
          .${ns}-head { transform-origin: 50px 78px; animation: ${ns}-head 6.4s ease-in-out infinite; }
          @keyframes ${ns}-head {
            0%,100% { transform: rotate(-2deg) translateY(0); }
            35%     { transform: rotate(1.5deg) translateY(-0.8px); }
            65%     { transform: rotate(2.5deg) translateY(-0.4px); }
          }
          /* ears — occasional independent twitch */
          .${ns}-earL { transform-origin: 36px 44px; animation: ${ns}-earL 7.3s ease-in-out infinite; }
          .${ns}-earR { transform-origin: 64px 44px; animation: ${ns}-earR 9.1s ease-in-out infinite; }
          @keyframes ${ns}-earL {
            0%, 88%, 100% { transform: rotate(0); }
            91% { transform: rotate(-9deg); }
            94% { transform: rotate(3deg); }
            97% { transform: rotate(0); }
          }
          @keyframes ${ns}-earR {
            0%, 70%, 100% { transform: rotate(0); }
            73% { transform: rotate(8deg); }
            76% { transform: rotate(-2deg); }
            79% { transform: rotate(0); }
          }
          /* blink — eyelids drop fast, hold a beat, lift */
          .${ns}-lid { transform-origin: 50px 62px; transform: scaleY(0); animation: ${ns}-blink 5.7s ease-in-out infinite; }
          @keyframes ${ns}-blink {
            0%, 92%, 100% { transform: scaleY(0); }
            94% { transform: scaleY(1); }
            96% { transform: scaleY(1); }
            98% { transform: scaleY(0); }
          }
          /* pupils — slow side-to-side dart */
          .${ns}-pupils { animation: ${ns}-look 8.2s ease-in-out infinite; }
          @keyframes ${ns}-look {
            0%, 20%, 100% { transform: translateX(0); }
            30%, 45%      { transform: translateX(1.2px); }
            55%, 70%      { transform: translateX(-1.2px); }
            80%           { transform: translateX(0); }
          }
          /* front-left paw tap */
          .${ns}-pawFL { transform-origin: 81px 102px; animation: ${ns}-paw 5.1s ease-in-out infinite; }
          @keyframes ${ns}-paw {
            0%, 60%, 100% { transform: rotate(0) translateY(0); }
            68% { transform: rotate(-4deg) translateY(-1.5px); }
            76% { transform: rotate(2deg)  translateY(0.5px); }
            84% { transform: rotate(0)     translateY(0); }
          }
          /* whiskers — gentle quiver */
          .${ns}-whisk { transform-origin: 50px 78px; animation: ${ns}-whisk 4.8s ease-in-out infinite; }
          @keyframes ${ns}-whisk {
            0%,100% { transform: rotate(0); }
            50%     { transform: rotate(0.6deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .${ns}-breath, .${ns}-shadow, .${ns}-tail, .${ns}-head,
            .${ns}-earL, .${ns}-earR, .${ns}-lid, .${ns}-pupils,
            .${ns}-pawFL, .${ns}-whisk { animation: none; }
          }
        `}</style>
      )}

      <g className={animated ? `${ns}-rig` : undefined}>
        {/* ground shadow */}
        <ellipse
          className={animated ? `${ns}-shadow` : undefined}
          cx="105" cy="128" rx="70" ry="3.5"
          fill="rgba(0,0,0,0.32)" filter={`url(#${ns}-blur)`}
        />

        {/* tail — sways from base */}
        <g className={animated ? `${ns}-tail` : undefined}>
          <path
            d="M 168 96 C 184 84, 190 60, 178 42 C 170 30, 158 36, 162 48 C 166 58, 168 70, 160 76"
            fill="none"
            stroke={`url(#${ns}-fur)`}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="174" cy="38" r="5.2" fill="#a5621f" />
          <path
            d="M 170 92 C 184 80, 188 60, 178 44"
            fill="none"
            stroke="rgba(255,225,180,0.32)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* body — breathes */}
        <g className={animated ? `${ns}-breath` : undefined}>
          <path
            d="M 60 96 C 50 92, 48 82, 56 74 C 62 68, 72 66, 86 66 L 150 66 C 166 66, 174 76, 174 90 C 174 104, 168 110, 156 110 L 70 110 C 58 110, 56 104, 60 96 Z"
            fill={`url(#${ns}-fur)`}
          />
          <path
            d="M 70 100 C 90 112, 150 112, 168 100 C 162 110, 80 110, 70 100 Z"
            fill={`url(#${ns}-cream)`}
          />
          <ellipse cx="78" cy="80" rx="14" ry="8" fill="rgba(255,235,200,0.25)" />
          <ellipse cx="155" cy="78" rx="16" ry="9" fill="rgba(255,235,200,0.18)" />

          <g fill={`url(#${ns}-stripe)`} opacity="0.65">
            <path d="M 92 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
            <path d="M 106 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
            <path d="M 120 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
            <path d="M 134 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
            <path d="M 148 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
          </g>
          <g stroke="#6b3a16" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.45">
            <path d="M 96 76 C 97 84, 97 92, 96 100" />
            <path d="M 110 76 C 111 84, 111 92, 110 100" />
            <path d="M 124 76 C 125 84, 125 92, 124 100" />
            <path d="M 138 76 C 139 84, 139 92, 138 100" />
            <path d="M 152 78 C 153 94, 153 94, 152 102" />
          </g>
        </g>

        {/* back legs (static) */}
        <path d="M 64 102 C 62 118, 62 124, 66 128 L 76 128 C 78 124, 78 116, 76 102 Z" fill={`url(#${ns}-fur)`} />
        <path d="M 156 102 C 155 116, 154 122, 158 126 L 166 126 C 168 122, 168 114, 167 102 Z" fill="#a06a2c" />
        <path
          d="M 142 100 C 138 112, 138 122, 144 128 L 156 128 C 160 122, 160 112, 156 100 Z"
          fill={`url(#${ns}-fur)`}
        />
        <ellipse cx="71" cy="128" rx="6" ry="2" fill="#3a1d0a" />
        <ellipse cx="150" cy="128" rx="6.5" ry="2" fill="#3a1d0a" />
        <ellipse cx="162" cy="126" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />

        {/* front-left paw — taps */}
        <g className={animated ? `${ns}-pawFL` : undefined}>
          <path d="M 76 102 C 75 116, 75 122, 78 126 L 86 126 C 88 122, 88 114, 87 102 Z" fill="#a06a2c" />
          <ellipse cx="82" cy="126" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />
        </g>

        {/* head — bobs and tilts */}
        <g className={animated ? `${ns}-head` : undefined}>
          {/* ears */}
          <g className={animated ? `${ns}-earL` : undefined}>
            <path d="M 24 50 L 30 22 L 46 44 Z" fill={`url(#${ns}-fur)`} />
            <path d="M 30 46 L 32 30 L 42 44 Z" fill={`url(#${ns}-ear)`} />
          </g>
          <g className={animated ? `${ns}-earR` : undefined}>
            <path d="M 76 50 L 70 22 L 54 44 Z" fill={`url(#${ns}-fur)`} />
            <path d="M 70 46 L 68 30 L 58 44 Z" fill={`url(#${ns}-ear)`} />
          </g>

          <ellipse cx="50" cy="62" rx="28" ry="24" fill={`url(#${ns}-fur)`} />

          <g stroke="#6b3a16" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6">
            <path d="M 40 44 C 42 50, 44 54, 46 58" />
            <path d="M 50 42 C 50 48, 50 54, 50 58" />
            <path d="M 60 44 C 58 50, 56 54, 54 58" />
          </g>

          <ellipse cx="50" cy="74" rx="16" ry="10" fill="#fbe7c4" opacity="0.85" />
          <ellipse cx="50" cy="80" rx="9" ry="4" fill="#fff3da" opacity="0.7" />

          {/* eyes — sclera + darting pupils + blink lids */}
          <ellipse cx="40" cy="62" rx="4.2" ry="5" fill={`url(#${ns}-eye)`} />
          <ellipse cx="60" cy="62" rx="4.2" ry="5" fill={`url(#${ns}-eye)`} />
          <g className={animated ? `${ns}-pupils` : undefined}>
            <ellipse cx="40" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
            <ellipse cx="60" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
            <circle cx="41.4" cy="60" r="1" fill="#ffffff" />
            <circle cx="61.4" cy="60" r="1" fill="#ffffff" />
          </g>
          <ellipse cx="40" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />
          <ellipse cx="60" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />
          {/* eyelids — scaleY blink */}
          <g className={animated ? `${ns}-lid` : undefined} fill={`url(#${ns}-fur)`}>
            <ellipse cx="40" cy="62" rx="4.4" ry="5.2" />
            <ellipse cx="60" cy="62" rx="4.4" ry="5.2" />
          </g>

          {/* nose + mouth */}
          <path d="M 46 72 L 54 72 L 50 76 Z" fill="#7a3a2a" />
          <path d="M 46 72 L 54 72 L 50 76 Z" fill="none" stroke="#3a1d0a" strokeWidth="0.5" />
          <path d="M 50 76 L 50 79" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M 50 79 C 48 81, 45 81, 43.5 79.5" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M 50 79 C 52 81, 55 81, 56.5 79.5" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />

          {/* whiskers — quiver */}
          <g className={animated ? `${ns}-whisk` : undefined}
             stroke="#3a1d0a" strokeWidth="0.6" strokeLinecap="round" opacity="0.75" fill="none">
            <path d="M 42 76 C 30 76, 22 74, 14 72" />
            <path d="M 42 78 C 30 80, 22 82, 14 84" />
            <path d="M 58 76 C 70 76, 78 74, 86 72" />
            <path d="M 58 78 C 70 80, 78 82, 86 84" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ========================================================================
   PetFigurine — generic CSS figurines for non-cat pets
   ======================================================================== */

type PetStyle = { body: string; head: string; accent: string };

const STYLES: Record<string, PetStyle> = {
  dog: { body: "linear-gradient(160deg,#f3a3b3,#b7445e)", head: "#f8c4cf", accent: "#5a1a2a" },
  dragon: { body: "linear-gradient(160deg,#7fd3b7,#1f7a5e)", head: "#a8e8d0", accent: "#0e3a2c" },
  phoenix: { body: "linear-gradient(160deg,#f7c2b0,#c95f4a)", head: "#fbd9cc", accent: "#5e1f12" },
  bird: { body: "linear-gradient(160deg,#9bc28a,#3f7236)", head: "#bcd8ad", accent: "#1f3a18" },
  hamster: { body: "linear-gradient(160deg,#dec39b,#8a6638)", head: "#ecdcb8", accent: "#3e2a14" },
};

type PetFigurineProps = { petId: string; size?: number };

export function PetFigurine({ petId, size = 56 }: PetFigurineProps) {
  const s = STYLES[petId];
  if (!s) return <CatFigurine size={Math.round(size * 1.24)} />;
  const bodyW = size * 0.78;
  const bodyH = size * 0.62;
  const headD = size * 0.42;
  return (
    <div
      className="relative flex flex-col items-center justify-end"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="relative"
        style={{
          width: headD,
          height: headD,
          borderRadius: "50%",
          background: s.body,
          boxShadow: `inset -2px -3px 4px rgba(0,0,0,0.25), inset 2px 2px 3px rgba(255,255,255,0.35)`,
          marginBottom: -headD * 0.18,
          zIndex: 2,
        }}
      >
        <span
          className="absolute"
          style={{ top: "45%", left: "30%", width: headD * 0.1, height: headD * 0.1, borderRadius: "50%", background: s.accent }}
        />
        <span
          className="absolute"
          style={{ top: "45%", right: "30%", width: headD * 0.1, height: headD * 0.1, borderRadius: "50%", background: s.accent }}
        />
      </div>
      <div
        style={{
          width: bodyW,
          height: bodyH,
          background: s.body,
          borderRadius: `${bodyW * 0.5}px ${bodyW * 0.5}px ${bodyW * 0.18}px ${bodyW * 0.18}px`,
          boxShadow: `inset -3px -4px 6px rgba(0,0,0,0.28), inset 3px 3px 5px rgba(255,255,255,0.3), 0 4px 6px -3px rgba(0,0,0,0.4)`,
        }}
      />
      <div
        className="absolute"
        style={{ bottom: -2, width: bodyW * 0.9, height: 4, borderRadius: "50%", background: "rgba(0,0,0,0.25)", filter: "blur(2px)" }}
      />
    </div>
  );
}

/* ========================================================================
   ShelfPet — the shelf widget slot
   ======================================================================== */

type ShelfPetProps = {
  onClick: () => void;
  height?: number;
  blank?: boolean;
};

export function ShelfPet({ onClick, height = 150, blank = false }: ShelfPetProps) {
  const { petsConfig, deletePet } = useSettings();
  const cfg = petsConfig["shelf"];
  const pet = !blank && cfg?.pet ? PETS.find((p) => p.id === cfg.pet) ?? PETS.find((p) => p.id === "cozy-cat") : null;
  const [hover, setHover] = useState(false);

  const slotH = height;
  const slotW = Math.round(slotH * 0.7);
  const catSize = Math.round(slotW * 1.05);
  const genericSize = Math.round(slotW * 0.85);

  return (
    <div
      className="relative ml-1 flex flex-col items-center justify-end self-end"
      style={{ width: slotW, height: slotH }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onClick}
        aria-label={pet ? `Change ${pet.label} companion` : "Add a companion — currently empty"}
        className="group relative flex h-full w-full items-end justify-center overflow-hidden rounded-lg"
        style={{
          background: pet
            ? "transparent"
            : "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, rgba(255,255,255,0.05) 6px 12px)",
          border: pet ? "1px solid transparent" : "2px dashed rgba(0,0,0,0.32)",
          boxShadow: pet
            ? "none"
            : "inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 0 3px rgba(255,255,255,0.08)",
        }}
      >
        {pet ? (
          <div className="pb-1">
            {pet.id === "cozy-cat" ? (
              <CatFigurine size={catSize} />
            ) : (
              <PetFigurine petId={pet.id} size={genericSize} />
            )}
          </div>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--ink)", fontSize: Math.round(slotH * 0.35), lineHeight: 1 }}
          >
            🐈
          </span>
        )}
      </button>
      {pet && hover && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deletePet("shelf");
          }}
          aria-label="Remove companion"
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-wood-dark text-[10px] text-paper shadow"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ========================================================================
   PetPopup — the conversation / configuration window
   ======================================================================== */

type PetPopupProps = {
  open: boolean;
  onClose: () => void;
};

const SHELF_KEY = "shelf";

const SUGGESTED = [
  "Fresh water",
  "Small stretch break",
  "Three slow breaths",
  "Tidy one little surface",
  "Send a kind message",
];

const ASSURANCE = "You can change anything anytime.";

export function PetPopup({ open, onClose }: PetPopupProps) {
  const { petsConfig, setPetConfig, deletePet, slapToBasic } = useSettings();
  const existing = petsConfig[SHELF_KEY];
  const [phase, setPhase] = useState<"ask" | "configure">("ask");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<PetConfig>({
    pet: null,
    animations: true,
    todoEnabled: false,
    todoItems: [],
  });

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setDraft(existing);
      setPhase("configure");
      setPickerOpen(false);
    } else {
      setDraft({ pet: null, animations: true, todoEnabled: false, todoItems: [] });
      setPhase("ask");
      setPickerOpen(true);
    }
  }, [open, existing]);

  if (!open) return null;

  const save = () => {
    if (!draft.pet) return;
    const next: PetConfig = {
      ...draft,
      todoItems:
        draft.todoEnabled && draft.todoItems.length === 0 ? [...SUGGESTED] : draft.todoItems,
    };
    setPetConfig(SHELF_KEY, next);
    onClose();
  };
  const declineOrRemove = () => {
    deletePet(SHELF_KEY);
    onClose();
  };

  return (
    <ConfirmSheet open={open} onClose={onClose} maxWidth={380} showSimplify={false}>
      {phase === "ask" ? (
        <>
          <p className="mb-3 text-center text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            Would you like to visit with an animal companion today?
          </p>
          <button
            onClick={() => { slapToBasic(); onClose(); }}
            className="mb-4 w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
            style={{
              color: SHEET_FG,
              opacity: 0.55,
              border: "none",
              backgroundColor: "transparent",
              fontFamily: '"Fraunces", Georgia, serif',
            }}
            title="Take everything to simple mode"
          >
            [ SIMPLE MODE NOW ]
          </button>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPhase("configure")}
              className="rounded-full px-6 py-2 text-[12px] tracking-[0.06em] transition hover:underline hover:opacity-100"
              style={{
                color: SHEET_FG,
                opacity: 0.9,
                border: "none",
                backgroundColor: "transparent",
                fontFamily: '"Fraunces", Georgia, serif',
              }}
            >
              Yes
            </button>
            <span
              aria-hidden
              className="text-[12px] opacity-50 select-none"
              style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif' }}
            >
              |
            </span>
            <button
              onClick={declineOrRemove}
              className="rounded-full px-6 py-2 text-[12px] tracking-[0.06em] transition hover:underline hover:opacity-100"
              style={{
                color: SHEET_FG,
                opacity: 0.7,
                border: "none",
                backgroundColor: "transparent",
                fontFamily: '"Fraunces", Georgia, serif',
              }}
            >
              No
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] opacity-60">{ASSURANCE}</p>
          <div className="flex justify-center gap-6 pt-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="text-lg opacity-70 transition hover:-translate-x-0.5 hover:opacity-100"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              ←
            </button>
            <button
              onClick={() => setPhase("configure")}
              aria-label="Forward"
              className="text-lg opacity-70 transition hover:translate-x-0.5 hover:opacity-100"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              →
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p
            className="text-center text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            Choose Companion?
          </p>
          <button
            onClick={() => { slapToBasic(); onClose(); }}
            className="w-full rounded-full py-1.5 text-[10px] uppercase tracking-[0.2em] transition"
            style={{
              color: SHEET_FG,
              opacity: 0.55,
              border: "none",
              backgroundColor: "transparent",
              fontFamily: '"Fraunces", Georgia, serif',
            }}
            title="Take everything to simple mode"
          >
            [ SIMPLE MODE NOW ]
          </button>
          {(() => {
            const currentIdx = Math.max(0, PETS.findIndex((p) => p.id === draft.pet));
            const current = PETS[currentIdx];
            const step = (dir: 1 | -1) => {
              const next = PETS[(currentIdx + dir + PETS.length) % PETS.length];
              setDraft({ ...draft, pet: next.id });
            };
            return (
              <div
                className="flex w-full items-center justify-center gap-[1ch] rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: SHEET_FG,
                  opacity: 0.85,
                }}
              >
                <button
                  onClick={() => step(-1)}
                  aria-label="Previous companion"
                  className="px-0 text-[10px] opacity-70 transition hover:opacity-100"
                >
                  ▲
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label="Next companion"
                  className="group rounded-sm text-center text-[12px] tracking-[0.04em] transition"
                  style={{ fontFamily: '"Fraunces", Georgia, serif', color: SHEET_FG }}
                >
                  <span
                    className="rounded-sm px-1 transition group-hover:bg-[rgba(255,255,255,0.18)]"
                    style={{ boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}
                  >
                    {current?.label ?? "Choose a friend"}
                  </span>
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label="Next companion"
                  className="px-0 text-[10px] opacity-70 transition hover:opacity-100"
                >
                  ▼
                </button>
              </div>
            );
          })()}

          {draft.pet && (
            <>
              <div className="space-y-[1ch]">
                <Row
                  checked={draft.animations}
                  onChange={(v) => setDraft({ ...draft, animations: v })}
                  label="Enable light animations."
                />
                <Row
                  checked={draft.todoEnabled}
                  onChange={(v) => setDraft({ ...draft, todoEnabled: v })}
                  label="Enable simple starter companion list."
                />
                <Row
                  checked={!!draft.remindersEnabled}
                  onChange={(v) => setDraft({ ...draft, remindersEnabled: v })}
                  label="Enable gentle reminders based on your choices."
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={save}
                  className="w-full rounded-full py-2 text-[12px] tracking-[0.06em] transition hover:opacity-100"
                  style={{
                    color: SHEET_FG,
                    opacity: 0.9,
                    border: "none",
                    backgroundColor: "transparent",
                    fontFamily: '"Fraunces", Georgia, serif',
                  }}
                >
                  Save for now?
                </button>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={save}
                    className="rounded-full px-6 py-2 text-[12px] tracking-[0.06em] transition hover:underline hover:opacity-100"
                    style={{
                      color: SHEET_FG,
                      opacity: 0.9,
                      border: "none",
                      backgroundColor: "transparent",
                      fontFamily: '"Fraunces", Georgia, serif',
                    }}
                  >
                    Yes
                  </button>
                  <span
                    aria-hidden
                    className="text-[12px] opacity-50 select-none"
                    style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif' }}
                  >
                    |
                  </span>
                  <button
                    onClick={onClose}
                    className="rounded-full px-6 py-2 text-[12px] tracking-[0.06em] transition hover:underline hover:opacity-100"
                    style={{
                      color: SHEET_FG,
                      opacity: 0.7,
                      border: "none",
                      backgroundColor: "transparent",
                      fontFamily: '"Fraunces", Georgia, serif',
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </>
          )}
          <p className="text-center text-[11px] opacity-60 whitespace-nowrap">{ASSURANCE}</p>
          <div className="flex justify-center gap-6 pt-1">
            <button
              onClick={() => setPhase("ask")}
              aria-label="Back"
              className="text-lg opacity-70 transition hover:-translate-x-0.5 hover:opacity-100"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              ←
            </button>
            <button
              onClick={onClose}
              aria-label="Forward"
              className="text-lg opacity-70 transition hover:translate-x-0.5 hover:opacity-100"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </ConfirmSheet>
  );
}

function Row({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full justify-center rounded-full px-2 py-0 text-[10px] leading-snug tracking-[0.04em] transition hover:opacity-100"
      style={{
        backgroundColor: "transparent",
        border: "none",
        color: SHEET_FG,
        opacity: checked ? 1 : 0.6,
        fontFamily: '"Fraunces", Georgia, serif',
      }}
    >
      <span
        style={{
          backgroundColor: checked ? "rgba(255,255,255,0.18)" : "transparent",
          padding: checked ? "0 0.25em" : 0,
          borderRadius: "2px",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {label}
      </span>
    </button>
  );
}
