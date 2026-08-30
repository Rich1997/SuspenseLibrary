import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Play, Hash, Trash2 } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { Button } from '@/components/ui/button';
import { LibraryActions } from '@/components/LibraryActions';
import { CustomBadge } from './CustomBadge';

interface EpisodeCardHorizontalProps {
  video: VideoItem;
  onRemove?: (videoId: string) => void;
  removeTitle?: string;
}

export const EpisodeCardHorizontal: React.FC<EpisodeCardHorizontalProps> = ({
  video,
  onRemove,
  removeTitle = 'Remove',
}) => {
  const navigate = useNavigate();

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

  const series = video.series && video.series.length > 0 ? video.series : null;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorName) {
      navigate(`/episodes?q=${encodeURIComponent(authorName)}&scope=author`);
    }
  };

  const handleSeriesClick = (e: React.MouseEvent, seriesName: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/episodes?q=${encodeURIComponent(seriesName)}&scope=series`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(video.videoId);
  };

  return (
    <div className="group relative flex flex-row items-start overflow-hidden bg-background border-none rounded-md shadow-none hover:bg-foreground/10 cursor-pointer -m-3 p-3 gap-3 sm:gap-4 transition-colors">
      {/* Left Panel: Thumbnail */}
      <Link
        to={`/${video.videoId}`}
        className="relative aspect-video w-32 xs:w-40 sm:w-52 shrink-0 overflow-hidden bg-muted rounded-md"
      >
        <img
          src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <div className="size-8 sm:size-10 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-4 sm:size-5 fill-current ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Right Panel: Content & Information */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch space-y-1.5">
        <div className="space-y-1.5">
          {/* Title */}
          <Link to={`/${video.videoId}`} className="block group-hover:text-primary transition-colors">
            <div className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug text-foreground">
              {video.title}
            </div>
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {authorName && (
              <CustomBadge
                className="font-semibold"
                value={authorName}
                Icon={User}
                onClick={handleAuthorClick}
              />
            )}

            {series && series.map((s, i) => (
              <CustomBadge
                key={i}
                value={s}
                Icon={Hash}
                gap={false}
                onClick={(e) => handleSeriesClick(e, s)}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
          {publishedDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3 shrink-0" />
              {publishedDate}
            </span>
          ) : <div />}

          <div className="flex items-center gap-1.5">
            <LibraryActions videoId={video.videoId} title={video.title} variant="compact" />

            {onRemove && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                title={removeTitle}
                className="size-7 sm:size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCardHorizontal;
