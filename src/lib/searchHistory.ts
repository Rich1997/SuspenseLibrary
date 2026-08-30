import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'suspense_search_history';
const SEARCH_HISTORY_EVENT = 'suspense_search_history_updated';
const MAX_HISTORY_ITEMS = 50;

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(term: string): void {
  const cleanTerm = term.trim();
  if (!cleanTerm) return;

  try {
    const current = getSearchHistory();
    const filtered = current.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
  } catch (err) {
    console.error('Failed to save search history:', err);
  }
}

export function removeSearchHistory(term: string): void {
  const cleanTerm = term.trim().toLowerCase();
  try {
    const current = getSearchHistory();
    const updated = current.filter((item) => item.toLowerCase() !== cleanTerm);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
  } catch (err) {
    console.error('Failed to remove search history item:', err);
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(getSearchHistory());
    };

    window.addEventListener(SEARCH_HISTORY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SEARCH_HISTORY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addSearch = useCallback((term: string) => {
    addSearchHistory(term);
  }, []);

  const removeSearch = useCallback((term: string) => {
    removeSearchHistory(term);
  }, []);

  const clearHistory = useCallback(() => {
    clearSearchHistory();
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
