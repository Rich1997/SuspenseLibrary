import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Trash2, Film, AlertCircle } from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { getVideoById } from '@/lib/playlist';
import { useLibrary } from '@/hooks/useLibrary';
import { EpisodeCardHorizontal } from '@/components/EpisodeCardHorizontal';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

export const FavoritesPage: React.FC = () => {
  useDocumentTitle('Favorites');

  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, clearFavorites } = useLibrary();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Resolve favorite video IDs to full VideoItems
  const favoriteVideos = useMemo(() => {
    const list: VideoItem[] = [];
    for (const id of favorites) {
      const v = getVideoById(id);
      if (v) list.push(v);
    }
    return list;
  }, [favorites]);

  const totalItems = favoriteVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVideos = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return favoriteVideos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [favoriteVideos, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    clearFavorites();
    setShowClearConfirm(false);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          Favorite Episodes
        </h1>

        {favoriteVideos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="w-fit text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            <Trash2 className="size-3.5" />
            Clear Favorites
          </Button>
        )}
      </div>

      {/* List Content & Pagination */}
      {favoriteVideos.length > 0 ? (
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
            <Heart className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Favorites Saved Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click the heart icon on any episode card to save your favorite episodes here for easy access.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/episodes">
              <Button size="sm" className="gap-2">
                <Film className="size-4" />
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Clear Favorites Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-card border text-card-foreground max-w-sm w-full rounded-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Clear All Favorites?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              All {favoriteVideos.length} saved favorite episodes will be removed.
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
