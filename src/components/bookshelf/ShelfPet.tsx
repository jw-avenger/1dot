import { useState } from "react";
import { useSettings, PETS } from "./useSettings";
import { PetFigurine } from "./PetFigurine";
import { CatFigurine } from "./CatFigurine";

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
      style={{ width: 64, height: 110 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onClick}
        aria-label={pet ? `Change ${pet.label} pet` : "Add a pet — currently empty"}
        className="group relative flex h-full w-full items-end justify-center overflow-hidden rounded-lg"
        style={{
          background: pet
            ? "transparent"
            : "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, rgba(255,255,255,0.05) 6px 12px)",
          border: pet ? "1px solid transparent" : "2px dashed rgba(0,0,0,0.32)",
          boxShadow: pet
            ? "none"
            : "inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 0 3px rgba(255,255,255,0.08)",
        }}
      >
        {pet ? (
          <div className="pb-1">
            {pet.id === "cat" ? <CatFigurine size={60} /> : <PetFigurine petId={pet.id} size={56} />}
          </div>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--ink)", fontSize: 28, lineHeight: 1 }}
          >
            🐈
          </span>
        )}
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
