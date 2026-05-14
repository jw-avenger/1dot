import { useState } from "react";
import { BOOKS } from "./books";
import { useSettings } from "./useSettings";

export function SidePanel() {
  const [open, setOpen] = useState(false);
  const { colors, setBookColor } = useSettings();

  const resolveColor = (id: string, fallback: string) => {
    const c = colors[id] ?? fallback;
    if (c.startsWith("#")) return c;
    // var(--..) — fall back to a neutral hex for the input
    return "#888888";
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open side menu"
        className="fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-l-lg px-3 py-4 text-xs uppercase tracking-[0.25em] shadow-lg transition hover:translate-x-0"
        style={{
          backgroundColor: "#2b2b30",
          color: "#e6e3da",
          writingMode: "vertical-rl",
        }}
      >
        {open ? "Close" : "Menu"}
      </button>

      <aside
        className="fixed right-0 top-0 z-40 h-full w-80 overflow-y-auto p-6 shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: "#2b2b30",
          color: "#e6e3da",
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
        }}
        aria-hidden={!open}
      >
        <p className="text-[10px] uppercase tracking-[0.35em] opacity-60">Workshop</p>
        <h2 className="mt-1 font-serif text-2xl">Customize</h2>
        <p className="mt-2 text-xs opacity-60">
          Pick a hue for each book on the shelf.
        </p>

        <ul className="mt-6 space-y-3">
          {BOOKS.map((b) => {
            const hex = resolveColor(b.id, b.spine);
            const isCustom = !!colors[b.id];
            return (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-md px-2 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <label
                  className="relative inline-block h-7 w-7 cursor-pointer overflow-hidden rounded border"
                  style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: hex }}
                >
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => setBookColor(b.id, e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <span className="flex-1 font-serif text-sm">{b.title}</span>
                {isCustom && (
                  <button
                    onClick={() => setBookColor(b.id, null)}
                    className="text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100"
                  >
                    reset
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
