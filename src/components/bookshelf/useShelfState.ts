import { useEffect, useState } from "react";

export function useShelfState(allIds: string[]) {
  const KEY = "shelf:onShelf";
  const [onShelf, setOnShelf] = useState<Set<string>>(() => new Set(allIds));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setOnShelf(new Set(arr.filter((id) => allIds.includes(id))));
      }
    } catch {
      // ignore
    }
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
