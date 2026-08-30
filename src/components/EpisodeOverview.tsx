import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, ChevronUp, Eye, ThumbsUp, Calendar } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { CustomBadge } from './CustomBadge';
import { formatFullNumber } from '@/lib/utils';

interface EpisodeOverviewProps {
  video: VideoItem;
}

export const EpisodeOverview: React.FC<EpisodeOverviewProps> = ({ video }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [video.videoId]);

  const publishedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : '';

  const series = video.series || [];

  const handleSeriesClick = (e: React.MouseEvent, seriesName: string) => {
    e.stopPropagation();
    navigate(`/episodes?q=${encodeURIComponent(seriesName)}&scope=series`);
  };

  return (
    <div
      onClick={() => !isExpanded && setIsExpanded(true)}
      className={`group rounded-md bg-muted/60 p-4 transition-all duration-200 ${!isExpanded ? 'cursor-pointer hover:bg-muted/90' : ''
        }`}
    >
      <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-foreground mb-3 pb-2 border-b border-border/30">
        <div className="flex items-center gap-3.5 flex-wrap">
          {video.viewCount !== undefined && video.viewCount > 0 && (
            <CustomBadge
              className="font-semibold text-foreground/90"
              value={`${formatFullNumber(video.viewCount)} views`}
              Icon={Eye}
            />
          )}

          {video.likeCount !== undefined && video.likeCount > 0 && (
            <CustomBadge
              className="font-semibold text-foreground/90"
              value={`${formatFullNumber(video.likeCount)} likes`}
              Icon={ThumbsUp}
            />
          )}

          {publishedDate && (
            <CustomBadge
              className="font-semibold text-foreground/90"
              value={publishedDate}
              Icon={Calendar}
            />
          )}
        </div>

        {series.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 font-bold">
            {series.map((s, i) => (
              <CustomBadge
                key={i}
                value={s}
                Icon={Hash}
                variant="secondary"
                gap={false}
                onClick={(e) => handleSeriesClick(e, s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Description Area */}
      <div className="text-sm text-foreground/90 leading-relaxed">
        {!isExpanded ? (
          <div>
            <p className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">
              {video.description || 'No description available for this episode.'}
            </p>
            {video.description && video.description.length > 100 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="mt-2 text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                ...more
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {video.description || 'No description available for this episode.'}
            </div>

            {/* Expanded Extra Details */}
            {(video.originalDate || (video.externalLinks && video.externalLinks.length > 0)) && (
              <div className="pt-3 border-t border-border/40 text-xs space-y-2 text-muted-foreground">
                {video.originalDate && (
                  <div>
                    <span className="font-semibold text-foreground">Original Release: </span>
                    {video.originalDate}
                  </div>
                )}
                {video.externalLinks && video.externalLinks.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">Links:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {video.externalLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-md inline-block"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="mt-2 text-xs font-semibold text-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              Show less <ChevronUp className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
