type Props = {
  size?: number;
};

/**
 * Full-body 3D-styled cat figurine — modeled after the 🐈 emoji silhouette.
 * Pure CSS so it matches the bookshelf's hand-built feel. Side-profile pose:
 * head, ears, body, four legs, and an upright tail.
 */
export function CatFigurine({ size = 64 }: Props) {
  const w = size;
  const h = size;
  const bodyFill = "linear-gradient(165deg,#e8b27a 0%,#c98449 55%,#8a4f22 100%)";
  const bellyFill = "linear-gradient(180deg,#f5d3aa,#d8a070)";
  const accent = "#3a1d0a";

  return (
    <div
      className="relative"
      style={{ width: w, height: h }}
      aria-hidden
    >
      {/* tail */}
      <div
        style={{
          position: "absolute",
          right: w * 0.04,
          bottom: h * 0.28,
          width: w * 0.12,
          height: h * 0.55,
          background: bodyFill,
          borderRadius: w * 0.08,
          transform: "rotate(18deg)",
          boxShadow: "inset -2px 0 3px rgba(0,0,0,0.3), inset 2px 0 2px rgba(255,255,255,0.2)",
          zIndex: 1,
        }}
      />
      {/* body */}
      <div
        style={{
          position: "absolute",
          left: w * 0.16,
          bottom: h * 0.18,
          width: w * 0.62,
          height: h * 0.38,
          background: bodyFill,
          borderRadius: `${w * 0.32}px ${w * 0.32}px ${w * 0.18}px ${w * 0.22}px`,
          boxShadow:
            "inset -3px -4px 6px rgba(0,0,0,0.28), inset 3px 3px 5px rgba(255,255,255,0.28)",
          zIndex: 3,
        }}
      />
      {/* belly highlight */}
      <div
        style={{
          position: "absolute",
          left: w * 0.24,
          bottom: h * 0.2,
          width: w * 0.42,
          height: h * 0.18,
          background: bellyFill,
          borderRadius: "50%",
          opacity: 0.7,
          zIndex: 4,
        }}
      />
      {/* front leg */}
      <div
        style={{
          position: "absolute",
          left: w * 0.22,
          bottom: h * 0.04,
          width: w * 0.12,
          height: h * 0.2,
          background: bodyFill,
          borderRadius: `${w * 0.06}px ${w * 0.06}px ${w * 0.04}px ${w * 0.04}px`,
          boxShadow: "inset -2px -2px 3px rgba(0,0,0,0.3)",
          zIndex: 5,
        }}
      />
      {/* back leg */}
      <div
        style={{
          position: "absolute",
          left: w * 0.56,
          bottom: h * 0.04,
          width: w * 0.14,
          height: h * 0.18,
          background: bodyFill,
          borderRadius: `${w * 0.07}px ${w * 0.07}px ${w * 0.04}px ${w * 0.04}px`,
          boxShadow: "inset -2px -2px 3px rgba(0,0,0,0.3)",
          zIndex: 5,
        }}
      />
      {/* head */}
      <div
        style={{
          position: "absolute",
          left: w * 0.06,
          bottom: h * 0.42,
          width: w * 0.36,
          height: h * 0.34,
          background: bodyFill,
          borderRadius: "50%",
          boxShadow:
            "inset -3px -3px 5px rgba(0,0,0,0.28), inset 2px 2px 4px rgba(255,255,255,0.32)",
          zIndex: 6,
        }}
      >
        {/* left ear */}
        <div
          style={{
            position: "absolute",
            top: -h * 0.08,
            left: w * 0.02,
            width: 0,
            height: 0,
            borderLeft: `${w * 0.06}px solid transparent`,
            borderRight: `${w * 0.06}px solid transparent`,
            borderBottom: `${h * 0.12}px solid #b06a30`,
            transform: "rotate(-15deg)",
          }}
        />
        {/* right ear */}
        <div
          style={{
            position: "absolute",
            top: -h * 0.08,
            right: w * 0.02,
            width: 0,
            height: 0,
            borderLeft: `${w * 0.06}px solid transparent`,
            borderRight: `${w * 0.06}px solid transparent`,
            borderBottom: `${h * 0.12}px solid #b06a30`,
            transform: "rotate(15deg)",
          }}
        />
        {/* eye */}
        <span
          style={{
            position: "absolute",
            top: "45%",
            right: "22%",
            width: w * 0.04,
            height: w * 0.04,
            borderRadius: "50%",
            background: accent,
          }}
        />
        {/* nose */}
        <span
          style={{
            position: "absolute",
            top: "62%",
            right: "12%",
            width: w * 0.03,
            height: w * 0.025,
            borderRadius: "50%",
            background: "#5a2a14",
          }}
        />
      </div>
      {/* shadow */}
      <div
        style={{
          position: "absolute",
          left: w * 0.18,
          bottom: 0,
          width: w * 0.6,
          height: 4,
          background: "rgba(0,0,0,0.28)",
          borderRadius: "50%",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}
