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


import { useEffect, useRef, useState } from "react";
import { ConfirmSheet, SheetButton, SHEET_FG } from "./ConfirmSheet";
import { PETS, useSettings, type PetConfig } from "./useSettings";

/* ========================================================================
   CatFigurine — high-fidelity SVG cat
   ======================================================================== */

type CatPose = "standing" | "curled" | "draped";
type CatMove = "yawn" | "knead" | "pounce" | "sniff" | "ears" | "belly" | "wince";
type CatTravel = "none" | "leaving" | "arriving";

type CatProps = {
  /** Render size in px. SVG scales cleanly to any size. */
  size?: number;
  /** When true, the cat is rigged with idle animations. */
  animated?: boolean;
  /** Travel state for delete/revive/send-away/recall transitions. */
  travel?: CatTravel;
  /** Fires once the leaving animation finishes. */
  onLeft?: () => void;
  /** Fires once the arriving animation finishes. */
  onArrived?: () => void;
};

const SPECIAL_MOVES: CatMove[] = ["yawn", "knead", "pounce", "sniff", "ears", "belly", "wince"];
const POSE_CYCLE: CatPose[] = ["standing", "standing", "curled", "standing", "draped", "standing"];
/* "Rare & subtle" cadence: special move every 30–60s, pose change every 90–180s. */
const MOVE_INTERVAL_MS = () => 30000 + Math.random() * 30000;
const POSE_INTERVAL_MS = () => 90000 + Math.random() * 90000;
const MOVE_DURATION_MS = 2600;

/* Per-instance id suffix so multiple cats on the same page can each carry
   their own <style> scope without colliding. */
let __catUid = 0;

