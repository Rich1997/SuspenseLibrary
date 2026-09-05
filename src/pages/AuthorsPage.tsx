import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, X, BookOpen } from 'lucide-react';
import { getAllAuthorsSorted, type AuthorInfo } from '@/lib/authorsAndSeries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BrowseTabs } from '@/components/BrowseTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { cn } from '@/lib/utils';

type SortOptionType = 'name-asc' | 'name-desc' | 'count-desc';

const AUTHOR_SORT_OPTIONS: SortOption<SortOptionType>[] = [
  { value: 'name-asc', label: 'Alphabetical (A-Z)' },
  { value: 'name-desc', label: 'Alphabetical (Z-A)' },
  { value: 'count-desc', label: 'Most Episodes' },
];

export const AuthorsPage = () => {
  useDocumentTitle('Authors');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<SortOptionType>('name-asc');

  const allAuthors = useMemo(() => getAllAuthorsSorted(), []);

  // Compute available initial letters
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    allAuthors.forEach((a) => set.add(a.initial));
    const sorted = Array.from(set).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
    return ['ALL', ...sorted];
  }, [allAuthors]);

  // Filter and sort authors
  const filteredAuthors = useMemo(() => {
    let result = allAuthors;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(query));
    }

    // Filter by selected letter (if not 'ALL' and not searching)
    if (selectedLetter !== 'ALL' && !searchQuery.trim()) {
      result = result.filter((a) => a.initial === selectedLetter);
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
  }, [allAuthors, searchQuery, selectedLetter, sortOption]);

  // Group authors by initial letter if sorting by name-asc and not filtering by query
  const groupedAuthors = useMemo(() => {
    if (sortOption !== 'name-asc' || searchQuery.trim()) {
      return null;
    }
    const map = new Map<string, AuthorInfo[]>();
    filteredAuthors.forEach((author) => {
      const letter = author.initial;
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(author);
    });
    return map;
  }, [filteredAuthors, sortOption, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      <BrowseTabs />

      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Users className="size-7 text-primary" />
              Authors
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Authors count: {allAuthors.length}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SortDropdown
              options={AUTHOR_SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
              ariaLabel="Sort authors"
              dropdownLabel="Sort Authors By"
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
              placeholder="Search authors by name..."
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear author search"
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

      {/* Authors List / Grid */}
      {filteredAuthors.length > 0 ? (
        groupedAuthors && selectedLetter === 'ALL' ? (
          /* Grouped by Alphabet Letter */
          <div className="space-y-8">
            {Array.from(groupedAuthors.entries()).map(([letter, authors]) => (
              <section key={letter} className="space-y-3">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0">
                    {letter}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {authors.map((author) => (
                    <Link
                      key={author.name}
                      to={`/episodes?q=${encodeURIComponent(author.name)}&scope=author`}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/50 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {author.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookOpen className="size-3 shrink-0" />
                          <span>
                            {author.count} {author.count === 1 ? 'episode' : 'episodes'}
                          </span>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-medium group-hover:border-primary/50">
                        {author.count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat Grid for filtered / custom sorted views */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAuthors.map((author) => (
              <Link
                key={author.name}
                to={`/episodes?q=${encodeURIComponent(author.name)}&scope=author`}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/50 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {author.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <BookOpen className="size-3 shrink-0" />
                    <span>
                      {author.count} {author.count === 1 ? 'episode' : 'episodes'}
                    </span>
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 font-medium group-hover:border-primary/50">
                  {author.count}
                </Badge>
              </Link>
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
              No authors found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any authors matching your search. Try searching for a different name or clear filters.
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

export default AuthorsPage;
