import React, { useState, useEffect } from 'react';
import { UserCheck, Shuffle } from 'lucide-react';
import {
  POPULAR_AUTHORS,
  getVideosByAuthor,
  getTotalVideoCountForAuthor,
  getRandomPopularAuthor,
} from '@/lib/popularAuthors';
import { EpisodeCard } from '@/components/EpisodeCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PopularAuthorsProps {
  count?: number;
}

export const PopularAuthors: React.FC<PopularAuthorsProps> = ({ count = 8 }) => {
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  useEffect(() => {
    setSelectedAuthor(getRandomPopularAuthor());
  }, []);

  const handleRandomize = () => {
    const current = selectedAuthor;
    const remaining = POPULAR_AUTHORS.filter((a) => a !== current);
    if (remaining.length > 0) {
      const random = remaining[Math.floor(Math.random() * remaining.length)];
      setSelectedAuthor(random);
    }
  };

  if (!selectedAuthor || POPULAR_AUTHORS.length === 0) {
    return null;
  }

  const authorVideos = getVideosByAuthor(selectedAuthor, count);
  const totalCount = getTotalVideoCountForAuthor(selectedAuthor);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Popular Authors
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {POPULAR_AUTHORS.map((author) => {
            const isSelected = author === selectedAuthor;
            return (
              <Button
                key={author}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAuthor(author)}
                className="text-xs h-8 rounded-full"
              >
                {author}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            size="icon-sm"
            title="Pick a random author"
            onClick={handleRandomize}
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Shuffle className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
        <span>
          Showing episodes by <strong className="text-foreground">{selectedAuthor}</strong>
        </span>
        <Badge variant="muted" className="text-[11px]">
          {totalCount} total episodes
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7.5 sm:gap-6">
        {authorVideos.map((video) => (
          <EpisodeCard key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
};
