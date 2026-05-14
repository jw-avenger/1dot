type Props = {
  size?: number;
};

/**
 * Full-body cat figurine rendered as SVG — a sitting side-profile tabby
 * with a curled tail, ear tufts, whiskers, and soft 3D shading.
 */
export function CatFigurine({ size = 64 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="cat-fur" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#f6cf9a" />
          <stop offset="55%" stopColor="#d29156" />
          <stop offset="100%" stopColor="#7a4318" />
        </radialGradient>
        <linearGradient id="cat-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe3c2" stopOpacity="0.0" />
          <stop offset="60%" stopColor="#fbe3c2" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f1c896" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="cat-ear-inner" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#f4a8b4" />
          <stop offset="100%" stopColor="#a35a55" />
        </radialGradient>
        <radialGradient id="cat-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a8e063" />
          <stop offset="100%" stopColor="#3a6b1f" />
        </radialGradient>
        <filter id="cat-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      {/* shelf shadow */}
      <ellipse cx="52" cy="93" rx="32" ry="3" fill="rgba(0,0,0,0.28)" filter="url(#cat-shadow)" />

      {/* tail — curled up behind body */}
      <path
        d="M78,72 C92,62 92,42 78,38 C70,36 66,46 72,52 C76,56 80,60 76,66"
        fill="none"
        stroke="url(#cat-fur)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* tail tip highlight */}
      <path
        d="M78,72 C90,63 90,44 79,40"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* hind/body — sitting silhouette */}
      <path
        d="M30,88 C20,86 18,72 24,60 C28,50 38,44 52,44 C68,44 78,52 80,66 C82,78 76,88 70,90 Z"
        fill="url(#cat-fur)"
      />
      {/* belly */}
      <ellipse cx="50" cy="76" rx="20" ry="14" fill="url(#cat-belly)" />

      {/* front legs */}
      <path d="M40,90 C39,82 39,76 43,74 C47,73 49,80 48,90 Z" fill="url(#cat-fur)" />
      <path d="M56,90 C55,82 55,76 59,74 C63,73 65,80 64,90 Z" fill="url(#cat-fur)" />
      {/* paw shading */}
      <ellipse cx="44" cy="89" rx="4.5" ry="1.6" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="60" cy="89" rx="4.5" ry="1.6" fill="rgba(0,0,0,0.25)" />

      {/* head */}
      <g>
        {/* ears */}
        <path d="M28,30 L34,12 L42,28 Z" fill="url(#cat-fur)" />
        <path d="M30,28 L34,18 L40,28 Z" fill="url(#cat-ear-inner)" />
        <path d="M70,30 L66,12 L58,28 Z" fill="url(#cat-fur)" />
        <path d="M68,28 L64,18 L60,28 Z" fill="url(#cat-ear-inner)" />

        {/* head shape — slightly wider than tall */}
        <ellipse cx="50" cy="38" rx="22" ry="20" fill="url(#cat-fur)" />

        {/* cheek/muzzle highlight */}
        <ellipse cx="50" cy="46" rx="11" ry="7" fill="#fbe3c2" opacity="0.55" />

        {/* eyes */}
        <ellipse cx="42" cy="36" rx="3" ry="4" fill="url(#cat-eye)" />
        <ellipse cx="58" cy="36" rx="3" ry="4" fill="url(#cat-eye)" />
        {/* pupils */}
        <ellipse cx="42" cy="36" rx="0.9" ry="3.4" fill="#1a1a1a" />
        <ellipse cx="58" cy="36" rx="0.9" ry="3.4" fill="#1a1a1a" />
        {/* eye glints */}
        <circle cx="43" cy="34.5" r="0.7" fill="#ffffff" />
        <circle cx="59" cy="34.5" r="0.7" fill="#ffffff" />

        {/* nose */}
        <path d="M48,44 L52,44 L50,47 Z" fill="#7a3a2a" />
        {/* mouth */}
        <path d="M50,47 C49,49 47,49 46,48" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M50,47 C51,49 53,49 54,48" fill="none" stroke="#3a1d0a" strokeWidth="0.7" strokeLinecap="round" />

        {/* whiskers */}
        <g stroke="#3a1d0a" strokeWidth="0.5" strokeLinecap="round" opacity="0.7">
          <line x1="42" y1="46" x2="32" y2="44" />
          <line x1="42" y1="47" x2="32" y2="48" />
          <line x1="58" y1="46" x2="68" y2="44" />
          <line x1="58" y1="47" x2="68" y2="48" />
        </g>

        {/* forehead tabby stripes */}
        <g stroke="#5a2f10" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" fill="none">
          <path d="M46,22 C47,25 47,27 46,29" />
          <path d="M50,21 C51,24 51,27 50,29" />
          <path d="M54,22 C53,25 53,27 54,29" />
        </g>
      </g>
    </svg>
  );
}
