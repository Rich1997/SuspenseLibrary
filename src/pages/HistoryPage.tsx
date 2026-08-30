import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { History, Trash2, Film, AlertCircle } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import {
  getRecentlyPlayedVideos,
  removeRecentlyPlayedVideo,
  clearRecentlyPlayed,
} from '@/lib/recentlyPlayed';
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

export const HistoryPage: React.FC = () => {
  useDocumentTitle('History');

  const [searchParams, setSearchParams] = useSearchParams();
  const [allVideos, setAllVideos] = useState<VideoItem[]>(() => getRecentlyPlayedVideos(100));
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  useEffect(() => {
    const handleUpdate = () => {
      setAllVideos(getRecentlyPlayedVideos(100));
    };

    window.addEventListener('recently_played_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recently_played_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const totalItems = allVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVideos = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return allVideos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allVideos, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveItem = (videoId: string) => {
    removeRecentlyPlayedVideo(videoId);
  };

  const handleClearAll = () => {
    clearRecentlyPlayed();
    setShowClearConfirm(false);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          Listening History
        </h1>

        {allVideos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="w-fit text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            <Trash2 className="size-3.5" />
            Clear History
          </Button>
        )}
      </div>

      {/* History Items List & Pagination */}
      {allVideos.length > 0 ? (
        <>
          <div className="flex flex-col gap-7.5">
            {paginatedVideos.map((video) => (
              <EpisodeCardHorizontal
                key={video.videoId}
                video={video}
                onRemove={handleRemoveItem}
                removeTitle="Remove from history"
              />
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
          <div className="size-14 rounded-full bg-muted mx-auto flex items-center justify-center">
            <History className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Listening History Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Episodes you listen to will automatically appear here so you can easily pick up where you left off.
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

      {/* Clear History Confirmation Modal */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Clear Listening History?</DialogTitle>
                <DialogDescription className="text-xs">This action cannot be undone.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            All {allVideos.length} episodes will be removed from your local listening history.
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
              Yes, Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;
