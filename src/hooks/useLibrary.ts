// src/hooks/useLibrary.ts
import { useState, useEffect, useCallback } from 'react';
import type { CustomList } from '@/lib/libraryStorage';
import {
  LIBRARY_CHANGE_EVENT,
  getFavorites,
  getWatchLater,
  getCustomLists,
  toggleFavorite as storageToggleFavorite,
  clearFavorites as storageClearFavorites,
  toggleWatchLater as storageToggleWatchLater,
  clearWatchLater as storageClearWatchLater,
  createCustomList as storageCreateCustomList,
  deleteCustomList as storageDeleteCustomList,
  renameCustomList as storageRenameCustomList,
  toggleVideoInList as storageToggleVideoInList,
  removeVideoFromList as storageRemoveVideoFromList,
} from '@/lib/libraryStorage';

export function useLibrary() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [watchLater, setWatchLater] = useState<string[]>(() => getWatchLater());
  const [customLists, setCustomLists] = useState<CustomList[]>(() => getCustomLists());

  const syncState = useCallback(() => {
    setFavorites(getFavorites());
    setWatchLater(getWatchLater());
    setCustomLists(getCustomLists());
  }, []);

  useEffect(() => {
    syncState();

    const handleCustomEvent = () => syncState();
    const handleStorageEvent = (e: StorageEvent) => {
      if (
        e.key === 'suspense_favorites_v1' ||
        e.key === 'suspense_watch_later_v1' ||
        e.key === 'suspense_custom_lists_v1'
      ) {
        syncState();
      }
    };

    window.addEventListener(LIBRARY_CHANGE_EVENT, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(LIBRARY_CHANGE_EVENT, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [syncState]);

  const toggleFavorite = useCallback((videoId: string) => {
    return storageToggleFavorite(videoId);
  }, []);

  const clearFavorites = useCallback(() => {
    storageClearFavorites();
  }, []);

  const toggleWatchLater = useCallback((videoId: string) => {
    return storageToggleWatchLater(videoId);
  }, []);

  const clearWatchLater = useCallback(() => {
    storageClearWatchLater();
  }, []);

  const createCustomList = useCallback((name: string) => {
    return storageCreateCustomList(name);
  }, []);

  const deleteCustomList = useCallback((id: string) => {
    storageDeleteCustomList(id);
  }, []);

  const renameCustomList = useCallback((id: string, newName: string) => {
    storageRenameCustomList(id, newName);
  }, []);

  const toggleVideoInList = useCallback((listId: string, videoId: string) => {
    return storageToggleVideoInList(listId, videoId);
  }, []);

  const removeVideoFromList = useCallback((listId: string, videoId: string) => {
    storageRemoveVideoFromList(listId, videoId);
  }, []);

  const isFavorite = useCallback((videoId: string) => favorites.includes(videoId), [favorites]);
  const isInWatchLater = useCallback((videoId: string) => watchLater.includes(videoId), [watchLater]);
  const isVideoInList = useCallback(
    (listId: string, videoId: string) => {
      const list = customLists.find((l) => l.id === listId);
      return list ? list.videoIds.includes(videoId) : false;
    },
    [customLists]
  );

  return {
    favorites,
    watchLater,
    customLists,
    isFavorite,
    isInWatchLater,
    isVideoInList,
    toggleFavorite,
    clearFavorites,
    toggleWatchLater,
    clearWatchLater,
    createCustomList,
    deleteCustomList,
    renameCustomList,
    toggleVideoInList,
    removeVideoFromList,
  };
}
