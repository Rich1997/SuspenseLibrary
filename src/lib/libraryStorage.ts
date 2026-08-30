// src/lib/libraryStorage.ts

export interface CustomList {
  id: string;
  name: string;
  createdAt: string;
  videoIds: string[];
}

const FAVORITES_KEY = 'suspense_favorites_v1';
const WATCH_LATER_KEY = 'suspense_watch_later_v1';
const CUSTOM_LISTS_KEY = 'suspense_custom_lists_v1';

export const LIBRARY_CHANGE_EVENT = 'suspense_library_change';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LIBRARY_CHANGE_EVENT));
  }
}

// --- Favorites ---

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading favorites from localStorage', e);
    return [];
  }
}

export function isFavorite(videoId: string): boolean {
  return getFavorites().includes(videoId);
}

export function toggleFavorite(videoId: string): boolean {
  const current = getFavorites();
  const index = current.indexOf(videoId);
  let isAdded = false;

  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.unshift(videoId);
    isAdded = true;
  }

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
    notifyChange();
  } catch (e) {
    console.error('Error writing favorites to localStorage', e);
  }

  return isAdded;
}

export function clearFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    notifyChange();
  } catch (e) {
    console.error('Error clearing favorites', e);
  }
}

// --- Watch Later ---

export function getWatchLater(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCH_LATER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading watch later from localStorage', e);
    return [];
  }
}

export function isInWatchLater(videoId: string): boolean {
  return getWatchLater().includes(videoId);
}

export function toggleWatchLater(videoId: string): boolean {
  const current = getWatchLater();
  const index = current.indexOf(videoId);
  let isAdded = false;

  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.unshift(videoId);
    isAdded = true;
  }

  try {
    localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(current));
    notifyChange();
  } catch (e) {
    console.error('Error writing watch later to localStorage', e);
  }

  return isAdded;
}

export function clearWatchLater(): void {
  try {
    localStorage.removeItem(WATCH_LATER_KEY);
    notifyChange();
  } catch (e) {
    console.error('Error clearing watch later', e);
  }
}

// --- Custom Lists ---

export function getCustomLists(): CustomList[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading custom lists from localStorage', e);
    return [];
  }
}

export function getCustomListById(id: string): CustomList | undefined {
  return getCustomLists().find((list) => list.id === id);
}

export function createCustomList(name: string): CustomList {
  const lists = getCustomLists();
  const newList: CustomList = {
    id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    videoIds: [],
  };

  lists.unshift(newList);

  try {
    localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
    notifyChange();
  } catch (e) {
    console.error('Error creating custom list', e);
  }

  return newList;
}

export function deleteCustomList(id: string): void {
  const lists = getCustomLists().filter((list) => list.id !== id);

  try {
    localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
    notifyChange();
  } catch (e) {
    console.error('Error deleting custom list', e);
  }
}

export function renameCustomList(id: string, newName: string): void {
  const lists = getCustomLists();
  const list = lists.find((l) => l.id === id);

  if (list && newName.trim()) {
    list.name = newName.trim();
    try {
      localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
      notifyChange();
    } catch (e) {
      console.error('Error renaming custom list', e);
    }
  }
}

export function toggleVideoInList(listId: string, videoId: string): boolean {
  const lists = getCustomLists();
  const list = lists.find((l) => l.id === listId);
  let isAdded = false;

  if (list) {
    const index = list.videoIds.indexOf(videoId);
    if (index >= 0) {
      list.videoIds.splice(index, 1);
    } else {
      list.videoIds.unshift(videoId);
      isAdded = true;
    }

    try {
      localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
      notifyChange();
    } catch (e) {
      console.error('Error updating custom list', e);
    }
  }

  return isAdded;
}

export function removeVideoFromList(listId: string, videoId: string): void {
  const lists = getCustomLists();
  const list = lists.find((l) => l.id === listId);

  if (list) {
    list.videoIds = list.videoIds.filter((id) => id !== videoId);

    try {
      localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
      notifyChange();
    } catch (e) {
      console.error('Error removing video from custom list', e);
    }
  }
}
