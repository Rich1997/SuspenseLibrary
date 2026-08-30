import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { getLatestVideos } from '@/lib/playlist';
import { EpisodeCard } from '@/components/EpisodeCard';
import { Button } from '@/components/ui/button';

interface LatestUploadsProps {
  count?: number;
}

export const LatestUploads: React.FC<LatestUploadsProps> = ({ count = 8 }) => {
  const latestVideos = getLatestVideos(count);

  if (latestVideos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Latest Uploads
          </h2>
        </div>
        <Link to="/episodes">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7.5 sm:gap-6">
        {latestVideos.map((video) => (
          <EpisodeCard key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
};
