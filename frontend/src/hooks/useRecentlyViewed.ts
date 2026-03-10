import { useEffect } from "react";

const MAX_RECENT = 10;
const KEY = "shopx_recently_viewed";

export const useRecentlyViewed = (productId?: string) => {
  useEffect(() => {
    if (!productId) return;
    const existing: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const filtered = existing.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }, [productId]);
};

export const getRecentlyViewed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(KEY);
};
