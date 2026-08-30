import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Search, X, BookOpen } from 'lucide-react';
import { getAllSeriesSorted, type SeriesInfo } from '@/lib/authorsAndSeries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BrowseTabs } from '@/components/BrowseTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { cn } from '@/lib/utils';

type SortOptionType = 'name-asc' | 'name-desc' | 'count-desc';

const SERIES_SORT_OPTIONS: SortOption<SortOptionType>[] = [
  { value: 'name-asc', label: 'Alphabetical (A-Z)' },
  { value: 'name-desc', label: 'Alphabetical (Z-A)' },
  { value: 'count-desc', label: 'Most Episodes' },
];

export const SeriesPage = () => {
  useDocumentTitle('Series');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<SortOptionType>('name-asc');

  const allSeries = useMemo(() => getAllSeriesSorted(), []);

  // Compute available initial letters
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    allSeries.forEach((s) => set.add(s.initial));
    const sorted = Array.from(set).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
    return ['ALL', ...sorted];
  }, [allSeries]);

  // Filter and sort series
  const filteredSeries = useMemo(() => {
    let result = allSeries;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }

    // Filter by selected letter (if not 'ALL' and not searching)
    if (selectedLetter !== 'ALL' && !searchQuery.trim()) {
      result = result.filter((s) => s.initial === selectedLetter);
    }

    // Sort
    const sorted = [...result];
    if (sortOption === 'name-asc') {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    } else if (sortOption === 'name-desc') {
      sorted.sort((a, b) =>
        b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
      );
    } else if (sortOption === 'count-desc') {
      sorted.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
    }

    return sorted;
  }, [allSeries, searchQuery, selectedLetter, sortOption]);

  // Group series by initial letter if sorting by name-asc and not filtering by query
  const groupedSeries = useMemo(() => {
    if (sortOption !== 'name-asc' || searchQuery.trim()) {
      return null;
    }
    const map = new Map<string, SeriesInfo[]>();
    filteredSeries.forEach((series) => {
      const letter = series.initial;
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(series);
    });
    return map;
  }, [filteredSeries, sortOption, searchQuery]);

  const handleSeriesClick = (seriesName: string) => {
    navigate(`/episodes?q=${encodeURIComponent(seriesName)}&scope=series`);
  };

  return (
    <div className="space-y-6 pb-12">
      <BrowseTabs />

      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Layers className="size-7 text-primary" />
              Series
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Series count: {allSeries.length}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SortDropdown
              options={SERIES_SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
              ariaLabel="Sort series"
              dropdownLabel="Sort Series By"
            />
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search series by name..."
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear series search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Alphabet Jump Bar */}
        {!searchQuery.trim() && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 shrink-0">
              Filter Letter:
            </span>
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto py-1">
              {availableLetters.map((letter) => {
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(letter)}
                    className={cn(
                      'px-2 py-0.5 text-xs font-semibold rounded-md transition-all cursor-pointer min-w-7 text-center',
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Series List / Grid */}
      {filteredSeries.length > 0 ? (
        groupedSeries && selectedLetter === 'ALL' ? (
          /* Grouped by Alphabet Letter */
          <div className="space-y-8">
            {Array.from(groupedSeries.entries()).map(([letter, seriesList]) => (
              <section key={letter} className="space-y-3">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0">
                    {letter}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {seriesList.length} {seriesList.length === 1 ? 'series' : 'series'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {seriesList.map((series) => (
                    <button
                      key={series.name}
                      type="button"
                      onClick={() => handleSeriesClick(series.name)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/50 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {series.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookOpen className="size-3 shrink-0" />
                          <span>
                            {series.count} {series.count === 1 ? 'episode' : 'episodes'}
                          </span>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-medium group-hover:border-primary/50">
                        {series.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat Grid for filtered / custom sorted views */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSeries.map((series) => (
              <button
                key={series.name}
                type="button"
                onClick={() => handleSeriesClick(series.name)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/50 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {series.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <BookOpen className="size-3 shrink-0" />
                    <span>
                      {series.count} {series.count === 1 ? 'episode' : 'episodes'}
                    </span>
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 font-medium group-hover:border-primary/50">
                  {series.count}
                </Badge>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16 space-y-4 bg-card/40 rounded-xl border border-dashed p-6">
          <div className="size-12 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              No series found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any series matching your search. Try searching for a different name or clear filters.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedLetter('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesPage;
