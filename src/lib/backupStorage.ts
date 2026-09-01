import { useState, useEffect } from 'react';
import type { CustomList } from './libraryStorage';
import { getFavorites, getWatchLater, getCustomLists, LIBRARY_CHANGE_EVENT } from './libraryStorage';
import { getStoredProfileName, setStoredProfileName } from '@/hooks/useUserProfile';
import { getRecentlyPlayedVideoIds } from './recentlyPlayed';

export interface LibraryBackup {
  version: number;
  exportedAt: string;
  app: string;
  profile?: {
    name: string;
  };
  favorites?: string[];
  watchLater?: string[];
  customLists?: CustomList[];
  history?: string[];
}

export type BackupDomain = 'profile' | 'favorites' | 'watchLater' | 'customLists' | 'history';

export interface ImportOptions {
  mode: 'merge' | 'replace';
  domains?: BackupDomain[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  backup?: LibraryBackup;
  summary?: {
    profileName?: string;
    favoritesCount: number;
    watchLaterCount: number;
    customListsCount: number;
    historyCount: number;
  };
}

const FAVORITES_KEY = 'suspense_favorites_v1';
const WATCH_LATER_KEY = 'suspense_watch_later_v1';
const CUSTOM_LISTS_KEY = 'suspense_custom_lists_v1';
const HISTORY_KEY = 'suspense_library_recently_played';
const LAST_BACKUP_KEY = 'suspense_last_backup_time';
export const BACKUP_UPDATED_EVENT = 'suspense_backup_updated';

function notifyEvents() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LIBRARY_CHANGE_EVENT));
    window.dispatchEvent(new CustomEvent('suspense-profile-updated'));
    window.dispatchEvent(new Event('recently_played_updated'));
  }
}

/**
 * Get stored last backup timestamp ISO string
 */
export function getLastBackupTime(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/**
 * Record last backup timestamp
 */
export function setLastBackupTime(isoString?: string): void {
  if (typeof window === 'undefined') return;
  const time = isoString || new Date().toISOString();
  try {
    localStorage.setItem(LAST_BACKUP_KEY, time);
    window.dispatchEvent(new CustomEvent(BACKUP_UPDATED_EVENT, { detail: time }));
  } catch (err) {
    console.error('Failed to save last backup time:', err);
  }
}

/**
 * Format ISO string into clean relative time (e.g. "Just now", "2 mins ago", "3 hours ago")
 */
export function formatRelativeBackupTime(isoString: string | null): string {
  if (!isoString) return 'Never';
  try {
    const backupDate = new Date(isoString);
    if (isNaN(backupDate.getTime())) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - backupDate.getTime();
    if (diffMs < 0) return 'Just now';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

    return backupDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Never';
  }
}

/**
 * Custom React Hook to consume live last backup time
 */
export function useLastBackup() {
  const [lastBackupTime, setLastBackupTimeState] = useState<string | null>(getLastBackupTime);

  useEffect(() => {
    const handleBackupUpdate = () => {
      setLastBackupTimeState(getLastBackupTime());
    };

    window.addEventListener(BACKUP_UPDATED_EVENT, handleBackupUpdate);
    window.addEventListener('storage', handleBackupUpdate);

    return () => {
      window.removeEventListener(BACKUP_UPDATED_EVENT, handleBackupUpdate);
      window.removeEventListener('storage', handleBackupUpdate);
    };
  }, []);

  return {
    lastBackupTime,
    formattedLastBackup: formatRelativeBackupTime(lastBackupTime),
  };
}

/**
 * Generate full library backup payload
 */
export function generateFullBackup(): LibraryBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'SuspenseLibrary',
    profile: {
      name: getStoredProfileName(),
    },
    favorites: getFavorites(),
    watchLater: getWatchLater(),
    customLists: getCustomLists(),
    history: getRecentlyPlayedVideoIds(),
  };
}

/**
 * Export full or partial backup as a downloadable JSON file with time up to second.
 * Uses native showSaveFilePicker when available so user cancellation does not trigger timestamp update.
 */
export async function downloadBackupFile(domains?: BackupDomain[]): Promise<boolean> {
  const fullBackup = generateFullBackup();
  let exportData: Partial<LibraryBackup> = {
    version: fullBackup.version,
    exportedAt: fullBackup.exportedAt,
    app: fullBackup.app,
  };

  if (!domains || domains.length === 0) {
    exportData = fullBackup;
  } else {
    if (domains.includes('profile')) exportData.profile = fullBackup.profile;
    if (domains.includes('favorites')) exportData.favorites = fullBackup.favorites;
    if (domains.includes('watchLater')) exportData.watchLater = fullBackup.watchLater;
    if (domains.includes('customLists')) exportData.customLists = fullBackup.customLists;
    if (domains.includes('history')) exportData.history = fullBackup.history;
  }

  const jsonString = JSON.stringify(exportData, null, 2);

  // Format date and time up to the second: YYYY-MM-DD_HH-mm-ss
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const timeStr = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  const domainLabel = domains && domains.length === 1 ? `_${domains[0]}` : '';
  const suggestedName = `suspense_library_backup${domainLabel}_${timeStr}.json`;

  let savedSuccessfully = false;

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      savedSuccessfully = true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User explicitly cancelled save dialog — do NOT update backup timestamp
        return false;
      }
    }
  }

  if (!savedSuccessfully) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    savedSuccessfully = true;
  }

  if (savedSuccessfully) {
    // Only update last backup timestamp when file was saved successfully
    setLastBackupTime(fullBackup.exportedAt);
  }

  return savedSuccessfully;
}

