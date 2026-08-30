import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter, Library } from 'lucide-react';
import { searchVideos, type SearchScope, type SortOrder } from '@/lib/playlist';
import { EpisodeCard } from '@/components/EpisodeCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BrowseTabs } from '@/components/BrowseTabs';

const PAGE_SIZE = 20;

const CATALOG_SORT_OPTIONS: SortOption<SortOrder>[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'mostViewed', label: 'Most Viewed' },
];

const SCOPE_OPTIONS: { value: SearchScope; label: string }[] = [
  { value: 'all', label: 'All Fields' },
  { value: 'title', label: 'Title Only' },
  { value: 'author', label: 'Author' },
  { value: 'series', label: 'Series' },
];

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const scopeParam = (searchParams.get('scope') as SearchScope) || 'all';
  const scope: SearchScope = ['all', 'title', 'author', 'series'].includes(scopeParam)
    ? scopeParam
    : 'all';

  const sortParam = (searchParams.get('sort') as SortOrder) || 'newest';
  const sort: SortOrder = ['newest', 'oldest', 'mostViewed'].includes(sortParam)
    ? sortParam
    : 'newest';

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const isSearching = Boolean(query.trim());
  const pageTitle = isSearching ? `Search: ${query.trim()}` : 'All Episodes';

  useDocumentTitle(pageTitle);

  const searchResult = useMemo(() => {
    return searchVideos(query, currentPage, PAGE_SIZE, scope, sort);
  }, [query, currentPage, scope, sort]);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScopeChange = (newScope: SearchScope) => {
    const newParams = new URLSearchParams(searchParams);
    if (newScope === 'all') {
      newParams.delete('scope');
    } else {
      newParams.set('scope', newScope);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: SortOrder) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === 'newest') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSort);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12">
      <BrowseTabs />

      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {isSearching ? (
                <>
                  <Search className="size-6 text-primary" />
                  Search Results
                </>
              ) : (
                <>
                  <Library className="size-6 text-primary" />
                  All Episodes
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isSearching ? (
                <>
                  Found <span className="font-semibold text-foreground">{searchResult.total}</span>{' '}
                  {searchResult.total === 1 ? 'episode' : 'episodes'} matching &ldquo;
                  <span className="font-semibold text-foreground">{query}</span>&rdquo;
                  {scope !== 'all' && (
                    <> in <span className="font-semibold text-primary capitalize">{scope}</span></>
                  )}
                </>
              ) : (
                <>Browse through the full library collection ({searchResult.total} episodes)</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SortDropdown
              options={CATALOG_SORT_OPTIONS}
              value={sort}
              onChange={handleSortChange}
              ariaLabel="Sort episodes"
              dropdownLabel="Sort Episodes"
            />

            {isSearching && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="w-fit text-xs gap-1.5"
              >
                <X className="size-3.5" />
                Clear Search
              </Button>
            )}
          </div>
        </div>

        {isSearching && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="size-3.5" /> Filter:
            </span>
            {SCOPE_OPTIONS.map((option) => {
              const isActive = scope === option.value;
              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleScopeChange(option.value)}
                  className="text-xs h-7 rounded-full px-3"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {searchResult.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7.5">
          {searchResult.items.map((video) => (
            <EpisodeCard key={video.videoId} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4 bg-card/40 rounded-md border border-dashed p-6">
          <div className="size-12 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              No episodes found for &ldquo;{query}&rdquo; {scope !== 'all' ? `in ${scope}` : ''}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any audio stories matching your search query. Try switching the search scope filter above or searching for another keyword.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {scope !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => handleScopeChange('all')}>
                Search in All Fields
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleClearSearch}>
              View All Episodes
            </Button>
          </div>
        </div>
      )}

      <Pagination
        currentPage={searchResult.currentPage}
        totalPages={searchResult.totalPages}
        totalItems={searchResult.total}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CatalogPage;
