import { Link } from 'react-router-dom';
import { Calendar, User, Play, Hash, Eye } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { LibraryActions } from '@/components/LibraryActions';
import { CustomBadge } from './CustomBadge';
import { formatCompactNumber, formatFullNumber } from '@/lib/utils';

interface EpisodeCardProps {
  video: VideoItem;
  showViewsLabel?: boolean;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ video, showViewsLabel = true }) => {
  const publishedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : '';

  const actualAuthors = (video.authors || []).filter(
    (a) => !a.role || a.role.toLowerCase() !== 'translator'
  );
  const isMultipleAuthors = actualAuthors.length > 1;

  const authorName = isMultipleAuthors
    ? 'Various'
    : actualAuthors.length === 1
      ? actualAuthors[0].name
      : video.authors && video.authors.length > 0
        ? video.authors[0].name
        : null;

  const series = video.series && video.series?.length > 0 ? video.series : null;

  return (
    <div className="group relative flex flex-col overflow-hidden bg-background border-none rounded-md shadow-none hover:bg-foreground/10 cursor-pointer -m-3 p-3">
      {/* Thumbnail Container */}
      <Link to={`/${video.videoId}`} className="relative aspect-video w-full overflow-hidden bg-muted rounded-md">
        <img
          src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <div className="size-10 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-5 fill-current ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="py-3 px-0 space-y-1.5">
        <Link to={`/${video.videoId}`} className="group-hover:text-primary transition-colors">
          <div className="text-sm font-semibold line-clamp-2 leading-snug">
            {video.title}
          </div>
        </Link>
      </div>

      {authorName && (
        <CustomBadge
          className="pb-2 max-w-fit font-semibold"
          value={authorName}
          Icon={User}
          to={`/episodes?q=${encodeURIComponent(authorName)}&scope=author`}
        />
      )}

      {series && series.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pb-2">
          {series.map((s, i) => (
            <CustomBadge
              key={i}
              value={s}
              Icon={Hash}
              gap={false}
              to={`/episodes?q=${encodeURIComponent(s)}&scope=series`}
            />
          ))}
        </div>
      )}

      <div className="pb-2 pt-0 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {video.viewCount !== undefined && video.viewCount > 0 && (
            <>
              <CustomBadge
                value={showViewsLabel ? `${formatCompactNumber(video.viewCount)} views` : formatCompactNumber(video.viewCount)}
                title={`${formatFullNumber(video.viewCount)} views`}
                Icon={Eye}
              />
            </>
          )}
          {publishedDate && (
            <CustomBadge
              value={publishedDate}
              Icon={Calendar}
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <LibraryActions videoId={video.videoId} title={video.title} variant="compact" />
        </div>
      </div>
    </div>
  );
};
