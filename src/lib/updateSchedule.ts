import { playlistData } from './playlist';

/**
 * Calculates the next upcoming scheduled update Date (Mondays at 00:00 IST / Sunday 18:30 UTC)
 */
export function getNextScheduledUpdateDate(now: Date = new Date()): Date {
  const current = new Date(now);

  // IST offset is UTC+5:30 (5.5 hours)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(current.getTime() + istOffsetMs);

  const day = istNow.getUTCDay();
  const hours = istNow.getUTCHours();
  const minutes = istNow.getUTCMinutes();

  let daysUntilMonday = (1 - day + 7) % 7;
  if (daysUntilMonday === 0 && (hours > 0 || minutes > 0)) {
    daysUntilMonday = 7;
  }

  const nextIstYear = istNow.getUTCFullYear();
  const nextIstMonth = istNow.getUTCMonth();
  const nextIstDate = istNow.getUTCDate() + daysUntilMonday;

  // Convert IST 00:00:00 back to UTC timestamp
  const targetUtcMs = Date.UTC(nextIstYear, nextIstMonth, nextIstDate, 0, 0, 0) - istOffsetMs;
  return new Date(targetUtcMs);
}

/**
 * Formats a Date object to a human readable short date string (e.g. "Sep 7, 2026")
 */
export function formatDateShort(date: Date | string | null): string {
  if (!date) return 'Unknown';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Gets the last library update date string from playlist.json
 */
export function getLibraryLastUpdated(): string | null {
  return (playlistData as { updatedAt?: string }).updatedAt || null;
}

/**
 * Returns formatted last library update date
 */
export function getFormattedLibraryLastUpdated(): string {
  return formatDateShort(getLibraryLastUpdated());
}

/**
 * Returns formatted next scheduled update date
 */
export function getFormattedNextScheduledUpdate(): string {
  return formatDateShort(getNextScheduledUpdateDate());
}
