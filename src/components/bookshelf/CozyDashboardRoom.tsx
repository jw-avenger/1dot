import { memo } from "react";

type Props = {
  /** Click handler for the trash can object (only wired link so far). */
  onTrashClick: () => void;
};

/**
 * Cozy expanded-mode dashboard room.
 *
 * A single painterly room scene laid out to match the user's reference map:
 *   shelf · window · calendar · clock                (back wall)
 *   closet · chair · desk(snack/drink/list/record) · vanity   (mid)
 *   bed · rug · laundry basket · trash               (foreground)
 *
 * Intentionally unlabeled — the objects ARE the links. Only the trash can
 * is wired in this first pass; other objects render as decoration until we
 * link them one by one.
 *
 * Style notes: warm parchment palette tuned to match the bulletin board,
 * library spines, and CatFigurine. Soft inked outlines, gentle shading,
 * no photo-real detail. Consistent with the rest of the cozy UI.
 */
function CozyDashboardRoomImpl({ onTrashClick }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: "4 / 3" }}>
      <svg
        viewBox="0 0 800 600"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Cozy room dashboard"
      >
        <defs>
          {/* Warm wall wash */}
          <linearGradient id="cdr-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6e5a48" />
            <stop offset="60%" stopColor="#5b4838" />
            <stop offset="100%" stopColor="#4a3b2e" />
          </linearGradient>
          {/* Wood floor */}
          <linearGradient id="cdr-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2c22" />
            <stop offset="100%" stopColor="#241a13" />
          </linearGradient>
          {/* Window night sky */}
          <linearGradient id="cdr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2540" />
            <stop offset="100%" stopColor="#0c1428" />
          </linearGradient>
          {/* Lamp glow */}
          <radialGradient id="cdr-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5d99a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f5d99a" stopOpacity="0" />
          </radialGradient>
          {/* Soft cream for fabric / paper */}
          <linearGradient id="cdr-cream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#efe4cf" />
            <stop offset="100%" stopColor="#d9c9aa" />
          </linearGradient>
        </defs>

        {/* Wall + floor */}
        <rect x="0" y="0" width="800" height="430" fill="url(#cdr-wall)" />
        <rect x="0" y="430" width="800" height="170" fill="url(#cdr-floor)" />
        {/* Lamp-glow ambient */}
        <ellipse cx="400" cy="240" rx="380" ry="220" fill="url(#cdr-glow)" />

        {/* === Back wall — shelf (top-left) === */}
        <g>
          <rect x="40" y="150" width="160" height="8" fill="#3a2a1c" />
          {/* tiny books */}
          <rect x="55" y="115" width="10" height="35" fill="#7d4a3a" />
          <rect x="66" y="108" width="9"  height="42" fill="#3f5a48" />
          <rect x="76" y="118" width="11" height="32" fill="#c9a227" />
          <rect x="88" y="112" width="9"  height="38" fill="#4a2c5a" />
          <rect x="98" y="120" width="10" height="30" fill="#2e6b8a" />
          {/* small potted plant */}
          <rect x="155" y="125" width="22" height="25" fill="#8a6a4a" />
          <path d="M166 125 q-10 -22 -2 -40 q8 18 4 40 z" fill="#5a7a4a" />
          <path d="M166 125 q12 -18 18 -34 q-2 22 -14 36 z" fill="#6e8a52" />
        </g>

        {/* === Window with curtains === */}
        <g>
          {/* curtain rod */}
          <rect x="290" y="100" width="240" height="4" fill="#2a1d12" />
          {/* sky */}
          <rect x="320" y="108" width="180" height="160" fill="url(#cdr-sky)" />
          {/* window cross */}
          <line x1="410" y1="108" x2="410" y2="268" stroke="#2a1d12" strokeWidth="3" />
          <line x1="320" y1="188" x2="500" y2="188" stroke="#2a1d12" strokeWidth="3" />
          {/* tiny city silhouette */}
          <path d="M320 240 l20 0 l0 -22 l14 0 l0 22 l10 0 l0 -14 l18 0 l0 14 l20 0 l0 -28 l16 0 l0 28 l22 0 l0 -18 l14 0 l0 18 l16 0 l0 -10 l14 0 l0 10 l16 0 l0 28 l-180 0 z" fill="#0a0f1c" opacity="0.85" />
          {/* curtains */}
          <path d="M290 104 q10 80 -6 164 l40 0 q-6 -82 4 -164 z" fill="url(#cdr-cream)" />
          <path d="M510 104 q-10 80 6 164 l-40 0 q6 -82 -4 -164 z" fill="url(#cdr-cream)" />
          {/* sill candles */}
          <rect x="340" y="260" width="6" height="14" fill="#efe4cf" />
          <circle cx="343" cy="258" r="2" fill="#f6c66a" />
          <rect x="470" y="260" width="6" height="14" fill="#efe4cf" />
          <circle cx="473" cy="258" r="2" fill="#f6c66a" />
        </g>

        {/* === Calendar (right of window) === */}
        <g>
          <rect x="560" y="120" width="110" height="90" fill="url(#cdr-cream)" stroke="#3a2a1c" strokeWidth="2" />
          <rect x="560" y="120" width="110" height="14" fill="#8a6a4a" />
          {[0,1,2].map(r => [0,1,2,3,4].map(c => (
            <rect key={`${r}-${c}`} x={566 + c*20} y={142 + r*20} width="16" height="14" fill="none" stroke="#3a2a1c" strokeWidth="0.5" />
          )))}
        </g>

        {/* === Clock === */}
        <g>
          <circle cx="720" cy="160" r="38" fill="url(#cdr-cream)" stroke="#3a2a1c" strokeWidth="3" />
          <line x1="720" y1="160" x2="720" y2="132" stroke="#2a1d12" strokeWidth="3" strokeLinecap="round" />
          <line x1="720" y1="160" x2="742" y2="170" stroke="#2a1d12" strokeWidth="3" strokeLinecap="round" />
          <circle cx="720" cy="160" r="2.5" fill="#2a1d12" />
        </g>

        {/* === Bulletin board (under calendar) === */}
        <g>
          <rect x="555" y="220" width="110" height="60" fill="#a06a3a" stroke="#3a2a1c" strokeWidth="2" />
          <rect x="565" y="232" width="22" height="18" fill="#f6d36a" />
          <rect x="595" y="240" width="22" height="16" fill="#8fcf8a" />
          <rect x="625" y="232" width="22" height="20" fill="#f29a9a" />
        </g>

        {/* === Closet (left) === */}
        <g>
          <rect x="60" y="270" width="120" height="200" fill="#efe7d8" stroke="#3a2a1c" strokeWidth="2" />
          <line x1="120" y1="272" x2="120" y2="468" stroke="#3a2a1c" strokeWidth="1.5" />
          <circle cx="114" cy="370" r="2.5" fill="#3a2a1c" />
          <circle cx="126" cy="370" r="2.5" fill="#3a2a1c" />
        </g>

        {/* === Bed (foreground left) === */}
        <g>
          <rect x="30" y="430" width="160" height="120" fill="#efe4cf" stroke="#3a2a1c" strokeWidth="2" />
          <rect x="30" y="430" width="160" height="22" fill="#8a6a4a" />
          {/* pillow */}
          <rect x="42" y="442" width="50" height="22" rx="4" fill="#dcd0b3" stroke="#3a2a1c" strokeWidth="1" />
          {/* blanket */}
          <path d="M30 500 l160 0 l0 50 l-160 0 z" fill="#6e8a6a" opacity="0.85" />
        </g>

        {/* === Chair with blankie for pet === */}
        <g>
          <path d="M210 410 q0 -34 30 -34 q30 0 30 34 l0 50 l-60 0 z" fill="#9b8068" stroke="#3a2a1c" strokeWidth="2" />
          {/* curled cat silhouette */}
          <ellipse cx="240" cy="430" rx="22" ry="10" fill="#d49658" />
          <circle cx="226" cy="426" r="6" fill="#d49658" />
        </g>

        {/* === Desk === */}
        <g>
          {/* desk top */}
          <rect x="290" y="380" width="280" height="14" fill="#b08858" stroke="#3a2a1c" strokeWidth="2" />
          {/* desk body */}
          <rect x="300" y="394" width="260" height="70" fill="#efe7d8" stroke="#3a2a1c" strokeWidth="2" />
          <rect x="310" y="410" width="80" height="40" fill="none" stroke="#3a2a1c" strokeWidth="1" />
          <rect x="395" y="410" width="80" height="40" fill="none" stroke="#3a2a1c" strokeWidth="1" />
          <rect x="480" y="410" width="70" height="40" fill="none" stroke="#3a2a1c" strokeWidth="1" />

          {/* lamp */}
          <line x1="320" y1="380" x2="320" y2="340" stroke="#3a2a1c" strokeWidth="2" />
          <path d="M308 340 l24 0 l-6 -18 l-12 0 z" fill="#c9a35a" stroke="#3a2a1c" strokeWidth="1.5" />
          <ellipse cx="320" cy="360" rx="40" ry="10" fill="#f5d99a" opacity="0.45" />

          {/* drink mug */}
          <rect x="350" y="360" width="18" height="20" fill="url(#cdr-cream)" stroke="#3a2a1c" strokeWidth="1.5" />
          <path d="M368 364 q8 2 8 8 q0 6 -8 8" fill="none" stroke="#3a2a1c" strokeWidth="1.5" />

          {/* snack bowl */}
          <path d="M380 372 q15 14 30 0 z" fill="#c89868" stroke="#3a2a1c" strokeWidth="1.5" />
          <circle cx="390" cy="370" r="2" fill="#7a5238" />
          <circle cx="396" cy="372" r="2" fill="#7a5238" />
          <circle cx="402" cy="370" r="2" fill="#7a5238" />

          {/* base list card */}
          <rect x="430" y="338" width="42" height="44" fill="url(#cdr-cream)" stroke="#3a2a1c" strokeWidth="1.5" />
          <line x1="436" y1="350" x2="466" y2="350" stroke="#3a2a1c" strokeWidth="0.8" />
          <line x1="436" y1="358" x2="466" y2="358" stroke="#3a2a1c" strokeWidth="0.8" />
          <line x1="436" y1="366" x2="460" y2="366" stroke="#3a2a1c" strokeWidth="0.8" />

          {/* record player */}
          <rect x="490" y="354" width="70" height="26" fill="#8a5a32" stroke="#3a2a1c" strokeWidth="1.5" />
          <circle cx="525" cy="367" r="10" fill="#1a1310" />
          <circle cx="525" cy="367" r="3" fill="#c0392b" />
        </g>

        {/* === Vanity (right) === */}
        <g>
          <rect x="620" y="400" width="120" height="14" fill="#b08858" stroke="#3a2a1c" strokeWidth="2" />
          <rect x="630" y="414" width="100" height="60" fill="#efe7d8" stroke="#3a2a1c" strokeWidth="2" />
          {/* mirror */}
          <ellipse cx="680" cy="370" rx="22" ry="28" fill="#cfd8d8" stroke="#3a2a1c" strokeWidth="2" />
          <line x1="658" y1="378" x2="658" y2="402" stroke="#3a2a1c" strokeWidth="2" />
          <line x1="702" y1="378" x2="702" y2="402" stroke="#3a2a1c" strokeWidth="2" />
          {/* tiny lamp */}
          <rect x="635" y="392" width="6" height="10" fill="#c9a35a" />
          <path d="M630 392 l16 0 l-4 -8 l-8 0 z" fill="#f6c66a" />
        </g>

        {/* === Rug === */}
        <g>
          <ellipse cx="400" cy="540" rx="180" ry="40" fill="#cdbf9a" stroke="#3a2a1c" strokeWidth="1.5" />
          <ellipse cx="400" cy="540" rx="150" ry="30" fill="none" stroke="#a89572" strokeWidth="1" />
          <ellipse cx="400" cy="540" rx="110" ry="22" fill="none" stroke="#a89572" strokeWidth="1" />
        </g>

        {/* === Laundry basket === */}
        <g>
          <path d="M540 500 l80 0 l-6 50 l-68 0 z" fill="#a07a4a" stroke="#3a2a1c" strokeWidth="2" />
          {/* weave hint */}
          <line x1="548" y1="514" x2="612" y2="514" stroke="#3a2a1c" strokeWidth="0.6" />
          <line x1="548" y1="528" x2="612" y2="528" stroke="#3a2a1c" strokeWidth="0.6" />
          <line x1="548" y1="542" x2="612" y2="542" stroke="#3a2a1c" strokeWidth="0.6" />
          {/* cloth peeking */}
          <path d="M556 500 q14 -10 28 0 q14 -10 28 0 l0 6 l-56 0 z" fill="#efe4cf" />
        </g>

        {/* === TRASH (interactive) === */}
        <g
          onClick={onTrashClick}
          role="button"
          tabIndex={0}
          aria-label="Open trash"
          className="cursor-pointer outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTrashClick();
            }
          }}
          style={{ transition: "transform 200ms ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {/* soft hover glow */}
          <ellipse cx="695" cy="552" rx="42" ry="8" fill="#000" opacity="0.35" />
          {/* lid */}
          <ellipse cx="695" cy="478" rx="34" ry="6" fill="#a89572" stroke="#2a1d12" strokeWidth="1.5" />
          <rect x="690" y="468" width="10" height="6" rx="2" fill="#a89572" stroke="#2a1d12" strokeWidth="1.5" />
          {/* can body */}
          <path d="M664 482 q31 6 62 0 l-6 70 l-50 0 z" fill="#b8a784" stroke="#2a1d12" strokeWidth="2" />
          {/* ribs */}
          <path d="M666 500 q29 6 58 0" fill="none" stroke="#2a1d12" strokeWidth="0.8" opacity="0.6" />
          <path d="M668 524 q27 6 54 0" fill="none" stroke="#2a1d12" strokeWidth="0.8" opacity="0.6" />
          <path d="M670 546 q25 6 50 0" fill="none" stroke="#2a1d12" strokeWidth="0.8" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

export const CozyDashboardRoom = memo(CozyDashboardRoomImpl);