/**
 * Validate untrusted JSON input against LibraryBackup schema
 */
export function validateBackupContent(content: string): ValidationResult {
  try {
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { valid: false, error: 'File content must be a valid JSON object.' };
    }

    const favorites = Array.isArray(parsed.favorites)
      ? parsed.favorites.filter((i: unknown): i is string => typeof i === 'string')
      : [];

    const watchLater = Array.isArray(parsed.watchLater)
      ? parsed.watchLater.filter((i: unknown): i is string => typeof i === 'string')
      : [];

    const history = Array.isArray(parsed.history)
      ? parsed.history.filter((i: unknown): i is string => typeof i === 'string')
      : [];

    const customLists: CustomList[] = [];
    if (Array.isArray(parsed.customLists)) {
      for (const item of parsed.customLists) {
        if (item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string') {
          customLists.push({
            id: String(item.id),
            name: String(item.name),
            createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
            videoIds: Array.isArray(item.videoIds)
              ? item.videoIds.filter((id: unknown): id is string => typeof id === 'string')
              : [],
          });
        }
      }
    }

    const profileName =
      parsed.profile && typeof parsed.profile.name === 'string' && parsed.profile.name.trim()
        ? parsed.profile.name.trim()
        : undefined;

    const hasAnyData =
      profileName !== undefined ||
      favorites.length > 0 ||
      watchLater.length > 0 ||
      customLists.length > 0 ||
      history.length > 0;

    if (!hasAnyData) {
      return { valid: false, error: 'Backup file does not contain any valid library data.' };
    }

    const cleanBackup: LibraryBackup = {
      version: typeof parsed.version === 'number' ? parsed.version : 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      app: 'SuspenseLibrary',
      profile: profileName ? { name: profileName } : undefined,
      favorites,
      watchLater,
      customLists,
      history,
    };

    return {
      valid: true,
      backup: cleanBackup,
      summary: {
        profileName,
        favoritesCount: favorites.length,
        watchLaterCount: watchLater.length,
        customListsCount: customLists.length,
        historyCount: history.length,
      },
    };
  } catch {
    return { valid: false, error: 'Invalid JSON syntax. Unable to parse backup file.' };
  }
}

/**
 * Perform safe import with Merge or Replace strategies
 */
export function applyBackupData(
  backup: LibraryBackup,
  options: ImportOptions
): { success: boolean; message: string } {
  const mode = options.mode || 'merge';
  const targetDomains = options.domains || ['profile', 'favorites', 'watchLater', 'customLists', 'history'];

  try {
    // 1. Profile Name
    if (targetDomains.includes('profile') && backup.profile?.name) {
      setStoredProfileName(backup.profile.name);
    }

    // 2. Favorites
    if (targetDomains.includes('favorites') && backup.favorites) {
      if (mode === 'replace') {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(backup.favorites));
      } else {
        const existing = getFavorites();
        const merged = Array.from(new Set([...backup.favorites, ...existing]));
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
      }
    }

    // 3. Watch Later
    if (targetDomains.includes('watchLater') && backup.watchLater) {
      if (mode === 'replace') {
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(backup.watchLater));
      } else {
        const existing = getWatchLater();
        const merged = Array.from(new Set([...backup.watchLater, ...existing]));
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(merged));
      }
    }

    // 4. History
    if (targetDomains.includes('history') && backup.history) {
      if (mode === 'replace') {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(backup.history));
      } else {
        const existing = getRecentlyPlayedVideoIds();
        const merged = Array.from(new Set([...backup.history, ...existing]));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
      }
    }

    // 5. Custom Lists
    if (targetDomains.includes('customLists') && backup.customLists) {
      if (mode === 'replace') {
        localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(backup.customLists));
      } else {
        const existingLists = getCustomLists();
        const listMap = new Map<string, CustomList>();

        // Put existing first
        existingLists.forEach((l) => listMap.set(l.id, { ...l, videoIds: [...l.videoIds] }));

        // Merge incoming lists
        backup.customLists.forEach((incoming) => {
          if (listMap.has(incoming.id)) {
            const current = listMap.get(incoming.id)!;
            const mergedVideos = Array.from(new Set([...current.videoIds, ...incoming.videoIds]));
            listMap.set(incoming.id, { ...current, videoIds: mergedVideos });
          } else {
            listMap.set(incoming.id, incoming);
          }
        });

        localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(Array.from(listMap.values())));
      }
    }

    // Update last backup timestamp upon successful import
    setLastBackupTime(backup.exportedAt || new Date().toISOString());
    notifyEvents();

    return {
      success: true,
      message: `Library data successfully ${mode === 'merge' ? 'merged' : 'restored'}.`,
    };
  } catch (err) {
    console.error('Error applying backup data:', err);
    return {
      success: false,
      message: 'Failed to write backup data to storage.',
    };
  }
}

/**
 * Clear all local library storage
 */
export function resetAllStorage(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(WATCH_LATER_KEY);
    localStorage.removeItem(CUSTOM_LISTS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LAST_BACKUP_KEY);
    localStorage.removeItem('suspense_profile_name');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BACKUP_UPDATED_EVENT, { detail: null }));
    }
    notifyEvents();
  } catch (err) {
    console.error('Failed to reset local storage:', err);
  }
}
