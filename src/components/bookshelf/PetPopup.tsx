import { useEffect, useState } from "react";
import { ConfirmSheet, SheetButton, SHEET_FG } from "./ConfirmSheet";
import { PETS, useSettings, type PetConfig } from "./useSettings";
import type { Book } from "./books";

type Props = {
  book: Book | null;
  onClose: () => void;
};

const SUGGESTED = [
  "Drink a glass of water",
  "Stretch for 30 seconds",
  "Take three slow breaths",
  "Tidy one small surface",
  "Send one kind message",
];

export function PetPopup({ book, onClose }: Props) {
  const { petsConfig, setPetConfig } = useSettings();
  const existing = book ? petsConfig[book.id] : undefined;
  const [phase, setPhase] = useState<"ask" | "configure">("ask");
  const [draft, setDraft] = useState<PetConfig>({
    pet: null,
    animations: true,
    todoEnabled: false,
    todoItems: [],
  });
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (!book) return;
    if (existing) {
      setDraft(existing);
      setPhase("configure");
    } else {
      setDraft({ pet: null, animations: true, todoEnabled: false, todoItems: [] });
      setPhase("ask");
    }
    setNewTodo("");
  }, [book, existing]);

  if (!book) return null;

  const save = () => {
    if (!draft.pet) return;
    setPetConfig(book.id, draft);
    onClose();
  };
  const remove = () => {
    setPetConfig(book.id, null);
    onClose();
  };

  return (
    <ConfirmSheet open={!!book} onClose={onClose} maxWidth={380}>
      {phase === "ask" ? (
        <>
          <p className="mb-5 text-center text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            Would you like pet support today?
          </p>
          <div className="flex gap-3">
            <SheetButton full onClick={() => setPhase("configure")} variant="primary">Yes</SheetButton>
            <SheetButton full onClick={onClose}>No</SheetButton>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-sm opacity-80">Choose a friend for {book.title}</p>

          <div className="grid grid-cols-2 gap-2">
            {PETS.map((p) => {
              const active = draft.pet === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setDraft({ ...draft, pet: p.id })}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition"
                  style={{
                    backgroundColor: active ? SHEET_FG : "rgba(255,255,255,0.05)",
                    color: active ? "#2b2b30" : SHEET_FG,
                    border: `1px solid ${active ? SHEET_FG : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>

          <Row
            checked={draft.animations}
            onChange={(v) => setDraft({ ...draft, animations: v })}
            label="Enable light animations"
          />
          <Row
            checked={draft.todoEnabled}
            onChange={(v) => setDraft({ ...draft, todoEnabled: v })}
            label="Simple editable pet to-do list"
          />

          {draft.todoEnabled && (
            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <p className="mb-2 text-xs opacity-70">A few gentle suggestions — keep what helps:</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.filter((s) => !draft.todoItems.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => setDraft({ ...draft, todoItems: [...draft.todoItems, s] })}
                    className="rounded-full border px-2 py-0.5 text-[11px] opacity-80 transition hover:opacity-100"
                    style={{ borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
              <ul className="mb-2 space-y-1">
                {draft.todoItems.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">• {t}</span>
                    <button
                      onClick={() =>
                        setDraft({ ...draft, todoItems: draft.todoItems.filter((_, j) => j !== i) })
                      }
                      className="text-xs opacity-50 hover:opacity-90"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add your own"
                  className="flex-1 rounded-md border bg-transparent px-2 py-1 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: SHEET_FG }}
                />
                <button
                  onClick={() => {
                    const v = newTodo.trim();
                    if (!v) return;
                    setDraft({ ...draft, todoItems: [...draft.todoItems, v] });
                    setNewTodo("");
                  }}
                  className="rounded-md px-3 text-sm"
                  style={{ backgroundColor: SHEET_FG, color: "#2b2b30" }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <SheetButton full variant="primary" onClick={save}>
              Save for now? You can change anything at any time.
            </SheetButton>
            {existing && (
              <SheetButton full variant="danger" onClick={remove}>
                Remove pet
              </SheetButton>
            )}
            <SheetButton full onClick={onClose}>Cancel</SheetButton>
          </div>
        </div>
      )}
    </ConfirmSheet>
  );
}

function Row({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition"
      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]"
        style={{
          borderColor: "rgba(255,255,255,0.35)",
          backgroundColor: checked ? SHEET_FG : "transparent",
          color: "#2b2b30",
        }}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{label}</span>
    </button>
  );
}
