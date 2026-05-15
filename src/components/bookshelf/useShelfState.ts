import { useEffect, useState } from "react";

const KEY = "shelf:onShelf";

function readBookShelf(allIds: string[]) {
  if (typeof window === "undefined") return new Set(allIds);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set(allIds);
    const arr = JSON.parse(raw) as string[];
    const bookIds = arr.filter((id) => allIds.includes(id));
    return new Set(bookIds);
  } catch {
    return new Set(allIds);
  }
}

export function useShelfState(allIds: string[]) {
  const [onShelf, setOnShelf] = useState<Set<string>>(() => readBookShelf(allIds));

  useEffect(() => {
    setOnShelf(readBookShelf(allIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: Set<string>) => {
    setOnShelf(new Set(next));
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  };

  const toggle = (id: string) => {
    const next = new Set(onShelf);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  };

  const reshelveAll = () => persist(new Set(allIds));

  return { onShelf, toggle, reshelveAll };
}
