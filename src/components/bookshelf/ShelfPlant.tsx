type Props = {
  size?: number;
  blank?: boolean;
};

export function ShelfPlant({ size = 44, blank = false }: Props) {
  const slotH = size * 2.2;
  return (
    <div
      className="relative flex items-end justify-center self-end"
      style={{ width: size, height: slotH }}
      aria-label={blank ? "Empty plant slot" : "Decorative plant"}
    >
      {blank ? (
        <div
          className="flex h-full w-full items-center justify-center rounded-lg"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, rgba(255,255,255,0.05) 6px 12px)",
            border: "2px dashed rgba(0,0,0,0.32)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 0 3px rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: size * 0.7, lineHeight: 1, opacity: 0.55 }}>🪴</span>
        </div>
      ) : (
        <span style={{ fontSize: size * 0.85, lineHeight: 1, color: "var(--ink)" }}>🪴</span>
      )}
    </div>
  );
}
