type Props = {
  /** Render size in px. SVG scales cleanly to any size. */
  size?: number;
};

/**
 * High-fidelity cat figurine modeled after the 🐈 emoji silhouette.
 * Side-profile orange tabby, all four paws planted, tail held high with
 * a soft S-curve, head turned three-quarters toward the viewer.
 *
 * Built as a single resolution-independent SVG (viewBox 200x140) so it
 * scales cleanly from a 24px favicon to a 240px shelf figurine.
 */
export function CatFigurine({ size = 96 }: Props) {
  // preserve 200:140 aspect ratio
  const w = size;
  const h = (size * 140) / 200;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 140"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* main fur — warm orange tabby with belly highlight at top, deep shadow at bottom */}
        <linearGradient id="cf-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c98a" />
          <stop offset="35%" stopColor="#e3a158" />
          <stop offset="75%" stopColor="#b3712f" />
          <stop offset="100%" stopColor="#6e3f15" />
        </linearGradient>
        {/* belly / chin — soft cream */}
        <linearGradient id="cf-cream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe7c4" stopOpacity="0" />
          <stop offset="100%" stopColor="#fbe7c4" stopOpacity="0.95" />
        </linearGradient>
        {/* inner ear */}
        <radialGradient id="cf-ear" cx="50%" cy="70%" r="65%">
          <stop offset="0%" stopColor="#f0a6ad" />
          <stop offset="100%" stopColor="#7a3a3d" />
        </radialGradient>
        {/* eyes */}
        <radialGradient id="cf-eye" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cfe89a" />
          <stop offset="60%" stopColor="#7aa84a" />
          <stop offset="100%" stopColor="#2c5018" />
        </radialGradient>
        {/* ground shadow blur */}
        <filter id="cf-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        {/* tabby stripe pattern */}
        <linearGradient id="cf-stripe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a2f10" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5a2f10" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="105" cy="128" rx="70" ry="3.5" fill="rgba(0,0,0,0.32)" filter="url(#cf-blur)" />

      {/* ============================================================
          TAIL — held high with relaxed S-curve, originating from rump.
          Drawn first so the body overlaps cleanly at the base.
         ============================================================ */}
      <path
        d="
          M 168 96
          C 184 84, 190 60, 178 42
          C 170 30, 158 36, 162 48
          C 166 58, 168 70, 160 76
        "
        fill="none"
        stroke="url(#cf-fur)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* tail tip — slightly darker for definition */}
      <circle cx="174" cy="38" r="5.2" fill="#a5621f" />
      {/* tail highlight */}
      <path
        d="M 170 92 C 184 80, 188 60, 178 44"
        fill="none"
        stroke="rgba(255,225,180,0.32)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* ============================================================
          BODY — long elongated silhouette with a slight back arch and
          a soft chest curve. One continuous path so the silhouette
          reads cleanly at small sizes.
         ============================================================ */}
      <path
        d="
          M 60 96
          C 50 92, 48 82, 56 74
          C 62 68, 72 66, 86 66
          L 150 66
          C 166 66, 174 76, 174 90
          C 174 104, 168 110, 156 110
          L 70 110
          C 58 110, 56 104, 60 96
          Z
        "
        fill="url(#cf-fur)"
      />
      {/* belly cream band */}
      <path
        d="M 70 100 C 90 112, 150 112, 168 100 C 162 110, 80 110, 70 100 Z"
        fill="url(#cf-cream)"
      />
      {/* shoulder shading */}
      <ellipse cx="78" cy="80" rx="14" ry="8" fill="rgba(255,235,200,0.25)" />
      {/* hip shading */}
      <ellipse cx="155" cy="78" rx="16" ry="9" fill="rgba(255,235,200,0.18)" />

      {/* tabby stripes across back */}
      <g fill="url(#cf-stripe)" opacity="0.65">
        <path d="M 92 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
        <path d="M 106 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
        <path d="M 120 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
        <path d="M 134 66 q 3 -7 6 0 q -3 7 -6 0 Z" />
        <path d="M 148 66 q 3 -6 6 0 q -3 6 -6 0 Z" />
      </g>
      {/* side rib stripes */}
      <g stroke="#6b3a16" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.45">
        <path d="M 96 76 C 97 84, 97 92, 96 100" />
        <path d="M 110 76 C 111 84, 111 92, 110 100" />
        <path d="M 124 76 C 125 84, 125 92, 124 100" />
        <path d="M 138 76 C 139 84, 139 92, 138 100" />
        <path d="M 152 78 C 153 86, 153 94, 152 102" />
      </g>

      {/* ============================================================
          LEGS — front pair (left side of cat, screen-left) and back
          pair, with subtle separation between near and far leg.
         ============================================================ */}
      {/* far front leg (behind) */}
      <path d="M 76 102 C 75 116, 75 122, 78 126 L 86 126 C 88 122, 88 114, 87 102 Z" fill="#a06a2c" />
      {/* near front leg */}
      <path d="M 64 102 C 62 118, 62 124, 66 128 L 76 128 C 78 124, 78 116, 76 102 Z" fill="url(#cf-fur)" />
      {/* far back leg */}
      <path d="M 156 102 C 155 116, 154 122, 158 126 L 166 126 C 168 122, 168 114, 167 102 Z" fill="#a06a2c" />
      {/* near back leg — slightly thicker (haunch) */}
      <path
        d="M 142 100 C 138 112, 138 122, 144 128 L 156 128 C 160 122, 160 112, 156 100 Z"
        fill="url(#cf-fur)"
      />
      {/* paws */}
      <ellipse cx="71" cy="128" rx="6" ry="2" fill="#3a1d0a" />
      <ellipse cx="82" cy="126" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />
      <ellipse cx="150" cy="128" rx="6.5" ry="2" fill="#3a1d0a" />
      <ellipse cx="162" cy="126" rx="5" ry="1.6" fill="#3a1d0a" opacity="0.85" />

      {/* ============================================================
          HEAD — round skull with triangular ears and a short muzzle.
          Drawn last so it sits on top of the body cleanly.
         ============================================================ */}
      <g>
        {/* ears (outer) */}
        <path d="M 24 50 L 30 22 L 46 44 Z" fill="url(#cf-fur)" />
        <path d="M 76 50 L 70 22 L 54 44 Z" fill="url(#cf-fur)" />
        {/* ears (inner) */}
        <path d="M 30 46 L 32 30 L 42 44 Z" fill="url(#cf-ear)" />
        <path d="M 70 46 L 68 30 L 58 44 Z" fill="url(#cf-ear)" />

        {/* head — slight oval, wider than tall */}
        <ellipse cx="50" cy="62" rx="28" ry="24" fill="url(#cf-fur)" />

        {/* forehead M-stripe (classic tabby) */}
        <g stroke="#6b3a16" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M 40 44 C 42 50, 44 54, 46 58" />
          <path d="M 50 42 C 50 48, 50 54, 50 58" />
          <path d="M 60 44 C 58 50, 56 54, 54 58" />
        </g>

        {/* muzzle / cheek — cream */}
        <ellipse cx="50" cy="74" rx="16" ry="10" fill="#fbe7c4" opacity="0.85" />
        {/* chin */}
        <ellipse cx="50" cy="80" rx="9" ry="4" fill="#fff3da" opacity="0.7" />

        {/* eyes */}
        <ellipse cx="40" cy="62" rx="4.2" ry="5" fill="url(#cf-eye)" />
        <ellipse cx="60" cy="62" rx="4.2" ry="5" fill="url(#cf-eye)" />
        {/* pupils — vertical slits */}
        <ellipse cx="40" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
        <ellipse cx="60" cy="62" rx="1.1" ry="4.2" fill="#0a0a0a" />
        {/* eye glints */}
        <circle cx="41.4" cy="60" r="1" fill="#ffffff" />
        <circle cx="61.4" cy="60" r="1" fill="#ffffff" />
        {/* eye outline */}
        <ellipse cx="40" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />
        <ellipse cx="60" cy="62" rx="4.2" ry="5" fill="none" stroke="#3a1d0a" strokeWidth="0.6" />

        {/* nose */}
        <path d="M 46 72 L 54 72 L 50 76 Z" fill="#7a3a2a" />
        <path d="M 46 72 L 54 72 L 50 76 Z" fill="none" stroke="#3a1d0a" strokeWidth="0.5" />
        {/* mouth */}
        <path d="M 50 76 L 50 79" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M 50 79 C 48 81, 45 81, 43.5 79.5" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M 50 79 C 52 81, 55 81, 56.5 79.5" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />

        {/* whiskers */}
        <g stroke="#3a1d0a" strokeWidth="0.6" strokeLinecap="round" opacity="0.75" fill="none">
          <path d="M 42 76 C 30 76, 22 74, 14 72" />
          <path d="M 42 78 C 30 80, 22 82, 14 84" />
          <path d="M 58 76 C 70 76, 78 74, 86 72" />
          <path d="M 58 78 C 70 80, 78 82, 86 84" />
        </g>
      </g>
    </svg>
  );
}
