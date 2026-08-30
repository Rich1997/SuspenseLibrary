import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserX,
  Search,
  X,
  Copy,
  Check,
  ExternalLink,
  Play,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Wrench,
  Layers,
} from 'lucide-react';
import { getAllVideos } from '@/lib/playlist';
import type { VideoItem } from '@/types/playlist';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type FilterType = 'no-authors' | 'no-series' | 'missing-both' | 'all';
type SortType = 'newest' | 'oldest' | 'title-asc';

const PAGE_SIZE = 20;

const SORT_OPTIONS: SortOption<SortType>[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
];

const TAB_TO_FILTER: Record<string, FilterType> = {
  'missing-authors': 'no-authors',
  'missing-series': 'no-series',
  'missing-both': 'missing-both',
  'all-incomplete': 'all',
};

const FILTER_TO_TAB: Record<FilterType, string> = {
  'no-authors': 'missing-authors',
  'no-series': 'missing-series',
  'missing-both': 'missing-both',
  'all': 'all-incomplete',
};

export const UnassignedPage: React.FC = () => {
  useDocumentTitle('Unassigned Videos (Dev)');
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active filter derived from URL sub-route tab parameter
  const filterType: FilterType = tab && TAB_TO_FILTER[tab] ? TAB_TO_FILTER[tab] : 'no-authors';
  const currentTabSlug = FILTER_TO_TAB[filterType];

  // Pagination from URL searchParams ?page=X
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Search query (100% independent local state)
  const [inputQuery, setInputQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortType>('newest');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const allVideos = useMemo(() => getAllVideos(), []);

  // Filter unassigned
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const hasAuthors = Array.isArray(v.authors) && v.authors.some((a) => a && a.name?.trim());
      const hasSeries = Array.isArray(v.series) && v.series.some((s) => s && s.trim());

      let matchesFilter = true;
      if (filterType === 'no-authors') {
        matchesFilter = !hasAuthors;
      } else if (filterType === 'no-series') {
        matchesFilter = !hasSeries;
      } else if (filterType === 'missing-both') {
        matchesFilter = !hasAuthors && !hasSeries;
      } else if (filterType === 'all') {
        matchesFilter = !hasAuthors || !hasSeries;
      }

      if (!matchesFilter) return false;

      if (activeQuery.trim()) {
        const q = activeQuery.trim().toLowerCase();
        const matchTitle = v.title?.toLowerCase().includes(q);
        const matchId = v.videoId?.toLowerCase().includes(q);
        const matchDesc = v.description?.toLowerCase().includes(q);
        return matchTitle || matchId || matchDesc;
      }

      return true;
    });
  }, [allVideos, filterType, activeQuery]);

  // Sort
  const sortedVideos = useMemo(() => {
    const list = [...filteredVideos];
    if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
    } else if (sortOption === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredVideos, sortOption]);

  // Stats
  const totalNoAuthors = useMemo(() => {
    return allVideos.filter((v) => !v.authors || v.authors.length === 0 || !v.authors.some((a) => a && a.name?.trim())).length;
  }, [allVideos]);

  const totalNoSeries = useMemo(() => {
    return allVideos.filter((v) => !v.series || v.series.length === 0 || !v.series.some((s) => s && s.trim())).length;
  }, [allVideos]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVideos = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedVideos.slice(start, start + PAGE_SIZE);
  }, [sortedVideos, safeCurrentPage]);

  // Tab navigation
  const handleFilterChange = (newType: FilterType) => {
    const slug = FILTER_TO_TAB[newType];
    navigate(`/unassigned/${slug}`);
  };

  // Pagination navigation
  const handlePageChange = (newPage: number) => {
    if (newPage <= 1) {
      navigate(`/unassigned/${currentTabSlug}`);
    } else {
      navigate(`/unassigned/${currentTabSlug}?page=${newPage}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Local search submit (Does NOT change route or URL searchParams)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(inputQuery.trim());
  };

  // Local search clear (Does NOT change route or URL searchParams)
  const handleClearSearch = () => {
    setInputQuery('');
    setActiveQuery('');
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllIds = () => {
    const ids = sortedVideos.map((v) => v.videoId).join(', ');
    navigator.clipboard.writeText(ids);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Dev Header */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Wrench className="size-6 text-primary" />
                Unassigned Videos
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono border-amber-500/50 text-amber-600 dark:text-amber-400">
                Dev Tool
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review and audit imported episodes missing author or series tags.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAllIds}
              disabled={sortedVideos.length === 0}
              className="text-xs gap-1.5 font-medium"
            >
              {copiedAll ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copiedAll ? 'Copied IDs!' : `Copy ${sortedVideos.length} IDs`}
            </Button>
            <SortDropdown
              options={SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
              ariaLabel="Sort videos"
              dropdownLabel="Sort By"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleFilterChange('no-authors')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border',
              filterType === 'no-authors'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            )}
          >
            <UserX className="size-3.5" />
            Missing Authors ({totalNoAuthors})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('no-series')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border',
              filterType === 'no-series'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            )}
          >
            <Layers className="size-3.5" />
            Missing Series ({totalNoSeries})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('missing-both')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border',
              filterType === 'missing-both'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            )}
          >
            <FileQuestion className="size-3.5" />
            Missing Both
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border',
              filterType === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            )}
          >
            All Incomplete
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="relative max-w-md pt-1">
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
          >
            <Search className="size-4" />
          </button>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Search by title, video ID, or description (Press Enter)..."
            className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Videos List */}
      {paginatedVideos.length > 0 ? (
        <div className="space-y-3">
          {paginatedVideos.map((video: VideoItem) => {
            const hasAuthors = video.authors && video.authors.length > 0;
            const hasSeries = video.series && video.series.length > 0;
            const isDescExpanded = Boolean(expandedDescriptions[video.videoId]);
            const isCopied = copiedId === video.videoId;

            const publishedFormatted = video.publishedAt
              ? new Date(video.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              : null;

            return (
              <div
                key={video.videoId}
                className="border rounded-xl p-3.5 sm:p-4 bg-card/60 hover:bg-card transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/${video.videoId}`}
                    className="relative aspect-video w-36 sm:w-48 shrink-0 overflow-hidden bg-muted rounded-md group"
                  >
                    <img
                      src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="size-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow">
                        <Play className="size-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/${video.videoId}`}
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {video.title}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] pt-0.5">
                      {!hasAuthors && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          No Author
                        </Badge>
                      )}
                      {!hasSeries && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          No Series
                        </Badge>
                      )}

                      {/* Video ID badge with copy */}
                      <button
                        type="button"
                        onClick={() => handleCopy(video.videoId, video.videoId)}
                        className="font-mono bg-muted/60 hover:bg-muted text-foreground px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to copy Video ID"
                      >
                        <span>{video.videoId}</span>
                        {isCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 opacity-60" />}
                      </button>

                      {publishedFormatted && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {publishedFormatted}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Watch on YouTube
                      </a>

                      {video.description && (
                        <button
                          type="button"
                          onClick={() => toggleDescription(video.videoId)}
                          className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {isDescExpanded ? (
                            <>
                              Hide Description <ChevronUp className="size-3" />
                            </>
                          ) : (
                            <>
                              View Description <ChevronDown className="size-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible description */}
                {isDescExpanded && video.description && (
                  <ScrollArea className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-60 h-60 border border-border/50">
                    {video.description}
                  </ScrollArea>
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={sortedVideos.length}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4 bg-card/40 rounded-xl border border-dashed p-6">
          <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <Check className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              All caught up!
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No videos found matching the &ldquo;{filterType}&rdquo; filter. All episodes in this scope have metadata populated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnassignedPage;
