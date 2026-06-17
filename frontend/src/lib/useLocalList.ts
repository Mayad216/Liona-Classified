import { useCallback, useEffect, useState } from "react";

/**
 * Tiny localStorage-backed list hook with cross-tab + cross-component sync.
 * Stores arrays of primitive ids/strings or JSON-serialisable objects.
 */
export function useLocalList<T extends string | number>(key: string) {
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  };
  const [items, setItems] = useState<T[]>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setItems(read());
    };
    const onCustom = () => setItems(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener(`local-list:${key}`, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(`local-list:${key}`, onCustom);
    };
  }, [key]);

  const persist = useCallback(
    (next: T[]) => {
      localStorage.setItem(key, JSON.stringify(next));
      setItems(next);
      window.dispatchEvent(new CustomEvent(`local-list:${key}`));
    },
    [key]
  );

  const add = useCallback(
    (item: T) => {
      const cur = read();
      if (cur.includes(item)) return;
      persist([...cur, item]);
    },
    [persist]
  );

  const remove = useCallback(
    (item: T) => persist(read().filter((x) => x !== item)),
    [persist]
  );

  const toggle = useCallback(
    (item: T) => {
      const cur = read();
      if (cur.includes(item)) persist(cur.filter((x) => x !== item));
      else persist([...cur, item]);
    },
    [persist]
  );

  const has = useCallback((item: T) => items.includes(item), [items]);
  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, toggle, has, clear, set: persist };
}

/**
 * Hook for arbitrary JSON records keyed by their `id` field.
 */
export function useLocalRecords<T extends { id: string }>(key: string) {
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  };
  const [items, setItems] = useState<T[]>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setItems(read());
    };
    const onCustom = () => setItems(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener(`local-records:${key}`, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(`local-records:${key}`, onCustom);
    };
  }, [key]);

  const persist = (next: T[]) => {
    localStorage.setItem(key, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new CustomEvent(`local-records:${key}`));
  };

  const upsert = (rec: T) => {
    const cur = read();
    const idx = cur.findIndex((r) => r.id === rec.id);
    if (idx >= 0) {
      const next = [...cur];
      next[idx] = rec;
      persist(next);
    } else persist([...cur, rec]);
  };

  const remove = (id: string) => persist(read().filter((r) => r.id !== id));
  const clear = () => persist([]);

  return { items, upsert, remove, clear };
}
