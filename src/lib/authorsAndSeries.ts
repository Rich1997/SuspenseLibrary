import { getAllVideos } from './playlist';

export interface AuthorInfo {
  name: string;
  count: number;
  initial: string;
}

export interface SeriesInfo {
  name: string;
  count: number;
  initial: string;
}

export function getInitialLetter(name: string): string {
  if (!name) return '#';
  const firstChar = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : '#';
}

// Pre-computed module-level cache (calculated once on app initialization)
const cachedAuthors: AuthorInfo[] = (() => {
  const all = getAllVideos();
  const authorCounts = new Map<string, number>();

  all.forEach((v) => {
    (v.authors || []).forEach((a) => {
      if (!a || !a.name) return;
      const name = a.name.trim();
      if (!name) return;
      authorCounts.set(name, (authorCounts.get(name) || 0) + 1);
    });
  });

  const result: AuthorInfo[] = Array.from(authorCounts.entries()).map(
    ([name, count]) => ({
      name,
      count,
      initial: getInitialLetter(name),
    })
  );

  result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return result;
})();

const cachedSeries: SeriesInfo[] = (() => {
  const all = getAllVideos();
  const seriesCounts = new Map<string, number>();

  all.forEach((v) => {
    (v.series || []).forEach((s) => {
      if (!s) return;
      const name = s.trim();
      if (!name) return;
      seriesCounts.set(name, (seriesCounts.get(name) || 0) + 1);
    });
  });

  const result: SeriesInfo[] = Array.from(seriesCounts.entries()).map(
    ([name, count]) => ({
      name,
      count,
      initial: getInitialLetter(name),
    })
  );

  result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return result;
})();

export function getAllAuthorsSorted(): AuthorInfo[] {
  return cachedAuthors;
}

export function getAllSeriesSorted(): SeriesInfo[] {
  return cachedSeries;
}
