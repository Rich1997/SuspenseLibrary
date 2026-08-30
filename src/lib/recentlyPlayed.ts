import { getVideoById } from './playlist';
import type { VideoItem } from '../types/playlist';

const STORAGE_KEY = 'suspense_library_recently_played';

export function getRecentlyPlayedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyPlayedVideo(videoId: string): void {
  if (!videoId) return;
  try {
    const existing = getRecentlyPlayedVideoIds();
    const filtered = existing.filter((id) => id !== videoId);
    const updated = [videoId, ...filtered].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('recently_played_updated'));
    }
  } catch (err) {
    console.error('Failed to save recently played video:', err);
  }
}

export function removeRecentlyPlayedVideo(videoId: string): void {
  if (!videoId) return;
  try {
    const existing = getRecentlyPlayedVideoIds();
    const filtered = existing.filter((id) => id !== videoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('recently_played_updated'));
    }
  } catch (err) {
    console.error('Failed to remove recently played video:', err);
  }
}

export function clearRecentlyPlayed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('recently_played_updated'));
    }
  } catch (err) {
    console.error('Failed to clear recently played videos:', err);
  }
}

export function getRecentlyPlayedVideos(count = 50): VideoItem[] {
  const ids = getRecentlyPlayedVideoIds();
  const videos: VideoItem[] = [];
  for (const id of ids) {
    const video = getVideoById(id);
    if (video) {
      videos.push(video);
      if (videos.length >= count) break;
    }
  }
  return videos;
}
