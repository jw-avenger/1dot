type PetStyle = {
  body: string; // gradient
  head: string;
  accent: string;
};

const STYLES: Record<string, PetStyle> = {
  cat: { body: "linear-gradient(160deg,#e8b27a,#a8632e)", head: "#f0c79a", accent: "#5a2f10" },
  dog: { body: "linear-gradient(160deg,#f3a3b3,#b7445e)", head: "#f8c4cf", accent: "#5a1a2a" },
  dragon: { body: "linear-gradient(160deg,#7fd3b7,#1f7a5e)", head: "#a8e8d0", accent: "#0e3a2c" },
  phoenix: { body: "linear-gradient(160deg,#f7c2b0,#c95f4a)", head: "#fbd9cc", accent: "#5e1f12" },
  bird: { body: "linear-gradient(160deg,#9bc28a,#3f7236)", head: "#bcd8ad", accent: "#1f3a18" },
  hamster: { body: "linear-gradient(160deg,#dec39b,#8a6638)", head: "#ecdcb8", accent: "#3e2a14" },
};

type Props = {
  petId: string;
  size?: number;
};

/**
 * Tiny 3D-styled figurine — a small chess-piece-like silhouette with
 * gradient body, head, and inner shading. Rendered with pure CSS so it
 * matches the bookshelf's hand-built feel.
 */
export function PetFigurine({ petId, size = 56 }: Props) {
  const s = STYLES[petId] ?? STYLES.cat;
  const bodyW = size * 0.78;
  const bodyH = size * 0.62;
  const headD = size * 0.42;
  return (
    <div
      className="relative flex flex-col items-center justify-end"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* head */}
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
        {/* eye */}
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
      {/* body */}
      <div
        style={{
          width: bodyW,
          height: bodyH,
          background: s.body,
          borderRadius: `${bodyW * 0.5}px ${bodyW * 0.5}px ${bodyW * 0.18}px ${bodyW * 0.18}px`,
          boxShadow: `inset -3px -4px 6px rgba(0,0,0,0.28), inset 3px 3px 5px rgba(255,255,255,0.3), 0 4px 6px -3px rgba(0,0,0,0.4)`,
        }}
      />
      {/* shadow on shelf */}
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
