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
type CatMove = "yawn" | "knead" | "pounce" | "sniff" | "ears" | "belly" | "wince" | "groom";
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

const SPECIAL_MOVES: CatMove[] = ["yawn", "knead", "pounce", "sniff", "ears", "belly", "wince", "groom"];
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
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
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
          <stop offset="0%" stopColor="#fff1cc" />
          <stop offset="22%" stopColor="#f3bd7a" />
          <stop offset="55%" stopColor="#c0823f" />
          <stop offset="85%" stopColor="#6a3812" />
          <stop offset="100%" stopColor="#2a1207" />
        </radialGradient>
        {/* Tip pom — slightly more bloomed and softer */}
        <radialGradient id={`${ns}-tailtip-grad`} cx="32%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#fff5d8" />
          <stop offset="30%" stopColor="#f0b67a" />
          <stop offset="70%" stopColor="#9a5a25" />
          <stop offset="100%" stopColor="#2a1207" />
        </radialGradient>
        {/* Soft drop shadow under the tail to lift it off the body */}
        <filter id={`${ns}-tail-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
          <feOffset dx="1.6" dy="2.4" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.55" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {animated ? (
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
          /* tail — sway pivots from the actual base now tucked behind the
             haunch (~170,80) so the swing arcs out from the butt, not from
             mid-thigh. */
          .${ns}-tail { transform-origin: 170px 80px; animation: ${ns}-tail 5.6s ease-in-out infinite; }
          @keyframes ${ns}-tail {
            0%,100% { transform: rotate(-3deg); }
            50%     { transform: rotate(5deg); }
          }
          /* tip curl — gentle independent flick at the very end */
          .${ns}-tailtip { transform-origin: 170px -10px; animation: ${ns}-tailtip 5.6s ease-in-out infinite; }
          @keyframes ${ns}-tailtip {
            0%,100% { transform: rotate(6deg); }
            50%     { transform: rotate(-8deg); }
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
          .${ns}-move-groom  { animation: ${ns}-groom  3.2s ease-in-out 1; }
          @keyframes ${ns}-yawn   { 0%,100%{ transform: none; } 30%{ transform: translateY(-2px) rotate(-2deg); } 60%{ transform: translateY(-2px) rotate(-1deg) scale(1.02); } }
          @keyframes ${ns}-knead  { 0%,100%{ transform: none; } 25%{ transform: translateY(-1px) rotate(-1deg); } 50%{ transform: translateY(0) rotate(1deg); } 75%{ transform: translateY(-1px) rotate(-1deg); } }
          @keyframes ${ns}-pounce { 0%{ transform: scale(1,1); } 25%{ transform: scale(1.04, 0.86) translateY(4px); } 55%{ transform: scale(0.95, 1.08) translateY(-12px); } 80%{ transform: scale(1.02, 0.95) translateY(2px); } 100%{ transform: none; } }
          @keyframes ${ns}-sniff  { 0%,100%{ transform: none; } 30%{ transform: translate(-2px,2px) rotate(-3deg); } 60%{ transform: translate(2px,2px) rotate(2deg); } }
          @keyframes ${ns}-earsig { 0%,100%{ transform: none; } 50%{ transform: translateY(-1px); } }
          @keyframes ${ns}-belly  { 0%,100%{ transform: none; } 35%{ transform: rotate(-22deg) translateY(2px); } 65%{ transform: rotate(20deg) translateY(2px); } }
          @keyframes ${ns}-wince  { 0%,100%{ transform: none; } 40%{ transform: scale(0.97) rotate(-1deg); } }
          @keyframes ${ns}-groom  { 0%,100%{ transform: none; } 50%{ transform: none; } }

          /* Grooming — head bows toward the lifted front-left paw with a few licks. */
          .${ns}-move-groom .${ns}-head { animation: ${ns}-groomhead 3.2s ease-in-out 1; }
          .${ns}-move-groom .${ns}-pawFL { animation: ${ns}-groompaw 3.2s ease-in-out 1; }
          @keyframes ${ns}-groomhead {
            0%,100% { transform: none; }
            20%     { transform: translate(-6px, 8px) rotate(-22deg); }
            40%     { transform: translate(-6px, 6px) rotate(-18deg); }
            55%     { transform: translate(-6px, 8px) rotate(-22deg); }
            70%     { transform: translate(-6px, 6px) rotate(-18deg); }
            85%     { transform: translate(-3px, 3px) rotate(-8deg); }
          }
          @keyframes ${ns}-groompaw {
            0%,100% { transform: none; }
            25%     { transform: translate(0, -16px) rotate(8deg); }
            70%     { transform: translate(0, -16px) rotate(8deg); }
            85%     { transform: translate(0, -6px) rotate(3deg); }
          }

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
      ) : (
        /* Hard kill-switch: when animations are disabled, neutralize every
           rig class in this cat's namespace AND keep the lid + yawn-mouth
           hidden so the resting cat looks awake, not asleep. */
        <style>{`
          [class*="${ns}-"], [class*="${ns}-"] * {
            animation: none !important;
            animation-name: none !important;
            animation-duration: 0s !important;
            animation-iteration-count: 1 !important;
            transition: none !important;
          }
          .${ns}-lid { transform: scaleY(0) !important; transform-box: view-box; transform-origin: 50px 62px; }
          .${ns}-yawnmouth { opacity: 0 !important; }
        `}</style>
      )}

      <g
        className={
          animated && travel === "leaving"
            ? `${ns}-travel-leaving`
            : animated && travel === "arriving"
              ? `${ns}-travel-arriving`
              : undefined
        }
      >
        <g className={animated && move ? `${ns}-move ${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              {/* ground shadow */}
              <ellipse
                className={`${ns}-shadow`}
                cx="105"
                cy="128"
                rx="70"
                ry="3.5"
                fill="rgba(0,0,0,0.32)"
                filter={`url(#${ns}-blur)`}
              />

              {/* tail — painted with the same fur gradient and stripe language as
            the body so it reads as the same illustration. A single tapered
            shape with the body's fur gradient, a cream highlight ellipse where
            it joins the body, and the same wavy q-stripes used on the back. */}
              <g className={`${ns}-tail`}>
                {/* soft ground/contact shadow under the base */}
                <ellipse cx="172" cy="104" rx="14" ry="4" fill="rgba(0,0,0,0.22)" filter={`url(#${ns}-blur)`} />
                {/* main tail body — fur gradient stroke matches body fill */}
                <path
                  d="M 168 100 C 180 78, 210 58, 200 24 C 196 6, 182 -6, 170 -10"
                  fill="none"
                  stroke={`url(#${ns}-fur)`}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* cream underside near the base — same cream as belly */}
                <path
                  d="M 170 100 C 178 86, 192 74, 198 58"
                  fill="none"
                  stroke={`url(#${ns}-cream)`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                {/* warm highlight wrap — same hue family as body highlights */}
                <ellipse cx="184" cy="68" rx="6" ry="14" fill="rgba(255,235,200,0.22)" transform="rotate(-18 184 68)" />
                {/* tabby stripes — identical q-curve language as the back stripes */}
                <g fill={`url(#${ns}-stripe)`} opacity="0.6">
                  <path d="M 178 80 q -3 -6 -1 -9 q 5 1 6 7 q -3 3 -5 2 Z" />
                  <path d="M 192 60 q -3 -6 -1 -9 q 5 1 6 7 q -3 3 -5 2 Z" />
                  <path d="M 199 38 q -3 -6 -1 -9 q 5 1 6 7 q -3 3 -5 2 Z" />
                  <path d="M 197 16 q -3 -6 -1 -9 q 5 1 6 7 q -3 3 -5 2 Z" />
                </g>

                {/* tip — the round stroke cap on the main path provides a natural,
              tapered end. A tiny highlight kisses the lit edge so it still
              reads as a fur tip rather than a stub. The empty group preserves
              the rig anchor for the tip-flick animation. */}
                <g className={`${ns}-tailtip`}>
                  <ellipse cx="167" cy="-12" rx="2.4" ry="1.6" fill="rgba(255,235,200,0.5)" />
                </g>
              </g>

              {/* body — breathes */}
              <g className={`${ns}-breath`}>
                <path
                  d="M 60 96 C 50 92, 48 82, 56 74 C 62 68, 72 66, 86 66 L 150 66 C 166 66, 174 76, 174 90 C 174 104, 168 110, 156 110 L 70 110 C 58 110, 56 104, 60 96 Z"
                  fill={`url(#${ns}-fur)`}
                />
                <path d="M 70 100 C 90 112, 150 112, 168 100 C 162 110, 80 110, 70 100 Z" fill={`url(#${ns}-cream)`} />
                <ellipse cx="78" cy="80" rx="14" ry="8" fill="rgba(255,235,200,0.25)" />
                <ellipse cx="155" cy="78" rx="16" ry="9" fill="rgba(255,235,200,0.18)" />

                <g fill={`url(#${ns}-stripe)`} opacity="0.65">
                  <path d="M 92 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
                  <path d="M 106 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
                  <path d="M 120 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
                  <path d="M 134 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
                  <path d="M 148 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
                </g>
                {/* tabby side wraps — short horizontal arcs that read as fur
              markings, not vertical rib bones. */}
                <g stroke="#6b3a16" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4">
                  <path d="M 92 82 q 6 -3 12 0" />
                  <path d="M 110 86 q 7 -3 14 0" />
                  <path d="M 130 82 q 7 -3 14 0" />
                  <path d="M 148 86 q 6 -3 12 0" />
                </g>
              </g>

              {/* back-fur cape — bridges the body's upper back into the haunch top
            so there's no visible spine seam. Painted in the same fur gradient
            with a subtle stripe wrap for tabby continuity. */}
              <path
                d="M 78 68 C 90 60, 130 58, 160 62 C 174 64, 184 70, 182 84 C 180 92, 172 92, 160 88 C 140 82, 110 80, 90 84 C 78 86, 72 80, 78 68 Z"
                fill={`url(#${ns}-fur)`}
              />
              <ellipse cx="120" cy="70" rx="36" ry="6" fill="rgba(255,235,200,0.22)" />
              <g fill={`url(#${ns}-stripe)`} opacity="0.55">
                <path d="M 100 64 q 3 -6 6 0 q -3 6 -6 0 Z" />
                <path d="M 118 62 q 3 -6 6 0 q -3 6 -6 0 Z" />
                <path d="M 136 62 q 3 -6 6 0 q -3 6 -6 0 Z" />
                <path d="M 154 64 q 3 -6 6 0 q -3 6 -6 0 Z" />
              </g>

              {/* back legs (static) */}
              <path
                d="M 64 102 C 62 118, 62 124, 66 128 L 76 128 C 78 124, 78 116, 76 102 Z"
                fill={`url(#${ns}-fur)`}
              />
              {/* back legs with proper haunches/thighs.
            Right rear (the visible "butt"): a rounded haunch bulges up over
            the hip, sweeps down through a muscled thigh, and tapers into the
            paw. Left rear gets a smaller matching haunch hint. Painted under
            the body fur gradient so it reads as one continuous animal. */}
              {/* right rear haunch + thigh + lower leg — the top of the haunch
            sweeps up and back over the tail's attachment point so the tail
            reads as emerging from behind the butt instead of pasted onto
            the body. */}
              <path
                d="M 138 86 C 130 90, 128 102, 132 116 C 134 124, 140 130, 150 130 L 164 130 C 174 130, 180 122, 180 108 C 180 92, 184 78, 178 70 C 172 64, 162 70, 156 76 C 150 80, 144 82, 138 86 Z"
                fill={`url(#${ns}-fur)`}
              />
              {/* darker thigh shading along the back of the haunch, hugging the
            curve where the tail tucks in behind */}
              <path
                d="M 174 78 C 182 92, 182 116, 172 128 C 178 122, 182 112, 182 100 C 182 90, 180 82, 174 78 Z"
                fill="#7a4818"
                opacity="0.6"
              />
              {/* soft crease where tail meets butt — sells the tuck */}
              <path
                d="M 172 80 C 176 86, 178 92, 178 100"
                stroke="#5a2f10"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.45"
              />
              {/* warm haunch highlight catching light on top */}
              <ellipse cx="152" cy="88" rx="12" ry="6" fill="rgba(255,235,200,0.3)" transform="rotate(-14 152 88)" />
              {/* haunch stripe wraps */}
              <g stroke="#6b3a16" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45">
                <path d="M 142 96 C 146 102, 150 106, 152 112" />
                <path d="M 152 92 C 158 100, 162 106, 164 114" />
              </g>
              {/* lower-leg/foot at base */}
              <path d="M 144 122 C 142 128, 144 132, 150 132 L 164 132 C 168 132, 170 128, 168 122 Z" fill="#a06a2c" />

              {/* left rear thigh — smaller bulge for the far side */}
              <path
                d="M 60 96 C 56 100, 56 112, 60 122 C 62 128, 68 130, 74 130 L 80 130 C 84 128, 84 120, 82 110 C 80 100, 72 94, 60 96 Z"
                fill={`url(#${ns}-fur)`}
              />
              <ellipse cx="68" cy="100" rx="7" ry="4" fill="rgba(255,235,200,0.22)" transform="rotate(-10 68 100)" />
              <path d="M 64 124 C 62 130, 64 132, 68 132 L 78 132 C 82 132, 82 128, 80 124 Z" fill="#a06a2c" />

              {/* ankle/wrist cuffs — fur tufts + dark crease above each paw so the
            joints read clearly on all four limbs. */}
              <g opacity="0.85">
                {/* back-left ankle */}
                <ellipse cx="71" cy="124" rx="9" ry="3" fill={`url(#${ns}-fur)`} />
                <path
                  d="M 64 125 C 68 127, 74 127, 78 125"
                  stroke="#5a2f10"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
                {/* back-right ankle */}
                <ellipse cx="155" cy="124" rx="11" ry="3.4" fill={`url(#${ns}-fur)`} />
                <path
                  d="M 145 125 C 150 127, 160 127, 165 125"
                  stroke="#5a2f10"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
              </g>

              <ellipse cx="71" cy="132" rx="6" ry="2" fill="#3a1d0a" />
              <ellipse cx="155" cy="132" rx="6.5" ry="2" fill="#3a1d0a" />
              <ellipse cx="166" cy="130" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />

              {/* (no far-side front paw — it's hidden behind the near front paw in this 3/4 view) */}

              {/* front-left paw — taps */}
              <g className={`${ns}-pawFL`}>
                <path d="M 76 102 C 75 116, 75 122, 78 126 L 86 126 C 88 122, 88 114, 87 102 Z" fill="#a06a2c" />
                {/* wrist cuff */}
                <ellipse cx="82" cy="120" rx="7" ry="2.4" fill={`url(#${ns}-fur)`} />
                <path
                  d="M 76 121 C 80 123, 86 123, 88 121"
                  stroke="#5a2f10"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
                <ellipse cx="82" cy="126" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />
              </g>

              {/* head — bobs and tilts */}
              <g className={`${ns}-head`}>
                {/* ears */}
                <g className={`${ns}-earL`}>
                  <path d="M 24 50 L 30 22 L 46 44 Z" fill={`url(#${ns}-fur)`} />
                  <path d="M 30 46 L 32 30 L 42 44 Z" fill={`url(#${ns}-ear)`} />
                </g>
                <g className={`${ns}-earR`}>
                  <path d="M 76 50 L 70 22 L 54 44 Z" fill={`url(#${ns}-fur)`} />
                  <path d="M 70 46 L 68 30 L 58 44 Z" fill={`url(#${ns}-ear)`} />
                </g>

                <ellipse cx="50" cy="62" rx="28" ry="24" fill={`url(#${ns}-fur)`} />

                {/* Friendly brows — gentle upward arches above each eye, raised at
              the inner ends. No central furrow stripe. */}
                <g stroke="#6b3a16" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4">
                  <path d="M 33 56 Q 40 52 46 55" />
                  <path d="M 54 55 Q 60 52 67 56" />
                </g>

                <ellipse cx="50" cy="74" rx="16" ry="10" fill="#fbe7c4" opacity="0.85" />
                <ellipse cx="50" cy="80" rx="9" ry="4" fill="#fff3da" opacity="0.7" />

                {/* eyes — sclera + darting pupils + blink lids */}
                <ellipse cx="40" cy="62" rx="4.2" ry="5" fill={`url(#${ns}-eye)`} />
                <ellipse cx="60" cy="62" rx="4.2" ry="5" fill={`url(#${ns}-eye)`} />
                <g className={`${ns}-pupils`}>
                  <ellipse cx="40" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
                  <ellipse cx="60" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
                  <circle cx="41.4" cy="60" r="1" fill="#ffffff" />
                  <circle cx="61.4" cy="60" r="1" fill="#ffffff" />
                </g>
                <ellipse cx="40" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />
                <ellipse cx="60" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />
                {/* eyelids — scaleY blink */}
                <g className={`${ns}-lid`} fill={`url(#${ns}-fur)`}>
                  <ellipse cx="40" cy="62" rx="4.4" ry="5.2" />
                  <ellipse cx="60" cy="62" rx="4.4" ry="5.2" />
                </g>

                {/* nose + mouth */}
                <path d="M 46 72 L 54 72 L 50 76 Z" fill="#7a3a2a" />
                <path d="M 46 72 L 54 72 L 50 76 Z" fill="none" stroke="#3a1d0a" strokeWidth="0.5" />
                <path d="M 50 76 L 50 79" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
                <path
                  d="M 50 79 C 48 81, 45 81, 43.5 79.5"
                  fill="none"
                  stroke="#3a1d0a"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 79 C 52 81, 55 81, 56.5 79.5"
                  fill="none"
                  stroke="#3a1d0a"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />

                {/* yawn mouth — only visible during the yawn move */}
                <ellipse className={`${ns}-yawnmouth`} cx="50" cy="80" rx="3.4" ry="3.2" fill="#2a1208" />
                <ellipse className={`${ns}-yawnmouth`} cx="50" cy="80.5" rx="2" ry="2" fill="#c44a55" opacity="0.85" />

                {/* whiskers — quiver */}
                <g
                  className={`${ns}-whisk`}
                  stroke="#3a1d0a"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0.75"
                  fill="none"
                >
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
  dog: { body: "linear-gradient(160deg,#ffffff,#b7445e)", head: "#ffffff", accent: "#5a1a2a" },
  dragon: { body: "linear-gradient(160deg,#7fd3b7,#1f7a5e)", head: "#a8e8d0", accent: "#0e3a2c" },
  phoenix: { body: "linear-gradient(160deg,#f7c2b0,#c95f4a)", head: "#fbd9cc", accent: "#5e1f12" },
  bird: { body: "linear-gradient(160deg,#f4a05a,#9c3a14)", head: "#fbd3a8", accent: "#3a1606" },
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
    <div className="relative flex flex-col items-center justify-end" style={{ width: size, height: size }} aria-hidden>
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
          style={{
            top: "45%",
            left: "30%",
            width: headD * 0.1,
            height: headD * 0.1,
            borderRadius: "50%",
            background: s.accent,
          }}
        />
        <span
          className="absolute"
          style={{
            top: "45%",
            right: "30%",
            width: headD * 0.1,
            height: headD * 0.1,
            borderRadius: "50%",
            background: s.accent,
          }}
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
        style={{
          bottom: -2,
          width: bodyW * 0.9,
          height: 4,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.25)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

/* ========================================================================
   CorgiFigurine — high-fidelity SVG Pembroke Welsh Corgi
   Same rigging vocabulary as CatFigurine: SVG vectors + CSS keyframes for
   breath, head bob, ear twitch, blink, nub-tail wag, paw tap, pose cycling,
   special moves, and travel transitions.
   ======================================================================== */

type CorgiPose = "standing" | "loaf" | "sploot" | "sleep";
type CorgiMove = "yawn" | "shake" | "bork" | "sniff" | "scratch" | "wag";

const CORGI_SPECIAL: CorgiMove[] = ["yawn", "shake", "bork", "sniff", "scratch", "wag"];
const CORGI_POSES: CorgiPose[] = ["standing", "standing", "loaf", "standing", "sploot", "sleep", "standing", "sleep"];
const CORGI_MOVE_MS = () => 30000 + Math.random() * 30000;
const CORGI_POSE_MS = () => 90000 + Math.random() * 90000;
const CORGI_MOVE_DURATION = 2400;

let __corgiUid = 0;

type CorgiProps = {
  size?: number;
  animated?: boolean;
  travel?: CatTravel;
  onLeft?: () => void;
  onArrived?: () => void;
};

export function CorgiFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: CorgiProps) {
  const w = size;
  const h = (size * 140) / 200;
  const [uid] = useState(() => ++__corgiUid);
  const ns = `dg${uid}`;

  const [pose, setPose] = useState<CorgiPose>("standing");
  const [move, setMove] = useState<CorgiMove | null>(null);
  const idle = animated && travel === "none";

  useEffect(() => {
    if (!idle) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % CORGI_POSES.length;
      setPose(CORGI_POSES[i]);
    }, CORGI_POSE_MS());
    return () => window.clearInterval(id);
  }, [idle]);

  useEffect(() => {
    if (!idle) return;
    let cancelled = false;
    let tid = 0;
    const schedule = () => {
      tid = window.setTimeout(() => {
        if (cancelled) return;
        const pick = CORGI_SPECIAL[Math.floor(Math.random() * CORGI_SPECIAL.length)];
        setMove(pick);
        tid = window.setTimeout(() => {
          if (cancelled) return;
          setMove(null);
          schedule();
        }, CORGI_MOVE_DURATION);
      }, CORGI_MOVE_MS());
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [idle]);

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
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        {/* Pembroke red sable — warm fox-orange topcoat fading to deeper russet underside */}
        <linearGradient id={`${ns}-coat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0a25c" />
          <stop offset="45%" stopColor="#d9742a" />
          <stop offset="100%" stopColor="#8a3d10" />
        </linearGradient>
        {/* White bib / blaze / paws — slightly cream so it doesn't burn out */}
        <linearGradient id={`${ns}-white`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf6e9" />
          <stop offset="100%" stopColor="#dccdb1" />
        </linearGradient>
        {/* Pink inner ear */}
        <radialGradient id={`${ns}-ear`} cx="50%" cy="65%" r="65%">
          <stop offset="0%" stopColor="#f3b3aa" />
          <stop offset="100%" stopColor="#7a3522" />
        </radialGradient>
        {/* Friendly brown eye */}
        <radialGradient id={`${ns}-eye`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#6b3a18" />
          <stop offset="70%" stopColor="#2a1408" />
          <stop offset="100%" stopColor="#0a0503" />
        </radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {animated ? (
        <style>{`
          .${ns}-rig * { transform-box: view-box; }
          .${ns}-breath { transform-origin: 110px 105px; animation: ${ns}-breath 4.2s ease-in-out infinite; }
          @keyframes ${ns}-breath {
            0%,100% { transform: scaleY(1) translateY(0); }
            50%     { transform: scaleY(1.025) translateY(-0.6px); }
          }
          .${ns}-shadow { transform-origin: 105px 128px; animation: ${ns}-shadowp 4.2s ease-in-out infinite; }
          @keyframes ${ns}-shadowp {
            0%,100% { transform: scaleX(1); opacity: 0.34; }
            50%     { transform: scaleX(0.96); opacity: 0.28; }
          }
          /* Head nod — gentle attentive bob */
          .${ns}-head { transform-origin: 52px 78px; animation: ${ns}-head 6.0s ease-in-out infinite; }
          @keyframes ${ns}-head {
            0%,100% { transform: rotate(-2deg) translateY(0); }
            40%     { transform: rotate(2deg) translateY(-1px); }
            70%     { transform: rotate(3deg) translateY(-0.4px); }
          }
          /* Upright fox ears — quick independent twitches */
          .${ns}-earL { transform-origin: 42px 60px; animation: ${ns}-earL 7.3s ease-in-out infinite; }
          .${ns}-earR { transform-origin: 68px 58px; animation: ${ns}-earR 9.1s ease-in-out infinite; }
          @keyframes ${ns}-earL {
            0%, 88%, 100% { transform: rotate(0); }
            91% { transform: rotate(-12deg); }
            94% { transform: rotate(4deg); }
            97% { transform: rotate(0); }
          }
          @keyframes ${ns}-earR {
            0%, 70%, 100% { transform: rotate(0); }
            73% { transform: rotate(10deg); }
            76% { transform: rotate(-3deg); }
            79% { transform: rotate(0); }
          }
          /* Blink */
          .${ns}-lid { transform-origin: 52px 70px; transform: scaleY(0); animation: ${ns}-blink 5.7s ease-in-out infinite; }
          @keyframes ${ns}-blink {
            0%, 92%, 100% { transform: scaleY(0); }
            94% { transform: scaleY(1); }
            96% { transform: scaleY(1); }
            98% { transform: scaleY(0); }
          }
          /* Nub tail wag — small fast happy wiggle */
          .${ns}-tail { transform-origin: 158px 92px; animation: ${ns}-tail 1.3s ease-in-out infinite; }
          @keyframes ${ns}-tail {
            0%,100% { transform: rotate(-14deg); }
            50%     { transform: rotate(18deg); }
          }
          /* Front paw tap */
          .${ns}-pawFL { transform-origin: 78px 118px; animation: ${ns}-paw 5.1s ease-in-out infinite; }
          @keyframes ${ns}-paw {
            0%, 60%, 100% { transform: rotate(0) translateY(0); }
            68% { transform: rotate(-5deg) translateY(-2px); }
            76% { transform: rotate(2deg) translateY(0.5px); }
            84% { transform: rotate(0) translateY(0); }
          }
          /* Tongue — gentle slow bob, faint */
          .${ns}-tongue { transform-origin: 30px 86px; animation: ${ns}-tongue 4.5s ease-in-out infinite; }
          @keyframes ${ns}-tongue {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(0.6px); }
          }

          /* ===================== POSE CYCLING ===================== */
          .${ns}-pose { transform-origin: 100px 130px; transition: transform 1.4s cubic-bezier(.5,.05,.4,1); }
          .${ns}-pose-standing { transform: none; }
          /* Corgi loaf: legs tucked under, body settles down a touch */
          .${ns}-pose-loaf     { transform: translate(0px, 6px) scale(1.02, 0.92); }
          /* Sploot: legs out behind, body flattens slightly forward */
          .${ns}-pose-sploot   { transform: translate(-3px, 10px) scale(1.05, 0.78); }
          /* Sleep: curls down low with a small head tilt; breath slows */
          .${ns}-pose-sleep    { transform: translate(2px, 14px) scale(1.04, 0.7) rotate(-2deg); }
          .${ns}-pose-sleep .${ns}-breath { animation-duration: 7s; }
          .${ns}-pose-sleep .${ns}-head   { animation-duration: 9s; }
          .${ns}-pose-sleep .${ns}-tail   { animation: none; transform: rotate(-6deg); }
          .${ns}-pose-sleep .${ns}-lid    { animation: none; transform: scaleY(1); }
          .${ns}-pose-sleep .${ns}-snore  { opacity: 1; animation: ${ns}-snore 3.4s ease-in-out infinite; }
          .${ns}-snore { opacity: 0; transform-box: view-box; transform-origin: 30px 56px; }
          @keyframes ${ns}-snore {
            0%   { opacity: 0; transform: translate(0, 0) scale(0.6); }
            30%  { opacity: 0.8; transform: translate(-4px, -6px) scale(0.9); }
            70%  { opacity: 0.6; transform: translate(-10px, -16px) scale(1.1); }
            100% { opacity: 0; transform: translate(-14px, -22px) scale(1.2); }
          }

          /* ===================== SPECIAL MOVES ===================== */
          .${ns}-move { animation-fill-mode: both; }
          .${ns}-move-yawn    { animation: ${ns}-yawn    2.4s ease-in-out 1; }
          .${ns}-move-shake   { animation: ${ns}-shake   1.4s ease-in-out 1; }
          .${ns}-move-bork    { animation: ${ns}-bork    1.6s ease-in-out 1; }
          .${ns}-move-sniff   { animation: ${ns}-sniff   2.4s ease-in-out 1; }
          .${ns}-move-scratch { animation: ${ns}-scratch 2.4s ease-in-out 1; }
          .${ns}-move-wag     { animation: ${ns}-wagm    2.0s ease-in-out 1; }
          @keyframes ${ns}-yawn    { 0%,100%{ transform: none; } 50%{ transform: translateY(-1px) rotate(-1deg) scale(1.02); } }
          @keyframes ${ns}-shake   { 0%,100%{ transform: none; } 20%{ transform: rotate(-5deg); } 40%{ transform: rotate(5deg); } 60%{ transform: rotate(-4deg); } 80%{ transform: rotate(3deg); } }
          @keyframes ${ns}-bork    { 0%,100%{ transform: none; } 30%{ transform: translateY(-3px) scale(1.03, 0.97); } 60%{ transform: translateY(0) scale(0.99, 1.02); } }
          @keyframes ${ns}-sniff   { 0%,100%{ transform: none; } 30%{ transform: translate(-2px,2px) rotate(-3deg); } 60%{ transform: translate(2px,2px) rotate(2deg); } }
          @keyframes ${ns}-scratch { 0%,100%{ transform: none; } 40%{ transform: translate(-2px, 1px) rotate(-3deg); } 70%{ transform: translate(2px, 0) rotate(2deg); } }
          @keyframes ${ns}-wagm    { 0%,100%{ transform: none; } 50%{ transform: translateY(-1px); } }

          /* Faster tail wag during wag/bork moves */
          .${ns}-move-wag .${ns}-tail,
          .${ns}-move-bork .${ns}-tail { animation: ${ns}-tail 0.4s ease-in-out infinite; }
          /* Scratch: back leg rises and shakes */
          .${ns}-move-scratch .${ns}-pawBR { animation: ${ns}-scratchpaw 2.4s ease-in-out 1; }
          @keyframes ${ns}-scratchpaw {
            0%,100% { transform: none; }
            20% { transform: translate(2px, -8px) rotate(20deg); }
            40% { transform: translate(0, -6px) rotate(15deg); }
            60% { transform: translate(2px, -8px) rotate(20deg); }
            80% { transform: translate(0, -2px) rotate(8deg); }
          }
          /* Bork: mouth opens */
          .${ns}-borkmouth { opacity: 0; transform-box: view-box; transform-origin: 28px 84px; }
          .${ns}-move-bork .${ns}-borkmouth { animation: ${ns}-borkm 1.6s ease-in-out 1; }
          @keyframes ${ns}-borkm { 0%,100%{ opacity:0; transform: scaleY(0.2); } 30%,60%{ opacity:1; transform: scaleY(1); } }
          /* Yawn mouth */
          .${ns}-yawnmouth { opacity: 0; transform-box: view-box; transform-origin: 28px 84px; }
          .${ns}-move-yawn .${ns}-yawnmouth { animation: ${ns}-yawnm 2.4s ease-in-out 1; }
          @keyframes ${ns}-yawnm { 0%,100%{ opacity:0; transform: scaleY(0.2); } 35%,65%{ opacity:1; transform: scaleY(1); } }

          /* ===================== TRAVEL TRANSITIONS =====================
             Corgi faces left, so forward means negative X: head leads off the
             left edge and returns from the right into place. No backwards slide. */
          .${ns}-travel-leaving  { animation: ${ns}-runoff 1.6s cubic-bezier(.3,0,.5,1) 1 forwards; }
          .${ns}-travel-arriving { animation: ${ns}-runon  1.4s cubic-bezier(.3,1.2,.5,1) 1 backwards; }
          .${ns}-travel-leaving .${ns}-breath { animation: ${ns}-bounce 0.32s ease-in-out infinite; }
          .${ns}-travel-leaving .${ns}-tail   { animation: ${ns}-tail 0.18s ease-in-out infinite; }
          .${ns}-travel-leaving .${ns}-tongue { animation: ${ns}-pant 0.22s ease-in-out infinite; }
          @keyframes ${ns}-bounce {
            0%,100% { transform: translateY(0) scaleY(1); }
            50%     { transform: translateY(-6px) scaleY(0.94); }
          }
          @keyframes ${ns}-pant {
            0%,100% { transform: translateY(0) scaleY(1); }
            50%     { transform: translateY(2px) scaleY(1.18); }
          }
          @keyframes ${ns}-runoff {
            0%   { transform: translate(0, 0); opacity: 1; }
            22%  { transform: translate(-56px, -16px); }
            48%  { transform: translate(-132px, -2px); }
            74%  { transform: translate(-224px, -24px); opacity: 0.95; }
            100% { transform: translate(-340px, 6px); opacity: 0; }
          }
          @keyframes ${ns}-runon {
            0%   { transform: translate(320px, 6px); opacity: 0; }
            30%  { transform: translate(210px, -22px); opacity: 1; }
            60%  { transform: translate(92px, -3px); }
            84%  { transform: translate(18px, -15px); }
            100% { transform: none; }
          }

          @media (prefers-reduced-motion: reduce) {
            .${ns}-breath, .${ns}-shadow, .${ns}-head, .${ns}-earL, .${ns}-earR,
            .${ns}-lid, .${ns}-tail, .${ns}-pawFL, .${ns}-tongue, .${ns}-pose,
            .${ns}-move, .${ns}-travel-leaving, .${ns}-travel-arriving {
              animation: none; transition: none;
            }
          }
        `}</style>
      ) : (
        <style>{`
          [class*="${ns}-"], [class*="${ns}-"] * {
            animation: none !important;
            animation-name: none !important;
            animation-duration: 0s !important;
            animation-iteration-count: 1 !important;
            transition: none !important;
          }
          .${ns}-lid { transform: scaleY(0) !important; transform-box: view-box; transform-origin: 52px 70px; }
          .${ns}-yawnmouth, .${ns}-borkmouth { opacity: 0 !important; }
        `}</style>
      )}

      <g
        className={
          animated && travel === "leaving"
            ? `${ns}-travel-leaving`
            : animated && travel === "arriving"
              ? `${ns}-travel-arriving`
              : undefined
        }
      >
        <g className={animated && move ? `${ns}-move ${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              {/* ground shadow — wider for the stocky body */}
              <ellipse
                className={`${ns}-shadow`}
                cx="108"
                cy="128"
                rx="78"
                ry="3.8"
                fill="rgba(0,0,0,0.34)"
                filter={`url(#${ns}-blur)`}
              />

              {/* back legs (behind body) — short pillars with white paws */}
              <g>
                <rect x="134" y="108" width="11" height="18" rx="4" fill={`url(#${ns}-coat)`} />
                <ellipse cx="139.5" cy="125" rx="6.5" ry="3" fill={`url(#${ns}-white)`} />
                <rect className={`${ns}-pawBR`} x="152" y="108" width="11" height="18" rx="4" fill={`url(#${ns}-coat)`} />
                <ellipse cx="157.5" cy="125" rx="6.5" ry="3" fill={`url(#${ns}-white)`} />
              </g>

              {/* nub tail — small fluffy wag behind the rump */}
              <g className={`${ns}-tail`}>
                <ellipse cx="162" cy="86" rx="7" ry="9" fill={`url(#${ns}-coat)`} />
                <ellipse cx="160" cy="83" rx="3.5" ry="5" fill={`url(#${ns}-white)`} opacity="0.55" />
              </g>

              {/* body — long stocky barrel, low to the ground */}
              <g className={`${ns}-breath`}>
                {/* main body */}
                <ellipse cx="110" cy="100" rx="62" ry="22" fill={`url(#${ns}-coat)`} />
                {/* white belly + chest bib */}
                <ellipse cx="100" cy="112" rx="48" ry="11" fill={`url(#${ns}-white)`} />
                {/* fairy saddle — classic Pembroke marking, a slightly darker
                    cape across the shoulders */}
                <path
                  d="M 70 86 Q 100 70 145 86 Q 150 96 145 102 Q 110 90 70 100 Z"
                  fill="#9a4416"
                  opacity="0.35"
                />
              </g>

              {/* front legs */}
              <g>
                <rect className={`${ns}-pawFL`} x="74" y="108" width="11" height="18" rx="4" fill={`url(#${ns}-coat)`} />
                <ellipse cx="79.5" cy="125" rx="6.5" ry="3" fill={`url(#${ns}-white)`} />
                <rect x="92" y="108" width="11" height="18" rx="4" fill={`url(#${ns}-coat)`} />
                <ellipse cx="97.5" cy="125" rx="6.5" ry="3" fill={`url(#${ns}-white)`} />
              </g>

              {/* head group — sits in front of the body */}
              <g className={`${ns}-head`}>
                {/* ears — tall upright triangles rooted on top of the head
                    (~y=58 head crown) so they read as attached, not floating */}
                <g className={`${ns}-earL`}>
                  <path
                    d="M 36 61 Q 38 52 45 49 Q 50 54 48 62 Z"
                    fill={`url(#${ns}-coat)`}
                  />
                  <path
                    d="M 39 59 Q 41 53 45 51 Q 47 55 46 60 Z"
                    fill={`url(#${ns}-ear)`}
                  />
                </g>
                <g className={`${ns}-earR`}>
                  <path
                    d="M 62 60 Q 65 52 72 50 Q 77 55 74 62 Z"
                    fill={`url(#${ns}-coat)`}
                  />
                  <path
                    d="M 65 58 Q 67 53 72 52 Q 73 56 71 60 Z"
                    fill={`url(#${ns}-ear)`}
                  />
                </g>
                {/* Snore puff — only visible while sleeping */}
                <text
                  className={`${ns}-snore`}
                  x="22"
                  y="56"
                  fontSize="10"
                  fill="#7a5a32"
                  fontFamily="serif"
                >z</text>

                {/* head — rounded fox-like with broad cheeks */}
                <ellipse cx="52" cy="76" rx="24" ry="21" fill={`url(#${ns}-coat)`} />
                {/* white blaze stripe down the center of the face */}
                <path
                  d="M 52 56 Q 49 70 50 86 Q 52 90 54 86 Q 55 70 52 56 Z"
                  fill={`url(#${ns}-white)`}
                />
                {/* white muzzle + cheeks */}
                <ellipse cx="38" cy="86" rx="14" ry="9" fill={`url(#${ns}-white)`} />
                {/* nose */}
                <ellipse cx="26" cy="82" rx="3.4" ry="2.6" fill="#1a0a06" />
                {/* nose highlight */}
                <ellipse cx="25" cy="81" rx="1" ry="0.7" fill="#fff" opacity="0.7" />

                {/* eyes — friendly, slightly almond */}
                <ellipse cx="44" cy="70" rx="2.6" ry="3" fill={`url(#${ns}-eye)`} />
                <ellipse cx="58" cy="68" rx="2.6" ry="3" fill={`url(#${ns}-eye)`} />
                {/* eye highlights */}
                <circle cx="43.2" cy="69" r="0.8" fill="#fff" />
                <circle cx="57.2" cy="67" r="0.8" fill="#fff" />
                {/* gentle upward brow arcs */}
                <path d="M 41 64 Q 44 62 47 64" stroke="#6e3a14" strokeWidth="0.9" fill="none" strokeLinecap="round" />
                <path d="M 55 62 Q 58 60 61 62" stroke="#6e3a14" strokeWidth="0.9" fill="none" strokeLinecap="round" />
                {/* blink lids */}
                <ellipse className={`${ns}-lid`} cx="44" cy="70" rx="2.8" ry="3" fill={`url(#${ns}-coat)`} />
                <ellipse className={`${ns}-lid`} cx="58" cy="68" rx="2.8" ry="3" fill={`url(#${ns}-coat)`} />

                {/* friendly smile — gentle curved line under muzzle */}
                <path d="M 26 86 Q 32 92 40 89" stroke="#3a1a08" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                {/* small resting tongue tip */}
                <g className={`${ns}-tongue`}>
                  <ellipse cx="34" cy="91" rx="3" ry="1.6" fill="#e87a8a" />
                </g>

                {/* yawn / bork open mouth — hidden by default */}
                <ellipse className={`${ns}-yawnmouth`} cx="30" cy="89" rx="5.5" ry="4" fill="#3a1010" />
                <ellipse className={`${ns}-borkmouth`} cx="30" cy="88" rx="4.5" ry="3" fill="#3a1010" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ========================================================================
   FoxFigurine + HamsterFigurine — theme companions matching cat/dog rigging
   ======================================================================== */

type SmallPose = "standing" | "loaf" | "sleep";
type SmallMove = "sniff" | "ears" | "stretch" | "groom";
type SmallAnimalProps = CorgiProps;

const SMALL_POSES: SmallPose[] = ["standing", "standing", "loaf", "standing", "sleep", "standing", "sleep"];
const SMALL_MOVES: SmallMove[] = ["sniff", "ears", "stretch", "groom"];
const SMALL_POSE_MS = () => 85000 + Math.random() * 90000;
const SMALL_MOVE_MS = () => 28000 + Math.random() * 34000;
let __foxUid = 0;
let __hamUid = 0;
let __drgUid = 0;
let __phxUid = 0;

function useSmallAnimalRig(animated: boolean, travel: CatTravel) {
  const [pose, setPose] = useState<SmallPose>("standing");
  const [move, setMove] = useState<SmallMove | null>(null);
  const idle = animated && travel === "none";

  useEffect(() => {
    if (!idle) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % SMALL_POSES.length;
      setPose(SMALL_POSES[i]);
    }, SMALL_POSE_MS());
    return () => window.clearInterval(id);
  }, [idle]);

  useEffect(() => {
    if (!idle) return;
    let cancelled = false;
    let tid = 0;
    const schedule = () => {
      tid = window.setTimeout(() => {
        if (cancelled) return;
        setMove(SMALL_MOVES[Math.floor(Math.random() * SMALL_MOVES.length)]);
        tid = window.setTimeout(() => {
          if (cancelled) return;
          setMove(null);
          schedule();
        }, 2300);
      }, SMALL_MOVE_MS());
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [idle]);

  return { pose, move };
}

export function FoxFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: SmallAnimalProps) {
  const w = size;
  const h = (size * 140) / 200;
  const [uid] = useState(() => ++__foxUid);
  const ns = `fx${uid}`;
  const { pose, move } = useSmallAnimalRig(animated, travel);

  useEffect(() => {
    if (travel === "leaving" && onLeft) {
      const t = window.setTimeout(onLeft, 1500);
      return () => window.clearTimeout(t);
    }
    if (travel === "arriving" && onArrived) {
      const t = window.setTimeout(onArrived, 1300);
      return () => window.clearTimeout(t);
    }
  }, [travel, onLeft, onArrived]);

  return (
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${ns}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4a35d" />
          <stop offset="55%" stopColor="#d9681f" />
          <stop offset="100%" stopColor="#7f2f0c" />
        </linearGradient>
        <linearGradient id={`${ns}-cream`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0cf" />
          <stop offset="100%" stopColor="#e3c08b" />
        </linearGradient>
        <radialGradient id={`${ns}-ear`} cx="50%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#efb49c" />
          <stop offset="100%" stopColor="#60210f" />
        </radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>
      {animated ? (
        <style>{`
          .${ns}-rig * { transform-box: view-box; }
          .${ns}-breath { transform-origin: 108px 105px; animation: ${ns}-breath 4.8s ease-in-out infinite; }
          @keyframes ${ns}-breath { 0%,100%{ transform: scaleY(1); } 50%{ transform: scaleY(1.025) translateY(-0.5px); } }
          .${ns}-shadow { animation: ${ns}-shadow 4.8s ease-in-out infinite; transform-origin: 108px 128px; }
          @keyframes ${ns}-shadow { 0%,100%{ opacity:.28; transform:scaleX(1); } 50%{ opacity:.22; transform:scaleX(.96); } }
          .${ns}-head { transform-origin: 56px 78px; animation: ${ns}-head 6.2s ease-in-out infinite; }
          @keyframes ${ns}-head { 0%,100%{ transform: rotate(-1deg); } 45%{ transform: rotate(2deg) translateY(-1px); } }
          .${ns}-earL { transform-origin: 44px 57px; animation: ${ns}-earL 8s ease-in-out infinite; }
          .${ns}-earR { transform-origin: 65px 56px; animation: ${ns}-earR 9.2s ease-in-out infinite; }
          @keyframes ${ns}-earL { 0%,88%,100%{ transform:rotate(0); } 91%{ transform:rotate(-10deg); } 95%{ transform:rotate(3deg); } }
          @keyframes ${ns}-earR { 0%,72%,100%{ transform:rotate(0); } 75%{ transform:rotate(9deg); } 79%{ transform:rotate(-2deg); } }
          .${ns}-tail { transform-origin: 150px 100px; animation: ${ns}-tail 5.4s ease-in-out infinite; }
          @keyframes ${ns}-tail { 0%,100%{ transform: rotate(-3deg); } 50%{ transform: rotate(5deg); } }
          .${ns}-lid { transform-origin: 52px 72px; transform: scaleY(0); animation: ${ns}-blink 6.1s ease-in-out infinite; }
          @keyframes ${ns}-blink { 0%,92%,100%{ transform:scaleY(0); } 94%,96%{ transform:scaleY(1); } 98%{ transform:scaleY(0); } }
          .${ns}-paw { transform-origin: 77px 121px; animation: ${ns}-paw 5.8s ease-in-out infinite; }
          @keyframes ${ns}-paw { 0%,62%,100%{ transform:none; } 72%{ transform:translateY(-2px) rotate(-4deg); } 82%{ transform:none; } }
          .${ns}-pose { transform-origin: 100px 130px; transition: transform 1.4s cubic-bezier(.5,.05,.4,1); }
          .${ns}-pose-standing { transform:none; }
          .${ns}-pose-loaf { transform: translate(1px,8px) scale(1.02,.88); }
          .${ns}-pose-sleep { transform: translate(3px,15px) scale(1.04,.68) rotate(-2deg); }
          .${ns}-pose-sleep .${ns}-lid { animation:none; transform:scaleY(1); }
          .${ns}-pose-sleep .${ns}-tail { animation:none; transform:rotate(-10deg); }
          .${ns}-pose-sleep .${ns}-snore { opacity:1; animation:${ns}-snore 3.5s ease-in-out infinite; }
          .${ns}-snore { opacity:0; transform-origin: 26px 55px; }
          @keyframes ${ns}-snore { 0%{ opacity:0; transform:translate(0,0) scale(.6); } 40%{ opacity:.75; transform:translate(-5px,-8px) scale(.95); } 100%{ opacity:0; transform:translate(-14px,-24px) scale(1.15); } }
          .${ns}-move-sniff { animation:${ns}-sniff 2.3s ease-in-out 1; }
          .${ns}-move-ears .${ns}-earL, .${ns}-move-ears .${ns}-earR { animation:${ns}-earfast .36s ease-in-out 5; }
          .${ns}-move-stretch { animation:${ns}-stretch 2.3s ease-in-out 1; }
          .${ns}-move-groom .${ns}-paw { animation:${ns}-groompaw 2.3s ease-in-out 1; }
          @keyframes ${ns}-sniff { 0%,100%{ transform:none; } 45%{ transform:translate(-3px,2px) rotate(-3deg); } 70%{ transform:translate(1px,1px); } }
          @keyframes ${ns}-earfast { 0%,100%{ transform:rotate(0); } 50%{ transform:rotate(-12deg); } }
          @keyframes ${ns}-stretch { 0%,100%{ transform:none; } 50%{ transform:translate(-5px,4px) scale(1.08,.9); } }
          @keyframes ${ns}-groompaw { 0%,100%{ transform:none; } 35%,70%{ transform:translate(-2px,-13px) rotate(9deg); } }
          .${ns}-travel-leaving { animation:${ns}-leave 1.5s cubic-bezier(.35,0,.55,1) forwards; }
          .${ns}-travel-arriving { animation:${ns}-arrive 1.3s cubic-bezier(.25,1.25,.55,1) backwards; }
          @keyframes ${ns}-leave { 0%{ transform:none; opacity:1; } 100%{ transform:translate(-310px,-4px); opacity:0; } }
          @keyframes ${ns}-arrive { 0%{ transform:translate(280px,-4px); opacity:0; } 100%{ transform:none; opacity:1; } }
          @media (prefers-reduced-motion: reduce) { .${ns}-rig *, .${ns}-pose, .${ns}-move-sniff, .${ns}-move-stretch, .${ns}-travel-leaving, .${ns}-travel-arriving { animation:none; transition:none; } }
        `}</style>
      ) : null}
      <g className={animated && travel === "leaving" ? `${ns}-travel-leaving` : animated && travel === "arriving" ? `${ns}-travel-arriving` : undefined}>
        <g className={animated && move ? `${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              <ellipse className={`${ns}-shadow`} cx="108" cy="128" rx="72" ry="3.5" fill="rgba(0,0,0,.3)" filter={`url(#${ns}-blur)`} />
              <g className={`${ns}-tail`}>
                <path d="M 145 103 C 172 96, 183 66, 170 45 C 158 56, 151 75, 154 96" fill={`url(#${ns}-fur)`} />
                <path d="M 166 47 C 176 58, 175 73, 162 85 C 164 69, 161 57, 166 47" fill={`url(#${ns}-cream)`} />
                <path d="M 159 59 C 164 62, 168 65, 172 70" stroke="#5d210b" strokeWidth="2" strokeLinecap="round" opacity=".35" />
              </g>
              <g className={`${ns}-breath`}>
                <ellipse cx="108" cy="102" rx="58" ry="21" fill={`url(#${ns}-fur)`} />
                <ellipse cx="94" cy="114" rx="40" ry="9" fill={`url(#${ns}-cream)`} />
                <path d="M 76 88 Q 112 76 150 90 Q 128 96 88 98 Z" fill="#8d320d" opacity=".2" />
              </g>
              <g>
                <rect className={`${ns}-paw`} x="73" y="109" width="10" height="17" rx="4" fill={`url(#${ns}-fur)`} />
                <ellipse cx="78" cy="125" rx="6" ry="3" fill={`url(#${ns}-cream)`} />
                <rect x="96" y="110" width="10" height="16" rx="4" fill={`url(#${ns}-fur)`} />
                <ellipse cx="101" cy="125" rx="6" ry="3" fill={`url(#${ns}-cream)`} />
                <rect x="135" y="110" width="10" height="16" rx="4" fill={`url(#${ns}-fur)`} />
                <ellipse cx="140" cy="125" rx="6" ry="3" fill={`url(#${ns}-cream)`} />
              </g>
              <g className={`${ns}-head`}>
                <g className={`${ns}-earL`}><path d="M 38 59 Q 39 43 50 37 Q 55 50 51 62 Z" fill={`url(#${ns}-fur)`} /><path d="M 42 57 Q 43 48 49 43 Q 51 51 49 58 Z" fill={`url(#${ns}-ear)`} /></g>
                <g className={`${ns}-earR`}><path d="M 60 58 Q 65 42 78 39 Q 78 54 70 64 Z" fill={`url(#${ns}-fur)`} /><path d="M 64 56 Q 68 48 75 44 Q 74 54 69 59 Z" fill={`url(#${ns}-ear)`} /></g>
                <text className={`${ns}-snore`} x="22" y="55" fontSize="10" fill="#6e3b15" fontFamily="serif">z</text>
                <ellipse cx="55" cy="77" rx="23" ry="20" fill={`url(#${ns}-fur)`} />
                <path d="M 37 79 Q 22 82 19 88 Q 30 96 43 89 Z" fill={`url(#${ns}-cream)`} />
                <path d="M 52 57 Q 49 70 50 86 Q 54 90 58 85 Q 58 70 52 57 Z" fill={`url(#${ns}-cream)`} opacity=".9" />
                <ellipse cx="18" cy="87" rx="3.2" ry="2.3" fill="#170806" />
                <ellipse cx="47" cy="71" rx="2.5" ry="3" fill="#160806" />
                <ellipse cx="61" cy="70" rx="2.5" ry="3" fill="#160806" />
                <circle cx="46.2" cy="70" r=".7" fill="#fff" /><circle cx="60.2" cy="69" r=".7" fill="#fff" />
                <ellipse className={`${ns}-lid`} cx="47" cy="71" rx="2.8" ry="3" fill={`url(#${ns}-fur)`} />
                <ellipse className={`${ns}-lid`} cx="61" cy="70" rx="2.8" ry="3" fill={`url(#${ns}-fur)`} />
                <path d="M 21 91 Q 31 96 40 90" stroke="#361005" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export function HamsterFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: SmallAnimalProps) {
  const w = size;
  const h = (size * 140) / 200;
  const [uid] = useState(() => ++__hamUid);
  const ns = `hm${uid}`;
  const { pose, move } = useSmallAnimalRig(animated, travel);

  useEffect(() => {
    if (travel === "leaving" && onLeft) {
      const t = window.setTimeout(onLeft, 1400);
      return () => window.clearTimeout(t);
    }
    if (travel === "arriving" && onArrived) {
      const t = window.setTimeout(onArrived, 1200);
      return () => window.clearTimeout(t);
    }
  }, [travel, onLeft, onArrived]);

  return (
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${ns}-fur`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#efd9ae" /><stop offset="58%" stopColor="#c89c62" /><stop offset="100%" stopColor="#815733" /></linearGradient>
        <linearGradient id={`${ns}-cream`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff4d6" /><stop offset="100%" stopColor="#e2c28c" /></linearGradient>
        <radialGradient id={`${ns}-ear`} cx="50%" cy="55%" r="65%"><stop offset="0%" stopColor="#efb7a3" /><stop offset="100%" stopColor="#9f6548" /></radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>
      {animated ? <style>{`
        .${ns}-rig * { transform-box:view-box; }
        .${ns}-breath { transform-origin:103px 105px; animation:${ns}-breath 4.5s ease-in-out infinite; }
        @keyframes ${ns}-breath { 0%,100%{ transform:scaleY(1); } 50%{ transform:scaleY(1.03) translateY(-.5px); } }
        .${ns}-shadow { transform-origin:103px 129px; animation:${ns}-shadow 4.5s ease-in-out infinite; }
        @keyframes ${ns}-shadow { 0%,100%{ opacity:.28; transform:scaleX(1); } 50%{ opacity:.22; transform:scaleX(.94); } }
        .${ns}-head { transform-origin:58px 80px; animation:${ns}-head 6.4s ease-in-out infinite; }
        @keyframes ${ns}-head { 0%,100%{ transform:rotate(0); } 50%{ transform:rotate(1.5deg) translateY(-.8px); } }
        .${ns}-earL { transform-origin:43px 61px; animation:${ns}-ear 8s ease-in-out infinite; }
        .${ns}-earR { transform-origin:65px 60px; animation:${ns}-ear 9s ease-in-out infinite reverse; }
        @keyframes ${ns}-ear { 0%,86%,100%{ transform:rotate(0); } 90%{ transform:rotate(-7deg); } 94%{ transform:rotate(3deg); } }
        .${ns}-lid { transform-origin:56px 75px; transform:scaleY(0); animation:${ns}-blink 5.8s ease-in-out infinite; }
        @keyframes ${ns}-blink { 0%,92%,100%{ transform:scaleY(0); } 94%,96%{ transform:scaleY(1); } 98%{ transform:scaleY(0); } }
        .${ns}-paw { transform-origin:75px 119px; animation:${ns}-paw 5.2s ease-in-out infinite; }
        @keyframes ${ns}-paw { 0%,60%,100%{ transform:none; } 70%{ transform:translateY(-2px) rotate(-4deg); } 82%{ transform:none; } }
        .${ns}-tail { transform-origin:154px 107px; animation:${ns}-tail 5s ease-in-out infinite; }
        @keyframes ${ns}-tail { 0%,100%{ transform:rotate(0); } 50%{ transform:rotate(8deg); } }
        .${ns}-pose { transform-origin:100px 130px; transition:transform 1.4s cubic-bezier(.5,.05,.4,1); }
        .${ns}-pose-standing { transform:none; }
        .${ns}-pose-loaf { transform:translate(2px,8px) scale(1.04,.9); }
        .${ns}-pose-sleep { transform:translate(4px,16px) scale(1.06,.68) rotate(-1deg); }
        .${ns}-pose-sleep .${ns}-lid { animation:none; transform:scaleY(1); }
        .${ns}-pose-sleep .${ns}-tail { animation:none; }
        .${ns}-pose-sleep .${ns}-snore { opacity:1; animation:${ns}-snore 3.6s ease-in-out infinite; }
        .${ns}-snore { opacity:0; transform-origin:31px 60px; }
        @keyframes ${ns}-snore { 0%{ opacity:0; transform:translate(0,0) scale(.6); } 40%{ opacity:.75; transform:translate(-4px,-8px) scale(.9); } 100%{ opacity:0; transform:translate(-12px,-22px) scale(1.1); } }
        .${ns}-move-sniff { animation:${ns}-sniff 2.2s ease-in-out 1; }
        .${ns}-move-ears .${ns}-earL, .${ns}-move-ears .${ns}-earR { animation:${ns}-earfast .38s ease-in-out 5; }
        .${ns}-move-stretch { animation:${ns}-stretch 2.3s ease-in-out 1; }
        .${ns}-move-groom .${ns}-paw { animation:${ns}-groompaw 2.3s ease-in-out 1; }
        @keyframes ${ns}-sniff { 0%,100%{ transform:none; } 45%{ transform:translate(-2px,2px) rotate(-2deg); } }
        @keyframes ${ns}-earfast { 0%,100%{ transform:rotate(0); } 50%{ transform:rotate(-9deg); } }
        @keyframes ${ns}-stretch { 0%,100%{ transform:none; } 50%{ transform:translate(-3px,5px) scale(1.08,.88); } }
        @keyframes ${ns}-groompaw { 0%,100%{ transform:none; } 35%,70%{ transform:translate(-2px,-11px) rotate(8deg); } }
        .${ns}-travel-leaving { animation:${ns}-leave 1.4s cubic-bezier(.35,0,.55,1) forwards; }
        .${ns}-travel-arriving { animation:${ns}-arrive 1.2s cubic-bezier(.25,1.25,.55,1) backwards; }
        @keyframes ${ns}-leave { 0%{ transform:none; opacity:1; } 100%{ transform:translate(-260px,0); opacity:0; } }
        @keyframes ${ns}-arrive { 0%{ transform:translate(230px,0); opacity:0; } 100%{ transform:none; opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .${ns}-rig *, .${ns}-pose, .${ns}-move-sniff, .${ns}-move-stretch, .${ns}-travel-leaving, .${ns}-travel-arriving { animation:none; transition:none; } }
      `}</style> : null}
      <g className={animated && travel === "leaving" ? `${ns}-travel-leaving` : animated && travel === "arriving" ? `${ns}-travel-arriving` : undefined}>
        <g className={animated && move ? `${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              <ellipse className={`${ns}-shadow`} cx="103" cy="129" rx="58" ry="3.5" fill="rgba(0,0,0,.28)" filter={`url(#${ns}-blur)`} />
              <g className={`${ns}-tail`}><circle cx="155" cy="108" r="5" fill={`url(#${ns}-cream)`} /></g>
              <g className={`${ns}-breath`}>
                <ellipse cx="104" cy="101" rx="51" ry="24" fill={`url(#${ns}-fur)`} />
                <ellipse cx="88" cy="112" rx="34" ry="12" fill={`url(#${ns}-cream)`} />
                <ellipse cx="128" cy="91" rx="14" ry="9" fill="#fff1ce" opacity=".28" />
              </g>
              <g>
                <rect className={`${ns}-paw`} x="72" y="111" width="9" height="15" rx="4" fill={`url(#${ns}-fur)`} /><ellipse cx="76.5" cy="125" rx="5.5" ry="3" fill={`url(#${ns}-cream)`} />
                <rect x="94" y="111" width="9" height="15" rx="4" fill={`url(#${ns}-fur)`} /><ellipse cx="98.5" cy="125" rx="5.5" ry="3" fill={`url(#${ns}-cream)`} />
                <rect x="128" y="111" width="9" height="15" rx="4" fill={`url(#${ns}-fur)`} /><ellipse cx="132.5" cy="125" rx="5.5" ry="3" fill={`url(#${ns}-cream)`} />
              </g>
              <g className={`${ns}-head`}>
                <g className={`${ns}-earL`}><circle cx="43" cy="62" r="8" fill={`url(#${ns}-fur)`} /><circle cx="43" cy="62" r="4.5" fill={`url(#${ns}-ear)`} /></g>
                <g className={`${ns}-earR`}><circle cx="66" cy="61" r="8" fill={`url(#${ns}-fur)`} /><circle cx="66" cy="61" r="4.5" fill={`url(#${ns}-ear)`} /></g>
                <text className={`${ns}-snore`} x="27" y="60" fontSize="10" fill="#6f4926" fontFamily="serif">z</text>
                <ellipse cx="56" cy="80" rx="24" ry="21" fill={`url(#${ns}-fur)`} />
                <ellipse cx="39" cy="88" rx="12" ry="8" fill={`url(#${ns}-cream)`} />
                <ellipse cx="28" cy="88" rx="3" ry="2.2" fill="#1b0b06" />
                <ellipse cx="49" cy="75" rx="2.4" ry="2.8" fill="#130704" /><ellipse cx="62" cy="74" rx="2.4" ry="2.8" fill="#130704" />
                <circle cx="48.2" cy="74" r=".7" fill="#fff" /><circle cx="61.2" cy="73" r=".7" fill="#fff" />
                <ellipse className={`${ns}-lid`} cx="49" cy="75" rx="2.7" ry="3" fill={`url(#${ns}-fur)`} /><ellipse className={`${ns}-lid`} cx="62" cy="74" rx="2.7" ry="3" fill={`url(#${ns}-fur)`} />
                <path d="M 31 91 Q 39 96 48 91" stroke="#3a1c0b" strokeWidth="1" fill="none" strokeLinecap="round" />
                <path d="M 37 86 C 27 84, 20 82, 13 80 M 38 89 C 28 90, 20 91, 13 93 M 67 84 C 77 82, 84 80, 91 78 M 67 87 C 78 88, 85 90, 92 92" stroke="#5d3218" strokeWidth=".8" strokeLinecap="round" opacity=".55" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ========================================================================
   DragonFigurine — small jade dragon (whimsical companion)
   ======================================================================== */

export function DragonFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: SmallAnimalProps) {
  const w = size;
  const h = (size * 140) / 200;
  const [uid] = useState(() => ++__drgUid);
  const ns = `drg${uid}`;
  const { pose, move } = useSmallAnimalRig(animated, travel);

  useEffect(() => {
    if (travel === "leaving" && onLeft) {
      const t = window.setTimeout(onLeft, 1500);
      return () => window.clearTimeout(t);
    }
    if (travel === "arriving" && onArrived) {
      const t = window.setTimeout(onArrived, 1300);
      return () => window.clearTimeout(t);
    }
  }, [travel, onLeft, onArrived]);

  return (
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${ns}-scale`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9be3c4" />
          <stop offset="55%" stopColor="#2f9a73" />
          <stop offset="100%" stopColor="#0e3a2c" />
        </linearGradient>
        <linearGradient id={`${ns}-belly`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e7b7" />
          <stop offset="100%" stopColor="#b88f3e" />
        </linearGradient>
        <radialGradient id={`${ns}-wing`} cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#bff0d8" />
          <stop offset="100%" stopColor="#1f6f54" />
        </radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>
      {animated ? <style>{`
        .${ns}-rig * { transform-box:view-box; }
        .${ns}-breath { transform-origin:108px 105px; animation:${ns}-breath 5s ease-in-out infinite; }
        @keyframes ${ns}-breath { 0%,100%{ transform:scaleY(1); } 50%{ transform:scaleY(1.03) translateY(-.5px); } }
        .${ns}-shadow { transform-origin:108px 130px; animation:${ns}-shadow 5s ease-in-out infinite; }
        @keyframes ${ns}-shadow { 0%,100%{ opacity:.3; transform:scaleX(1); } 50%{ opacity:.22; transform:scaleX(.94); } }
        .${ns}-head { transform-origin:62px 78px; animation:${ns}-head 6.6s ease-in-out infinite; }
        @keyframes ${ns}-head { 0%,100%{ transform:rotate(-1deg); } 50%{ transform:rotate(2.5deg) translateY(-1px); } }
        .${ns}-wing { transform-origin:108px 90px; animation:${ns}-wing 4.4s ease-in-out infinite; }
        @keyframes ${ns}-wing { 0%,100%{ transform:rotate(-6deg) scaleY(1); } 50%{ transform:rotate(8deg) scaleY(.92); } }
        .${ns}-tail { transform-origin:148px 108px; animation:${ns}-tail 5.6s ease-in-out infinite; }
        @keyframes ${ns}-tail { 0%,100%{ transform:rotate(-4deg); } 50%{ transform:rotate(7deg); } }
        .${ns}-lid { transform-origin:54px 73px; transform:scaleY(0); animation:${ns}-blink 6.3s ease-in-out infinite; }
        @keyframes ${ns}-blink { 0%,92%,100%{ transform:scaleY(0); } 94%,96%{ transform:scaleY(1); } 98%{ transform:scaleY(0); } }
        .${ns}-puff { opacity:0; transform-origin:30px 80px; }
        .${ns}-pose { transform-origin:100px 130px; transition:transform 1.4s cubic-bezier(.5,.05,.4,1); }
        .${ns}-pose-standing { transform:none; }
        .${ns}-pose-loaf { transform:translate(2px,8px) scale(1.03,.88); }
        .${ns}-pose-sleep { transform:translate(3px,15px) scale(1.05,.66) rotate(-2deg); }
        .${ns}-pose-sleep .${ns}-lid { animation:none; transform:scaleY(1); }
        .${ns}-pose-sleep .${ns}-wing { animation:none; transform:rotate(-2deg) scaleY(.6); }
        .${ns}-pose-sleep .${ns}-tail { animation:none; transform:rotate(-12deg); }
        .${ns}-move-sniff .${ns}-puff { animation:${ns}-puff 2.2s ease-out 1; }
        @keyframes ${ns}-puff { 0%{ opacity:0; transform:translate(0,0) scale(.4); } 30%{ opacity:.8; transform:translate(-10px,-6px) scale(1); } 100%{ opacity:0; transform:translate(-22px,-18px) scale(1.6); } }
        .${ns}-move-stretch { animation:${ns}-stretch 2.4s ease-in-out 1; }
        @keyframes ${ns}-stretch { 0%,100%{ transform:none; } 50%{ transform:translate(-3px,4px) scale(1.06,.9); } }
        .${ns}-move-ears .${ns}-wing { animation:${ns}-wingflap .5s ease-in-out 5; }
        @keyframes ${ns}-wingflap { 0%,100%{ transform:rotate(-6deg) scaleY(1); } 50%{ transform:rotate(20deg) scaleY(.7); } }
        .${ns}-travel-leaving { animation:${ns}-leave 1.5s cubic-bezier(.35,0,.55,1) forwards; }
        .${ns}-travel-arriving { animation:${ns}-arrive 1.3s cubic-bezier(.25,1.25,.55,1) backwards; }
        @keyframes ${ns}-leave { 0%{ transform:none; opacity:1; } 60%{ transform:translate(-160px,-20px) rotate(-6deg); opacity:.9; } 100%{ transform:translate(-330px,-40px) rotate(-12deg); opacity:0; } }
        @keyframes ${ns}-arrive { 0%{ transform:translate(280px,-40px) rotate(8deg); opacity:0; } 100%{ transform:none; opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .${ns}-rig *, .${ns}-pose, .${ns}-travel-leaving, .${ns}-travel-arriving { animation:none; transition:none; } }
      `}</style> : null}
      <g className={animated && travel === "leaving" ? `${ns}-travel-leaving` : animated && travel === "arriving" ? `${ns}-travel-arriving` : undefined}>
        <g className={animated && move ? `${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              <ellipse className={`${ns}-shadow`} cx="108" cy="130" rx="68" ry="3.5" fill="rgba(0,0,0,.32)" filter={`url(#${ns}-blur)`} />
              {/* Tail with spikes */}
              <g className={`${ns}-tail`}>
                <path d="M 145 108 C 172 104, 185 80, 178 56 C 168 72, 158 90, 150 104" fill={`url(#${ns}-scale)`} />
                <path d="M 174 60 L 180 52 L 184 60 Z M 168 74 L 174 67 L 177 75 Z M 161 88 L 166 82 L 169 90 Z" fill="#0d3326" />
              </g>
              {/* Wing */}
              <g className={`${ns}-wing`}>
                <path d="M 92 78 Q 80 40 132 50 Q 138 70 124 92 Q 110 88 92 78 Z" fill={`url(#${ns}-wing)`} stroke="#0e3a2c" strokeWidth=".8" />
                <path d="M 96 78 Q 102 60 116 56 M 102 84 Q 110 68 122 64 M 108 88 Q 116 76 126 74" stroke="#0e3a2c" strokeWidth=".7" fill="none" opacity=".6" />
              </g>
              {/* Body */}
              <g className={`${ns}-breath`}>
                <ellipse cx="108" cy="102" rx="52" ry="22" fill={`url(#${ns}-scale)`} />
                <ellipse cx="98" cy="113" rx="34" ry="9" fill={`url(#${ns}-belly)`} />
                {/* Dorsal spikes */}
                <path d="M 78 82 L 84 74 L 88 84 Z M 92 78 L 98 70 L 102 80 Z M 108 76 L 114 68 L 118 78 Z M 124 78 L 130 70 L 134 80 Z" fill="#0d3326" />
              </g>
              {/* Legs */}
              <g>
                <rect x="76" y="112" width="11" height="15" rx="4" fill={`url(#${ns}-scale)`} />
                <rect x="100" y="113" width="11" height="14" rx="4" fill={`url(#${ns}-scale)`} />
                <rect x="132" y="112" width="11" height="15" rx="4" fill={`url(#${ns}-scale)`} />
                <path d="M 76 127 L 78 125 L 80 127 L 82 125 L 84 127 M 100 127 L 102 125 L 104 127 L 106 125 L 108 127 M 132 127 L 134 125 L 136 127 L 138 125 L 140 127" stroke="#f3e7b7" strokeWidth="1" fill="none" />
              </g>
              {/* Head */}
              <g className={`${ns}-head`}>
                {/* Horns */}
                <path d="M 50 50 L 46 36 L 54 44 Z M 68 48 L 70 34 L 74 46 Z" fill="#e6d399" stroke="#6b4f1c" strokeWidth=".5" />
                {/* Smoke puff */}
                <g className={`${ns}-puff`}>
                  <circle cx="22" cy="82" r="4" fill="#dfeee5" opacity=".7" />
                  <circle cx="16" cy="78" r="2.5" fill="#dfeee5" opacity=".5" />
                </g>
                <ellipse cx="58" cy="78" rx="22" ry="19" fill={`url(#${ns}-scale)`} />
                {/* Snout */}
                <path d="M 38 80 Q 28 82 28 88 Q 36 92 46 88 Z" fill={`url(#${ns}-belly)`} />
                <circle cx="30" cy="84" r="1.2" fill="#1a0d05" />
                <circle cx="32" cy="88" r="1.2" fill="#1a0d05" />
                {/* Eye */}
                <ellipse cx="54" cy="73" rx="3" ry="3.5" fill="#fff" />
                <ellipse cx="54" cy="73.5" rx="1.6" ry="2.6" fill="#0a1a10" />
                <ellipse className={`${ns}-lid`} cx="54" cy="73" rx="3.2" ry="3.6" fill={`url(#${ns}-scale)`} />
                {/* Whisker fronds */}
                <path d="M 36 92 Q 30 96 26 100 M 40 94 Q 36 100 34 105" stroke="#0e3a2c" strokeWidth=".9" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ========================================================================
   PhoenixFigurine — small flame phoenix (spa companion)
   ======================================================================== */

export function PhoenixFigurine({ size = 96, animated = true, travel = "none", onLeft, onArrived }: SmallAnimalProps) {
  const w = size;
  const h = (size * 140) / 200;
  const [uid] = useState(() => ++__phxUid);
  const ns = `phx${uid}`;
  const { pose, move } = useSmallAnimalRig(animated, travel);

  useEffect(() => {
    if (travel === "leaving" && onLeft) {
      const t = window.setTimeout(onLeft, 1500);
      return () => window.clearTimeout(t);
    }
    if (travel === "arriving" && onArrived) {
      const t = window.setTimeout(onArrived, 1300);
      return () => window.clearTimeout(t);
    }
  }, [travel, onLeft, onArrived]);

  return (
    <svg width={w} height={h} viewBox="0 0 200 140" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${ns}-plume`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="45%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#a0260e" />
        </linearGradient>
        <linearGradient id={`${ns}-belly`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff1c4" />
          <stop offset="100%" stopColor="#e3a13a" />
        </linearGradient>
        <radialGradient id={`${ns}-wing`} cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ffd58a" />
          <stop offset="60%" stopColor="#e8541d" />
          <stop offset="100%" stopColor="#5e1808" />
        </radialGradient>
        <filter id={`${ns}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id={`${ns}-glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      {animated ? <style>{`
        .${ns}-rig * { transform-box:view-box; }
        .${ns}-breath { transform-origin:104px 100px; animation:${ns}-breath 4.6s ease-in-out infinite; }
        @keyframes ${ns}-breath { 0%,100%{ transform:scaleY(1); } 50%{ transform:scaleY(1.03) translateY(-.6px); } }
        .${ns}-shadow { transform-origin:104px 130px; animation:${ns}-shadow 4.6s ease-in-out infinite; }
        @keyframes ${ns}-shadow { 0%,100%{ opacity:.28; transform:scaleX(1); } 50%{ opacity:.2; transform:scaleX(.94); } }
        .${ns}-head { transform-origin:60px 70px; animation:${ns}-head 6.4s ease-in-out infinite; }
        @keyframes ${ns}-head { 0%,100%{ transform:rotate(0); } 50%{ transform:rotate(2deg) translateY(-1px); } }
        .${ns}-crest { transform-origin:54px 50px; animation:${ns}-crest 3.6s ease-in-out infinite; }
        @keyframes ${ns}-crest { 0%,100%{ transform:rotate(-2deg) scaleY(1); } 50%{ transform:rotate(3deg) scaleY(1.08); } }
        .${ns}-wing { transform-origin:108px 88px; animation:${ns}-wing 3.8s ease-in-out infinite; }
        @keyframes ${ns}-wing { 0%,100%{ transform:rotate(-8deg); } 50%{ transform:rotate(12deg) scaleY(.9); } }
        .${ns}-tail { transform-origin:150px 105px; animation:${ns}-tail 5s ease-in-out infinite; }
        @keyframes ${ns}-tail { 0%,100%{ transform:rotate(-4deg) scaleX(1); } 50%{ transform:rotate(8deg) scaleX(1.05); } }
        .${ns}-lid { transform-origin:54px 68px; transform:scaleY(0); animation:${ns}-blink 6.1s ease-in-out infinite; }
        @keyframes ${ns}-blink { 0%,92%,100%{ transform:scaleY(0); } 94%,96%{ transform:scaleY(1); } 98%{ transform:scaleY(0); } }
        .${ns}-ember { transform-origin:108px 92px; animation:${ns}-ember 3.2s ease-in-out infinite; }
        @keyframes ${ns}-ember { 0%,100%{ opacity:.45; } 50%{ opacity:.85; } }
        .${ns}-pose { transform-origin:100px 130px; transition:transform 1.4s cubic-bezier(.5,.05,.4,1); }
        .${ns}-pose-standing { transform:none; }
        .${ns}-pose-loaf { transform:translate(2px,9px) scale(1.03,.86); }
        .${ns}-pose-sleep { transform:translate(3px,16px) scale(1.05,.68) rotate(-1deg); }
        .${ns}-pose-sleep .${ns}-lid { animation:none; transform:scaleY(1); }
        .${ns}-pose-sleep .${ns}-wing { animation:none; transform:rotate(-2deg) scaleY(.5); }
        .${ns}-pose-sleep .${ns}-crest { animation:none; transform:rotate(0) scaleY(.7); }
        .${ns}-pose-sleep .${ns}-tail { animation:none; transform:rotate(-8deg); }
        .${ns}-move-ears .${ns}-wing { animation:${ns}-flap .42s ease-in-out 5; }
        @keyframes ${ns}-flap { 0%,100%{ transform:rotate(-8deg); } 50%{ transform:rotate(28deg) scaleY(.65); } }
        .${ns}-move-stretch { animation:${ns}-stretch 2.3s ease-in-out 1; }
        @keyframes ${ns}-stretch { 0%,100%{ transform:none; } 50%{ transform:translate(-2px,4px) scale(1.06,.9); } }
        .${ns}-move-sniff .${ns}-crest { animation:${ns}-crestup 2s ease-in-out 1; }
        @keyframes ${ns}-crestup { 0%,100%{ transform:rotate(0) scaleY(1); } 50%{ transform:rotate(0) scaleY(1.3); } }
        .${ns}-travel-leaving { animation:${ns}-leave 1.5s cubic-bezier(.35,0,.55,1) forwards; }
        .${ns}-travel-arriving { animation:${ns}-arrive 1.3s cubic-bezier(.25,1.25,.55,1) backwards; }
        @keyframes ${ns}-leave { 0%{ transform:none; opacity:1; } 60%{ transform:translate(-150px,-28px) rotate(-4deg); opacity:.9; } 100%{ transform:translate(-330px,-50px) rotate(-10deg); opacity:0; } }
        @keyframes ${ns}-arrive { 0%{ transform:translate(280px,-50px) rotate(6deg); opacity:0; } 100%{ transform:none; opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .${ns}-rig *, .${ns}-pose, .${ns}-travel-leaving, .${ns}-travel-arriving { animation:none; transition:none; } }
      `}</style> : null}
      <g className={animated && travel === "leaving" ? `${ns}-travel-leaving` : animated && travel === "arriving" ? `${ns}-travel-arriving` : undefined}>
        <g className={animated && move ? `${ns}-move-${move}` : undefined}>
          <g className={animated ? `${ns}-pose ${ns}-pose-${pose}` : undefined}>
            <g className={`${ns}-rig`}>
              <ellipse className={`${ns}-shadow`} cx="104" cy="130" rx="64" ry="3.5" fill="rgba(0,0,0,.3)" filter={`url(#${ns}-blur)`} />
              {/* Tail plumes (long flame fronds) */}
              <g className={`${ns}-tail`}>
                <path d="M 142 105 Q 178 102 188 78 Q 178 92 158 100" fill={`url(#${ns}-plume)`} />
                <path d="M 142 110 Q 184 116 196 96 Q 180 108 158 108" fill={`url(#${ns}-plume)`} opacity=".85" />
                <path d="M 142 114 Q 174 124 184 116 Q 172 118 156 114" fill={`url(#${ns}-plume)`} opacity=".7" />
              </g>
              {/* Wing */}
              <g className={`${ns}-wing`}>
                <path d="M 92 78 Q 78 42 136 50 Q 142 74 126 96 Q 108 92 92 78 Z" fill={`url(#${ns}-wing)`} stroke="#5e1808" strokeWidth=".6" />
                <path d="M 100 80 Q 110 64 126 60 M 106 88 Q 118 72 130 70" stroke="#5e1808" strokeWidth=".6" fill="none" opacity=".55" />
              </g>
              {/* Body */}
              <g className={`${ns}-breath`}>
                <ellipse cx="104" cy="100" rx="48" ry="22" fill={`url(#${ns}-plume)`} />
                <ellipse cx="94" cy="112" rx="32" ry="9" fill={`url(#${ns}-belly)`} />
                <ellipse className={`${ns}-ember`} cx="108" cy="92" rx="20" ry="8" fill="#ffd58a" opacity=".5" filter={`url(#${ns}-glow)`} />
              </g>
              {/* Legs */}
              <g>
                <rect x="86" y="113" width="6" height="14" rx="2" fill="#7a3a14" />
                <rect x="112" y="113" width="6" height="14" rx="2" fill="#7a3a14" />
                <path d="M 84 127 L 88 130 L 92 127 M 86 127 L 89 128 M 110 127 L 114 130 L 118 127 M 112 127 L 115 128" stroke="#7a3a14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </g>
              {/* Head */}
              <g className={`${ns}-head`}>
                {/* Crest plume */}
                <g className={`${ns}-crest`}>
                  <path d="M 50 56 L 44 36 L 52 48 L 54 30 L 58 48 L 64 38 L 62 56 Z" fill={`url(#${ns}-plume)`} stroke="#7a2008" strokeWidth=".5" />
                </g>
                <ellipse cx="58" cy="72" rx="20" ry="18" fill={`url(#${ns}-plume)`} />
                {/* Beak */}
                <path d="M 38 72 L 26 75 L 38 79 Z" fill="#f0c14a" stroke="#7a4f0e" strokeWidth=".5" />
                <path d="M 38 75 L 30 76 L 38 78" stroke="#7a4f0e" strokeWidth=".4" fill="none" />
                {/* Eye */}
                <ellipse cx="54" cy="68" rx="3" ry="3.2" fill="#fff" />
                <ellipse cx="53.5" cy="68.5" rx="1.7" ry="2.4" fill="#1a0a04" />
                <ellipse className={`${ns}-lid`} cx="54" cy="68" rx="3.2" ry="3.4" fill={`url(#${ns}-plume)`} />
                {/* Cheek feathers */}
                <path d="M 46 82 Q 42 86 40 92 M 50 84 Q 48 90 48 96" stroke="#7a2008" strokeWidth=".8" fill="none" strokeLinecap="round" opacity=".7" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
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
  const pet = !blank && cfg?.pet ? (PETS.find((p) => p.id === cfg.pet) ?? PETS.find((p) => p.id === "cozy-cat")) : null;
  const [hover, setHover] = useState(false);
  const [travel, setTravel] = useState<CatTravel>("none");
  const [pendingDelete, setPendingDelete] = useState(false);
  // Gentle digital affection: queue of tiny floating sparkles spawned by
  // focus events from elsewhere in the app (opening a book, finishing a
  // pet-care item). They drift up and fade — subtle reward, never loud.
  const [affection, setAffection] = useState<{ id: number; glyph: string; dx: number }[]>([]);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind?: string } | undefined;
      const glyph = detail?.kind === "task-done" ? "♥" : "✦";
      const id = Date.now() + Math.random();
      const dx = (Math.random() - 0.5) * 18;
      setAffection((q) => [...q, { id, glyph, dx }]);
      window.setTimeout(() => setAffection((q) => q.filter((s) => s.id !== id)), 1800);
    };
    window.addEventListener("shelf:affection", handler);
    return () => window.removeEventListener("shelf:affection", handler);
  }, []);

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
          boxShadow: showCat ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 0 3px rgba(255,255,255,0.08)",
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
            ) : pet.id === "dog" ? (
              <CorgiFigurine
                size={catSize}
                animated={cfg?.animations !== false}
                travel={travel}
                onLeft={() => setTravel("none")}
                onArrived={() => setTravel("none")}
              />
            ) : pet.id === "bird" ? (
              <FoxFigurine
                size={catSize}
                animated={cfg?.animations !== false}
                travel={travel}
                onLeft={() => setTravel("none")}
                onArrived={() => setTravel("none")}
              />
            ) : pet.id === "hamster" ? (
              // Hamster renders at a quarter size — true to scale next to the cat/corgi.
              <HamsterFigurine
                size={Math.round(catSize / 4)}
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
            style={{
              color: "var(--ink)",
              fontSize: Math.round(slotH * 0.35),
              lineHeight: 1,
              opacity: awayActive ? 0.4 : 1,
            }}
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
      {/* gentle digital affection — sparkles drifting above the companion */}
      {showCat && affection.length > 0 && (
        <div className="pointer-events-none absolute left-0 right-0 top-2 flex justify-center" aria-hidden>
          {affection.map((s) => (
            <span
              key={s.id}
              className="absolute select-none"
              style={{
                color: "#e8a87c",
                fontSize: 14,
                opacity: 0.85,
                transform: `translateX(${s.dx}px)`,
                animation: "shelfAffectionFloat 1.8s ease-out forwards",
                textShadow: "0 0 6px rgba(255,220,180,0.6)",
              }}
            >
              {s.glyph}
            </span>
          ))}
          <style>{`
            @keyframes shelfAffectionFloat {
              0%   { opacity: 0; transform: translate(var(--dx,0), 6px) scale(0.6); }
              25%  { opacity: 0.95; }
              100% { opacity: 0; transform: translate(var(--dx,0), -40px) scale(1.1); }
            }
          `}</style>
        </div>
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

export const SUGGESTED = [
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
    // Always greet with the cozy "ask" phase first, even when a companion is
    // already chosen — it's a gentle word-choice moment.
    if (existing) {
      setDraft(existing);
    } else {
      setDraft({ pet: null, animations: true, todoEnabled: false, todoItems: [] });
    }
    setPhase("ask");
    setPickerOpen(true);
  }, [open, existing]);

  if (!open) return null;

  const save = () => {
    if (!draft.pet) return;
    const next: PetConfig = {
      ...draft,
      todoItems: draft.todoEnabled && draft.todoItems.length === 0 ? [...SUGGESTED] : draft.todoItems,
    };
    setPetConfig(SHELF_KEY, next);
    onClose();
  };
  const declineOrRemove = () => {
    // Gentle: if a companion is already saved, just close — never silently
    // delete on a "No" answer. First-time users with no companion: dismiss.
    if (existing) {
      onClose();
      return;
    }
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
            onClick={() => {
              slapToBasic();
              onClose();
            }}
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
            onClick={() => {
              slapToBasic();
              onClose();
            }}
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
            const currentIdx = Math.max(
              0,
              PETS.findIndex((p) => p.id === draft.pet),
            );
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
                  onChange={(v) => {
                    const nextDraft = { ...draft, animations: v };
                    setDraft(nextDraft);
                    // Apply immediately so the cat behind the popup updates live —
                    // users shouldn't have to hit Save to see the toggle take effect.
                    if (existing && draft.pet) {
                      setPetConfig(SHELF_KEY, nextDraft);
                    }
                  }}
                  label="Enable light animations."
                />
                <Row
                  checked={draft.todoEnabled}
                  onChange={(v) => setDraft({ ...draft, todoEnabled: v })}
                  label="Enable editable starter companion care list."
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

function Row({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
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
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-2 py-0 text-[10px] tracking-[0.04em]"
        style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif', opacity: 0.85 }}
      >
        <span aria-hidden style={{ opacity: 0.55 }}>
          —
        </span>
        <span>Away — back in {remainingLabel}.</span>
        <button
          onClick={onRecall}
          className="rounded-sm px-1 underline-offset-2 transition hover:underline hover:opacity-100"
          style={{ color: SHEET_FG, opacity: 0.9, border: "none", backgroundColor: "transparent" }}
        >
          Call back
        </button>
        <span aria-hidden style={{ opacity: 0.55 }}>
          —
        </span>
      </div>
    );
  }

  const send = () => {
    const n = Math.max(1, Math.min(720, Math.round(parseFloat(mins) || 0)));
    onSend(n);
  };

  return (
    <div
      className="mt-5 flex w-full items-center justify-center gap-[0.5ch] rounded-full px-2 py-0 text-[10px] leading-snug tracking-[0.04em]"
      style={{ color: SHEET_FG, fontFamily: '"Fraunces", Georgia, serif', opacity: 0.75 }}
    >
      <span aria-hidden style={{ opacity: 0.55 }}>
        —
      </span>
      <span>Send companion away for</span>
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
      <span aria-hidden style={{ opacity: 0.55 }}>
        —
      </span>
    </div>
  );
}
