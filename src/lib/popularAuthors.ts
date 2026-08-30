import popularAuthorsRaw from '../data/popular-authors.json';
import { getAllVideos } from './playlist';
import type { VideoItem } from '../types/playlist';

export const POPULAR_AUTHORS: string[] = popularAuthorsRaw as string[];

export function getVideosByAuthor(authorName: string, count = 8): VideoItem[] {
  if (!authorName) return [];
  const target = authorName.toLowerCase().trim();
  const all = getAllVideos();
  return all
    .filter((v) => {
      if (target === 'various') {
        const primaryAuthorCount = (v.authors || []).filter(
          (a) => !a.role || a.role.toLowerCase() !== 'translator'
        ).length;
        return primaryAuthorCount > 1;
      }
      return v.authors?.some((a) => a.name.toLowerCase().trim() === target);
    })
    .slice(0, count);
}

export function getTotalVideoCountForAuthor(authorName: string): number {
  if (!authorName) return 0;
  const target = authorName.toLowerCase().trim();
  const all = getAllVideos();
  return all.filter((v) => {
    if (target === 'various') {
      const primaryAuthorCount = (v.authors || []).filter(
        (a) => !a.role || a.role.toLowerCase() !== 'translator'
      ).length;
      return primaryAuthorCount > 1;
    }
    return v.authors?.some((a) => a.name.toLowerCase().trim() === target);
  }).length;
}

export function getRandomPopularAuthor(): string {
  if (POPULAR_AUTHORS.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * POPULAR_AUTHORS.length);
  return POPULAR_AUTHORS[randomIndex];
}
