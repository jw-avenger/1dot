type Props = {
  size?: number;
};

/**
 * Cat figurine modeled after the 🐈 emoji — side profile, four legs on the
 * ground, body horizontal, tail held high with a slight curl, head facing
 * forward (left).
 */
export function CatFigurine({ size = 64 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="cat-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1c187" />
          <stop offset="55%" stopColor="#cf8a4a" />
          <stop offset="100%" stopColor="#7d4318" />
        </linearGradient>
        <linearGradient id="cat-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7d4a6" stopOpacity="0" />
          <stop offset="100%" stopColor="#fbe3c2" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="cat-ear" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#e89aa6" />
          <stop offset="100%" stopColor="#8a4a48" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="92" rx="44" ry="3" fill="rgba(0,0,0,0.3)" />

      {/* TAIL — held high with gentle curl, originating from rear (right) */}
      <path
        d="M96,68 C108,58 110,38 100,28 C94,22 88,28 92,34 C96,40 96,48 90,52"
        fill="none"
        stroke="url(#cat-fur)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* BODY — long horizontal oval, slight arch over the back */}
      <path
        d="M28,72
           C24,58 38,50 60,50
           C82,50 98,58 96,72
           C96,80 88,82 60,82
           C32,82 28,80 28,72 Z"
        fill="url(#cat-fur)"
      />
      {/* belly shading */}
      <path
        d="M34,74 C42,82 80,82 92,74 C90,82 80,84 60,84 C40,84 36,82 34,74 Z"
        fill="url(#cat-belly)"
      />

      {/* LEGS — four standing legs, front pair (left) and back pair (right). */}
      {/* back legs */}
      <rect x="80" y="74" width="7" height="16" rx="3" fill="url(#cat-fur)" />
      <rect x="89" y="76" width="7" height="14" rx="3" fill="#a86a32" />
      {/* front legs */}
      <rect x="32" y="74" width="7" height="16" rx="3" fill="url(#cat-fur)" />
      <rect x="41" y="76" width="7" height="14" rx="3" fill="#a86a32" />
      {/* paws */}
      <ellipse cx="35.5" cy="90" rx="4.5" ry="1.6" fill="#5a2f10" />
      <ellipse cx="44.5" cy="90" rx="4.5" ry="1.6" fill="#5a2f10" />
      <ellipse cx="83.5" cy="90" rx="4.5" ry="1.6" fill="#5a2f10" />
      <ellipse cx="92.5" cy="90" rx="4.5" ry="1.6" fill="#5a2f10" />

      {/* HEAD — round, facing forward (left side of body) */}
      <g>
        {/* ears (triangular, on top of head) */}
        <path d="M14,38 L16,22 L26,34 Z" fill="url(#cat-fur)" />
        <path d="M17,34 L18,26 L24,33 Z" fill="url(#cat-ear)" />
        <path d="M40,38 L38,22 L28,34 Z" fill="url(#cat-fur)" />
        <path d="M37,34 L36,26 L30,33 Z" fill="url(#cat-ear)" />

        {/* head circle */}
        <circle cx="27" cy="46" r="17" fill="url(#cat-fur)" />

        {/* muzzle highlight */}
        <ellipse cx="22" cy="52" rx="9" ry="6" fill="#fbe3c2" opacity="0.7" />

        {/* eyes — slightly almond, looking forward */}
        <ellipse cx="20" cy="44" rx="2" ry="2.6" fill="#2a4a16" />
        <ellipse cx="30" cy="44" rx="2" ry="2.6" fill="#2a4a16" />
        <ellipse cx="20" cy="44" rx="0.6" ry="2.2" fill="#0a0a0a" />
        <ellipse cx="30" cy="44" rx="0.6" ry="2.2" fill="#0a0a0a" />

        {/* nose */}
        <path d="M23.5,52 L26.5,52 L25,54 Z" fill="#5a2418" />
        {/* mouth */}
        <path d="M25,54 C24,55.5 22.5,55.5 21.8,54.7" fill="none" stroke="#3a1d0a" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M25,54 C26,55.5 27.5,55.5 28.2,54.7" fill="none" stroke="#3a1d0a" strokeWidth="0.6" strokeLinecap="round" />

        {/* whiskers */}
        <g stroke="#3a1d0a" strokeWidth="0.5" strokeLinecap="round" opacity="0.75">
          <line x1="20" y1="52" x2="8" y2="50" />
          <line x1="20" y1="53" x2="8" y2="54" />
          <line x1="30" y1="52" x2="42" y2="50" />
          <line x1="30" y1="53" x2="42" y2="54" />
        </g>
      </g>

      {/* subtle tabby stripes on body */}
      <g stroke="#6b3a16" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" fill="none">
        <path d="M55,52 C56,58 56,62 55,66" />
        <path d="M65,52 C66,58 66,62 65,66" />
        <path d="M75,52 C76,58 76,62 75,66" />
        <path d="M85,54 C86,60 86,64 85,68" />
      </g>
    </svg>
  );
}
