import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { getRecentlyPlayedVideos } from '@/lib/recentlyPlayed';
import type { VideoItem } from '@/types/playlist';
import { EpisodeCard } from '@/components/EpisodeCard';

interface RecentlyPlayedProps {
  count?: number;
}

export const RecentlyPlayed: React.FC<RecentlyPlayedProps> = ({ count = 5 }) => {
  const [recentVideos, setRecentVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const updateList = () => {
      setRecentVideos(getRecentlyPlayedVideos(count));
    };
    updateList();

    window.addEventListener('recently_played_updated', updateList);
    window.addEventListener('storage', updateList);
    return () => {
      window.removeEventListener('recently_played_updated', updateList);
      window.removeEventListener('storage', updateList);
    };
  }, [count]);

  if (recentVideos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Recently Played
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7.5 sm:gap-6">
        {recentVideos.map((video) => (
          <EpisodeCard key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
};
