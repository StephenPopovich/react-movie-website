import { useEffect, useRef, useState } from "react";

/**
 * useLocalStorage
 * - JSON-serializes values
 * - Debounces writes to avoid spamming localStorage
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initialValue === "function" ? initialValue() : initialValue);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }, 150);
    return () => clearTimeout(id);
  }, [key, value]);

  return [value, setValue];
}
