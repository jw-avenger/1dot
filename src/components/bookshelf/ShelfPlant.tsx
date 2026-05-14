type Props = {
  size?: number;
};

export function ShelfPlant({ size = 44 }: Props) {
  return (
    <div
      className="flex items-end justify-center self-end"
      style={{ width: size, height: size * 2.2 }}
      aria-label="Decorative plant"
    >
      <span style={{ fontSize: size * 0.85, lineHeight: 1, color: "var(--ink)" }}>
        🪴
      </span>
    </div>
  );
}
