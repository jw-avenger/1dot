import { useState } from "react";
import { useSettings, PETS } from "./useSettings";

type Props = {
  onClick: () => void;
};

export function ShelfPet({ onClick }: Props) {
  const { petsConfig, setPetConfig } = useSettings();
  const cfg = petsConfig["shelf"];
  const pet = cfg?.pet ? PETS.find((p) => p.id === cfg.pet) : null;
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative ml-1 flex flex-col items-center justify-end self-end"
      style={{ width: 44, height: 100 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onClick}
        aria-label={pet ? `Change ${pet.label} pet` : "Add a pet"}
        className="flex h-full w-full items-center justify-center rounded-md border border-dashed transition hover:border-wood/60"
        style={{
          borderColor: pet ? "transparent" : "rgba(0,0,0,0.18)",
          backgroundColor: pet ? "transparent" : "rgba(255,255,255,0.04)",
          fontSize: pet ? 30 : 14,
          color: "var(--ink)",
          opacity: pet ? 1 : 0.55,
        }}
      >
        {pet ? pet.emoji : "·"}
      </button>
      {pet && hover && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPetConfig("shelf", null);
          }}
          aria-label="Remove pet"
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-wood-dark text-[10px] text-paper shadow"
        >
          ×
        </button>
      )}
    </div>
  );
}
