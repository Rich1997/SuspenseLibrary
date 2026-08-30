import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Trash2, Film, AlertCircle } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { getVideoById } from '@/lib/playlist';
import { useLibrary } from '@/hooks/useLibrary';
import { EpisodeCardHorizontal } from '@/components/EpisodeCardHorizontal';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const PAGE_SIZE = 10;

export const WatchLaterPage: React.FC = () => {
  useDocumentTitle('Watch Later');

  const [searchParams, setSearchParams] = useSearchParams();
  const { watchLater, clearWatchLater } = useLibrary();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Resolve watch later video IDs to full VideoItems
  const watchLaterVideos = useMemo(() => {
    const list: VideoItem[] = [];
    for (const id of watchLater) {
      const v = getVideoById(id);
      if (v) list.push(v);
    }
    return list;
  }, [watchLater]);

  const totalItems = watchLaterVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVideos = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return watchLaterVideos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [watchLaterVideos, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    clearWatchLater();
    setShowClearConfirm(false);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          Watch Later
        </h1>

        {watchLaterVideos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="w-fit text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            <Trash2 className="size-3.5" />
            Clear Watch Later
          </Button>
        )}
      </div>

      {watchLaterVideos.length > 0 ? (
        <>
          <div className="flex flex-col gap-7.5">
            {paginatedVideos.map((video) => (
              <EpisodeCardHorizontal key={video.videoId} video={video} />
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 space-y-4 bg-card/40 rounded-md border border-dashed p-6">
          <div className="size-14 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
            <Clock className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Your Watch Later Queue is Empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Save episodes to your queue by clicking the clock icon on any episode card.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/episodes">
              <Button size="sm" className="gap-2">
                <Film className="size-4" />
                Browse Episode Catalog
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Clear Watch Later Queue?</DialogTitle>
                <DialogDescription className="text-xs">This action cannot be undone.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            All {watchLaterVideos.length} queued episodes will be removed from Watch Later.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              Yes, Clear Queue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WatchLaterPage;
