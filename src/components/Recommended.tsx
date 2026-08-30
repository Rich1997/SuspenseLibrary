import React, { useMemo } from 'react';
import type { VideoItem } from '@/types/playlist';
import { getRelatedVideos } from '@/lib/playlist';
import { EpisodeCard } from './EpisodeCard';

interface RecommendedProps {
  currentVideo: VideoItem;
  count?: number;
}

export const Recommended: React.FC<RecommendedProps> = ({ currentVideo, count = 5 }) => {
  const recommendedVideos = useMemo(() => {
    return getRelatedVideos(currentVideo, count);
  }, [currentVideo.videoId, count]);

  if (recommendedVideos.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-foreground">More Episodes</h3>
      <div className="grid grid-cols-1 gap-6">
        {recommendedVideos.map((item) => (
          <EpisodeCard key={item.videoId} video={item} />
        ))}
      </div>
    </div>
  );
};
