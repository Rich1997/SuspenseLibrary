import playlistRaw from '../data/playlist.json';
import type { PlaylistData, VideoItem } from '../types/playlist';

const playlistData = playlistRaw as unknown as PlaylistData;

// Helper to identify private or deleted videos
const isPrivateVideo = (v: VideoItem): boolean => {
  if (!v || !v.title) return true;
  const t = v.title.toLowerCase().trim();
  const d = (v.description || '').toLowerCase().trim();
  return (
    t === 'private video' ||
    t.includes('private video') ||
    t.includes('deleted video') ||
    d.includes('this video is private') ||
    Boolean(v.removedFromPlaylist)
  );
};

// Deduplicate and filter out private or removed videos
const videoMap = new Map<string, VideoItem>();
(playlistData.videos || []).forEach((v) => {
  if (v && v.videoId && !isPrivateVideo(v)) {
    if (!videoMap.has(v.videoId)) {
      videoMap.set(v.videoId, v);
    }
  }
});

const allVideos: VideoItem[] = Array.from(videoMap.values());

// Map for O(1) video lookup by videoId
const videoIdMap = videoMap;

// Cache pre-sorted videos by publishedAt descending
const sortedByLatest = [...allVideos].sort((a, b) => {
  const dateA = new Date(a.publishedAt || 0).getTime();
  const dateB = new Date(b.publishedAt || 0).getTime();
  return dateB - dateA;
});

// Cache pre-sorted videos by publishedAt ascending (oldest first)
const sortedByOldest = [...allVideos].sort((a, b) => {
  const dateA = new Date(a.publishedAt || 0).getTime();
  const dateB = new Date(b.publishedAt || 0).getTime();
  return dateA - dateB;
});

export function getAllVideos(): VideoItem[] {
  return allVideos;
}

export function getVideoById(videoId: string): VideoItem | undefined {
  return videoIdMap.get(videoId);
}

export function getLatestVideos(count = 8): VideoItem[] {
  return sortedByLatest.slice(0, count);
}

export type SearchScope = 'all' | 'title' | 'author' | 'series';
export type SortOrder = 'newest' | 'oldest';

export interface SearchResult {
  items: VideoItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  scope: SearchScope;
  sort: SortOrder;
}

export function searchVideos(
  query: string = '',
  page: number = 1,
  pageSize: number = 20,
  scope: SearchScope = 'all',
  sort: SortOrder = 'newest'
): SearchResult {
  const trimmed = query.trim().toLowerCase();
  const limit = Math.min(Math.max(1, pageSize), 20);

  const baseList = sort === 'oldest' ? sortedByOldest : sortedByLatest;
  let filtered = baseList;

  if (trimmed) {
    filtered = baseList.filter((v) => {
      const matchTitle = () => v.title.toLowerCase().includes(trimmed);
      const matchDescription = () => (v.description || '').toLowerCase().includes(trimmed);
      const matchAuthor = () => {
        const hasAuthorNameMatch = v.authors?.some((a) =>
          a.name.toLowerCase().includes(trimmed)
        );
        if (hasAuthorNameMatch) return true;
        if (trimmed === 'various') {
          const primaryAuthorCount = (v.authors || []).filter(
            (a) => !a.role || a.role.toLowerCase() !== 'translator'
          ).length;
          return primaryAuthorCount > 1;
        }
        return false;
      };
      const matchSeries = () =>
        v.series?.some((s) => s.toLowerCase().includes(trimmed));
      switch (scope) {
        case 'title':
          return matchTitle();
        case 'author':
          return matchAuthor();
        case 'series':
          return matchSeries();
        case 'all':
        default:
          return matchTitle() || matchDescription() || matchAuthor() || matchSeries();
      }
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    totalPages,
    currentPage,
    scope,
    sort,
  };
}

// In-memory cache for related videos lookup
const relatedCache = new Map<string, VideoItem[]>();

export function getRelatedVideos(videoInput: VideoItem | string, count = 5): VideoItem[] {
  const currentVideo = typeof videoInput === 'string' ? getVideoById(videoInput) : videoInput;
  if (!currentVideo) {
    return sortedByLatest.slice(0, count);
  }

  const cacheKey = `${currentVideo.videoId}_${count}`;
  if (relatedCache.has(cacheKey)) {
    return relatedCache.get(cacheKey)!;
  }

  const currentId = currentVideo.videoId;
  const currentAuthorNames = new Set(
    (currentVideo.authors || []).map((a) => a.name.toLowerCase().trim())
  );
  const currentSeriesNames = new Set(
    (currentVideo.series || []).map((s) => s.toLowerCase().trim())
  );

  const candidates = sortedByLatest.filter((v) => v.videoId !== currentId);

  const scored = candidates.map((v) => {
    let score = 0;

    // Series match: +10 points per matching series
    if (v.series && v.series.length > 0 && currentSeriesNames.size > 0) {
      for (const s of v.series) {
        if (currentSeriesNames.has(s.toLowerCase().trim())) {
          score += 10;
        }
      }
    }

    // Author match: +5 points per matching author
    if (v.authors && v.authors.length > 0 && currentAuthorNames.size > 0) {
      for (const a of v.authors) {
        if (currentAuthorNames.has(a.name.toLowerCase().trim())) {
          score += 5;
        }
      }
    }

    return { video: v, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.video.publishedAt.localeCompare(a.video.publishedAt);
  });

  const result = scored.map((item) => item.video).slice(0, count);
  relatedCache.set(cacheKey, result);
  return result;
}
