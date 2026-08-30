export interface Author {
  role?: string;
  name: string;
}

export interface VideoItem {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  removedFromPlaylist: boolean;
  authors?: Author[];
  series?: string[];
  originalDate?: string;
  externalLinks?: string[];
}

export interface PlaylistData {
  updatedAt: string;
  videos: VideoItem[];
}

export type LibraryActionType = 'favorite' | 'watchLater' | 'customList';