export function CatFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: CatProps) {
  const w = size;
  const h = (size * 140) / 200;
  // stable per-instance id (kept across renders via useState lazy init)
  const [uid] = useState(() => ++__catUid);
  const ns = `cf${uid}`;

  // Pose + special-move state machines (only when animated and not traveling)
  const [pose, setPose] = useState<CatPose>("standing");
  const [move, setMove] = useState<CatMove | null>(null);
  const idle = animated && travel === "none";

  useEffect(() => {
    if (!idle) return;
    let i = 0;
    const tick = () => {
      i = (i + 1) % POSE_CYCLE.length;
      setPose(POSE_CYCLE[i]);
    };
    const id = window.setInterval(tick, POSE_INTERVAL_MS());
    return () => window.clearInterval(id);
  }, [idle]);

  useEffect(() => {
    if (!idle) return;
    let cancelled = false;
    let timeoutId = 0;
    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        const pick = SPECIAL_MOVES[Math.floor(Math.random() * SPECIAL_MOVES.length)];
        setMove(pick);
        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setMove(null);
          schedule();
        }, MOVE_DURATION_MS);
      }, MOVE_INTERVAL_MS());
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [idle]);

  // Travel completion callbacks
  useEffect(() => {
    if (travel === "leaving" && onLeft) {
      const t = window.setTimeout(onLeft, 1600);
      return () => window.clearTimeout(t);
    }
    if (travel === "arriving" && onArrived) {
      const t = window.setTimeout(onArrived, 1400);
      return () => window.clearTimeout(t);
    }
  }, [travel, onLeft, onArrived]);

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

        {/* Cross-section disc gradient — light upper-left → deep lower-right.
            Reused on every tube segment so the lighting stays consistent. */}
        <radialGradient id={`${ns}-tail-disc`} cx="32%" cy="28%" r="78%">
          <stop offset="0%"   stopColor="#fff1cc" />
          <stop offset="22%"  stopColor="#f3bd7a" />
          <stop offset="55%"  stopColor="#c0823f" />
          <stop offset="85%"  stopColor="#6a3812" />
          <stop offset="100%" stopColor="#2a1207" />
        </radialGradient>
        {/* Tip pom — slightly more bloomed and softer */}
        <radialGradient id={`${ns}-tailtip-grad`} cx="32%" cy="28%" r="82%">
          <stop offset="0%"   stopColor="#fff5d8" />
          <stop offset="30%"  stopColor="#f0b67a" />
          <stop offset="70%"  stopColor="#9a5a25" />
          <stop offset="100%" stopColor="#2a1207" />
        </radialGradient>
        {/* Soft drop shadow under the tail to lift it off the body */}
        <filter id={`${ns}-tail-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
          <feOffset dx="1.6" dy="2.4" result="off" />
          <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
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
          /* tail — slow sway from base. Longer tail = gentler base rotation
             so the tip doesn't whip across the canvas. */
          .${ns}-tail { transform-origin: 168px 96px; animation: ${ns}-tail 4.2s ease-in-out infinite; }
          @keyframes ${ns}-tail {
            0%,100% { transform: rotate(-5deg); }
            50%     { transform: rotate(7deg); }
          }
          /* tip curl — independent flick at the very end of the long tail */
          .${ns}-tailtip { transform-origin: 168px 0px; animation: ${ns}-tailtip 4.2s ease-in-out infinite; }
          @keyframes ${ns}-tailtip {
            0%,100% { transform: rotate(10deg); }
            50%     { transform: rotate(-14deg); }
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
          /* ===================== POSE CYCLING ===================== */
          /* The outer .cf-pose group carries one of these classes. We CSS-transition
             between transforms so the cat physically settles into each pose. */
          .${ns}-pose { transform-origin: 100px 130px; transition: transform 1.4s cubic-bezier(.5,.05,.4,1); }
          .${ns}-pose-standing { transform: none; }
          .${ns}-pose-curled   { transform: translate(0px, 14px) scale(0.92, 0.7) rotate(-3deg); }
          .${ns}-pose-draped   { transform: translate(-2px, -42px) rotate(8deg) scale(1.02, 0.85); }

          /* ===================== SPECIAL MOVES =====================
             Each move is an additive class on the outer group, applied for ~2.4s
             then cleared. They override pose transitions briefly. */
          .${ns}-move { animation-fill-mode: both; }
          .${ns}-move-yawn   { animation: ${ns}-yawn   2.4s ease-in-out 1; }
          .${ns}-move-knead  { animation: ${ns}-knead  2.6s ease-in-out 1; }
          .${ns}-move-pounce { animation: ${ns}-pounce 1.6s cubic-bezier(.4,0,.2,1) 1; }
          .${ns}-move-sniff  { animation: ${ns}-sniff  2.4s ease-in-out 1; }
          .${ns}-move-ears   { animation: ${ns}-earsig 1.6s ease-in-out 1; }
          .${ns}-move-belly  { animation: ${ns}-belly  3.2s cubic-bezier(.4,0,.4,1) 1; }
          .${ns}-move-wince  { animation: ${ns}-wince  1.6s ease-in-out 1; }
          @keyframes ${ns}-yawn   { 0%,100%{ transform: none; } 30%{ transform: translateY(-2px) rotate(-2deg); } 60%{ transform: translateY(-2px) rotate(-1deg) scale(1.02); } }
          @keyframes ${ns}-knead  { 0%,100%{ transform: none; } 25%{ transform: translateY(-1px) rotate(-1deg); } 50%{ transform: translateY(0) rotate(1deg); } 75%{ transform: translateY(-1px) rotate(-1deg); } }
          @keyframes ${ns}-pounce { 0%{ transform: scale(1,1); } 25%{ transform: scale(1.04, 0.86) translateY(4px); } 55%{ transform: scale(0.95, 1.08) translateY(-12px); } 80%{ transform: scale(1.02, 0.95) translateY(2px); } 100%{ transform: none; } }
          @keyframes ${ns}-sniff  { 0%,100%{ transform: none; } 30%{ transform: translate(-2px,2px) rotate(-3deg); } 60%{ transform: translate(2px,2px) rotate(2deg); } }
          @keyframes ${ns}-earsig { 0%,100%{ transform: none; } 50%{ transform: translateY(-1px); } }
          @keyframes ${ns}-belly  { 0%,100%{ transform: none; } 35%{ transform: rotate(-22deg) translateY(2px); } 65%{ transform: rotate(20deg) translateY(2px); } }
          @keyframes ${ns}-wince  { 0%,100%{ transform: none; } 40%{ transform: scale(0.97) rotate(-1deg); } }

          /* Yawn mouth — hidden by default, opens during yawn move */
          .${ns}-yawnmouth { opacity: 0; transform-box: view-box; transform-origin: 50px 78px; }
          .${ns}-move-yawn .${ns}-yawnmouth { animation: ${ns}-yawnm 2.4s ease-in-out 1; }
          @keyframes ${ns}-yawnm { 0%,100%{ opacity: 0; transform: scaleY(0.2); } 35%,65%{ opacity: 1; transform: scaleY(1); } }

          /* Wince forces lids fully closed and tilts ears down */
          .${ns}-move-wince .${ns}-lid { animation: none; transform: scaleY(1); }

          /* Sniff exaggerates whisker quiver */
          .${ns}-move-sniff .${ns}-whisk { animation: ${ns}-whisk 0.4s ease-in-out 6; }

          /* Ear-wiggle move runs both ear flaps fast in sync */
          .${ns}-move-ears .${ns}-earL,
          .${ns}-move-ears .${ns}-earR { animation: ${ns}-earflap 0.4s ease-in-out 4; }
          @keyframes ${ns}-earflap { 0%,100%{ transform: rotate(0); } 50%{ transform: rotate(-12deg); } }

          /* ===================== TRAVEL TRANSITIONS ===================== */
          .${ns}-travel-leaving  { animation: ${ns}-walkout 1.6s cubic-bezier(.4,0,.7,.4) 1 forwards; }
          .${ns}-travel-arriving { animation: ${ns}-dropin  1.4s cubic-bezier(.3,1.4,.5,1) 1 backwards; }
          @keyframes ${ns}-walkout {
            0%   { transform: none; opacity: 1; }
            15%  { transform: translate(20px, -2px) rotate(2deg); }
            30%  { transform: translate(45px, 1px) rotate(-2deg); }
            55%  { transform: translate(110px, -2px) rotate(2deg); }
            85%  { transform: translate(220px, 0) rotate(0); opacity: 0.9; }
            100% { transform: translate(280px, 0); opacity: 0; }
          }
          @keyframes ${ns}-dropin {
            0%   { transform: translate(60px, -140px) rotate(-18deg) scale(0.9); opacity: 0; }
            30%  { transform: translate(40px, -100px) rotate(-12deg) scale(0.95); opacity: 1; }
            60%  { transform: translate(15px, -30px) rotate(-4deg) scale(1.02); }
            80%  { transform: translate(0, 6px) rotate(0deg) scale(1, 0.92); }
            100% { transform: none; }
          }

          @media (prefers-reduced-motion: reduce) {
            .${ns}-breath, .${ns}-shadow, .${ns}-tail, .${ns}-tailtip, .${ns}-head,
            .${ns}-earL, .${ns}-earR, .${ns}-lid, .${ns}-pupils,
            .${ns}-pawFL, .${ns}-whisk, .${ns}-pose, .${ns}-move,
            .${ns}-travel-leaving, .${ns}-travel-arriving { animation: none; transition: none; }
          }
        `}</style>
      )}

      <g
        className={
          travel === "leaving"
            ? `${ns}-travel-leaving`
            : travel === "arriving"
            ? `${ns}-travel-arriving`
            : undefined
        }
      >
      <g className={animated && move ? `${ns}-move ${ns}-move-${move}` : undefined}>
      <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
      <g className={animated ? `${ns}-rig` : undefined}>
        {/* ground shadow */}
        <ellipse
          className={animated ? `${ns}-shadow` : undefined}
          cx="105" cy="128" rx="70" ry="3.5"
          fill="rgba(0,0,0,0.32)" filter={`url(#${ns}-blur)`}
        />

        {/* tail — sculpted 3D tube. Built as a series of overlapping shaded
            cross-section discs along the spine curve so the lighting actually
            wraps around a cylindrical form, with fur tufts breaking the
            silhouette so it doesn't read as a flat ribbon. */}
        <g className={animated ? `${ns}-tail` : undefined}>
          {(() => {
            // Spine samples: [x, y, radius]. Roughly uniform thickness
            // through the body, tapering only near the very tip.
            // Densely sampled spine: each disc overlaps the next by ~70%
            // so the tube reads as a continuous form, not a row of beads.
            const spine: [number, number, number][] = [
              [172, 100, 13],
              [174,  94, 13],
              [177,  88, 13],
              [180,  82, 12.8],
              [184,  76, 12.6],
              [188,  70, 12.4],
              [192,  64, 12.2],
              [196,  58, 12],
              [199,  52, 11.8],
              [202,  46, 11.6],
              [204,  40, 11.4],
              [206,  34, 11.2],
              [206,  28, 11],
              [206,  22, 10.8],
              [205,  16, 10.6],
              [203,  10, 10.4],
              [200,   4, 10.2],
              [196,  -1, 10],
              [191,  -5, 9.6],
              [185,  -8, 9.2],
            ];
            // Outline polygon for fluffy fur silhouette behind the tube
            const outline: string[] = [];
            spine.forEach(([x, y, r], i) => {
              outline.push(`${i === 0 ? "M" : "L"} ${x - r * 1.05} ${y}`);
            });
            for (let i = spine.length - 1; i >= 0; i--) {
              const [x, y, r] = spine[i];
              outline.push(`L ${x + r * 1.05} ${y}`);
            }
            outline.push("Z");

            return (
              <g filter={`url(#${ns}-tail-shadow)`}>
                {/* Fluffy fur silhouette — soft outline halo behind the tube */}
                <path d={outline.join(" ")} fill="#7d4a1e" opacity="0.55" />
                {/* Cross-section discs — the cylindrical tube body. Heavy
                    overlap means the radial gradient on each disc blends
                    smoothly into a continuous lit-to-shadow tube. */}
                {spine.map(([x, y, r], i) => (
                  <circle key={`disc-${i}`} cx={x} cy={y} r={r} fill={`url(#${ns}-tail-disc)`} />
                ))}
                {/* Sparse fur tufts along the lit edge — break the smooth
                    silhouette so it doesn't read as a hard ribbon. */}
                <g fill="#c0823f" opacity="0.7">
                  {[2, 6, 10, 14].map((i) => {
                    const [x, y, r] = spine[i];
                    return <ellipse key={`tuftL-${i}`} cx={x - r * 0.95} cy={y - 1} rx={r * 0.32} ry={r * 0.6} transform={`rotate(-14 ${x - r * 0.95} ${y})`} />;
                  })}
                </g>
                {/* Tabby stripe rings — only at sparse intervals, perpendicular
                    to the spine, hugging the cylinder. */}
                <g stroke="#3a1d07" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none">
                  {[3, 8, 13, 17].map((i) => {
                    const [x, y, r] = spine[i];
                    const [px, py] = spine[i - 1];
                    const dx = x - px, dy = y - py;
                    const len = Math.hypot(dx, dy) || 1;
                    const nx = -dy / len, ny = dx / len;
                    const ax = x - nx * r * 0.85, ay = y - ny * r * 0.85;
                    const bx = x + nx * r * 0.85, by = y + ny * r * 0.85;
                    return <path key={`stripe-${i}`} d={`M ${ax} ${ay} Q ${x} ${y - 0.6} ${bx} ${by}`} />;
                  })}
                </g>
                {/* Continuous specular sheen along the lit edge — a single
                    soft stroke, not per-disc pins, so the highlight reads as
                    one ridge of light running the length of the cylinder. */}
                <path
                  d="M 159 100 C 162 70, 192 50, 196 26 C 198 10, 188 -2, 178 -6"
                  fill="none"
                  stroke="#fff3d4"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </g>
            );
          })()}

          {/* Furry 3D tip pom — sits at the end of the tube */}
          <g className={animated ? `${ns}-tailtip` : undefined}>
            <circle cx="170" cy="-12" r="13" fill="#7d4a1e" opacity="0.55" />
            <circle cx="170" cy="-12" r="11" fill={`url(#${ns}-tailtip-grad)`} />
            <ellipse cx="166" cy="-16" rx="4.5" ry="3.2" fill="#fff3d4" opacity="0.6" />
            <circle cx="165" cy="-17" r="1.6" fill="#ffffff" opacity="0.9" />
            {/* fur fronds radiating from the pom */}
            <g stroke="#3d1e07" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" fill="none">
              <path d="M 180 -16 C 184 -19, 186 -22, 186 -25" />
              <path d="M 175 -22 C 176 -25, 175 -28, 173 -30" />
              <path d="M 167 -23 C 165 -26, 162 -28, 158 -29" />
              <path d="M 159 -19 C 155 -22, 151 -23, 148 -23" />
            </g>
          </g>
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

          {/* yawn mouth — only visible during the yawn move */}
          <ellipse className={`${ns}-yawnmouth`} cx="50" cy="80" rx="3.4" ry="3.2" fill="#2a1208" />
          <ellipse className={`${ns}-yawnmouth`} cx="50" cy="80.5" rx="2" ry="2" fill="#c44a55" opacity="0.85" />

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
  const { petsConfig, deletePet, recallPet } = useSettings();
  const cfg = petsConfig["shelf"];
  const pet = !blank && cfg?.pet ? PETS.find((p) => p.id === cfg.pet) ?? PETS.find((p) => p.id === "cozy-cat") : null;
  const [hover, setHover] = useState(false);
  const [travel, setTravel] = useState<CatTravel>("none");
  const [pendingDelete, setPendingDelete] = useState(false);

  const awayActive = !!(cfg?.awayUntil && cfg.awayUntil > Date.now());

  // Detect "pet just appeared" → arriving animation
  const prevPetRef = useRef<string | null>(pet?.id ?? null);
  useEffect(() => {
    const prev = prevPetRef.current;
    const curr = pet?.id ?? null;
    if (!prev && curr && !awayActive) setTravel("arriving");
    prevPetRef.current = curr;
  }, [pet?.id, awayActive]);

  // Detect away-state transitions
  const prevAwayRef = useRef<boolean>(awayActive);
  useEffect(() => {
    const prev = prevAwayRef.current;
    if (!prev && awayActive) setTravel("leaving");
    else if (prev && !awayActive && pet) setTravel("arriving");
    prevAwayRef.current = awayActive;
  }, [awayActive, pet]);

  // Auto-recall when the silent timer elapses
  useEffect(() => {
    if (!cfg?.awayUntil) return;
    const remaining = cfg.awayUntil - Date.now();
    if (remaining <= 0) {
      recallPet("shelf");
      return;
    }
    const id = window.setTimeout(() => recallPet("shelf"), remaining);
    return () => window.clearTimeout(id);
  }, [cfg?.awayUntil, recallPet]);

  const slotH = height;
  const slotW = Math.round(slotH * 0.7);
  const catSize = Math.round(slotW * 1.55);
  const genericSize = Math.round(slotW * 0.85);

  const onDelete = () => {
    if (pendingDelete) return;
    setPendingDelete(true);
    setTravel("leaving");
    window.setTimeout(() => {
      deletePet("shelf");
      setPendingDelete(false);
      setTravel("none");
    }, 1600);
  };

  // Cat is visible when present and either not away, or mid-leave animation
  const showCat = !!pet && (!awayActive || travel === "leaving");

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
        className="group relative flex h-full w-full items-end justify-center rounded-lg"
        style={{
          background: showCat
            ? "transparent"
            : "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, rgba(255,255,255,0.05) 6px 12px)",
          border: showCat ? "1px solid transparent" : "2px dashed rgba(0,0,0,0.32)",
          boxShadow: showCat
            ? "none"
            : "inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 0 3px rgba(255,255,255,0.08)",
        }}
      >
        {showCat && pet ? (
          <div className="pb-1">
            {pet.id === "cozy-cat" ? (
              <CatFigurine
                size={catSize}
                animated={cfg?.animations !== false}
                travel={travel}
                onLeft={() => setTravel("none")}
                onArrived={() => setTravel("none")}
              />
            ) : (
              <PetFigurine petId={pet.id} size={genericSize} />
            )}
          </div>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--ink)", fontSize: Math.round(slotH * 0.35), lineHeight: 1, opacity: awayActive ? 0.4 : 1 }}
            title={awayActive ? "Companion is away" : undefined}
          >
            {awayActive ? "💤" : "🐈"}
          </span>
        )}
      </button>
      {pet && hover && !awayActive && !pendingDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
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
  const { petsConfig, setPetConfig, deletePet, slapToBasic, sendPetAway, recallPet } = useSettings();
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
                <SendAwayRow
                  awayUntil={existing?.awayUntil}
                  onSend={(mins) => sendPetAway(SHELF_KEY, mins * 60_000)}
                  onRecall={() => recallPet(SHELF_KEY)}
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

function SendAwayRow({
  awayUntil,
  onSend,
  onRecall,
}: {
  awayUntil?: number;
  onSend: (minutes: number) => void;
  onRecall: () => void;
}) {
  const [mins, setMins] = useState<string>("15");
  const [, force] = useState(0);
  const active = !!(awayUntil && awayUntil > Date.now());

  // Tick every second while active so the remaining-time label stays fresh
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const remainingLabel = (() => {
    if (!awayUntil) return "";
    const ms = Math.max(0, awayUntil - Date.now());
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}h ${m % 60}m`;
    }
    return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
  })();

  if (active) {
    return (
      <div
        className="flex w-full items-center justify-center gap-2 rounded-full px-2 py-0 text-[10px] tracking-[0.04em]"
        style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif', opacity: 0.85 }}
      >
        <span>Away — back in {remainingLabel}.</span>
        <button
          onClick={onRecall}
          className="rounded-sm px-1 underline-offset-2 transition hover:underline hover:opacity-100"
          style={{ color: SHEET_FG, opacity: 0.9, border: "none", backgroundColor: "transparent" }}
        >
          Call back
        </button>
      </div>
    );
  }

  const send = () => {
    const n = Math.max(1, Math.min(720, Math.round(parseFloat(mins) || 0)));
    onSend(n);
  };

  return (
    <div
      className="flex w-full items-center justify-center gap-[0.5ch] rounded-full px-2 py-0 text-[10px] leading-snug tracking-[0.04em]"
      style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif', opacity: 0.75 }}
    >
      <span>Send cat away for</span>
      <input
        type="number"
        min={1}
        max={720}
        value={mins}
        onChange={(e) => setMins(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
        aria-label="Minutes to send companion away"
        className="w-[3.5ch] rounded-sm bg-transparent text-center outline-none"
        style={{
          color: SHEET_FG,
          border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.35)",
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: "10px",
          padding: "0 0 1px",
        }}
      />
      <span>min (silent timer).</span>
      <button
        onClick={send}
        className="rounded-sm px-1 underline-offset-2 transition hover:underline hover:opacity-100"
        style={{ color: SHEET_FG, opacity: 0.95, border: "none", backgroundColor: "transparent" }}
      >
        Send
      </button>
    </div>
  );
}
