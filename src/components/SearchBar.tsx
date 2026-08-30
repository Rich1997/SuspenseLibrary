import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { useSearchHistory } from '@/lib/searchHistory';
import { cn } from '@/lib/utils';
import type { SearchScope } from '@/lib/playlist';
import { ScrollArea } from './ui/scroll-area';

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, scope?: SearchScope) => void;
  showScopeSelector?: boolean;
  autoFocus?: boolean;
  onClose?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search titles, authors, series...',
  className,
  onSearch,
  showScopeSelector = true,
  autoFocus = false,
  onClose,
}) => {
  const { query, setQuery, scope, setScope, handleSubmit, handleClear, executeSearch } = useSearch({ onSearch });
  const { history, removeSearch } = useSearchHistory();

  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter history based on current search input query
  const filteredSearches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return history;
    return history.filter((term) => term.toLowerCase().includes(trimmed));
  }, [history, query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Auto focus input if autoFocus is true
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    executeSearch(term, scope);
    setIsFocused(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused || filteredSearches.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsFocused(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSearches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSearches.length) % filteredSearches.length);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsFocused(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
      onClose?.();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSearches.length) {
        e.preventDefault();
        const selectedTerm = filteredSearches[highlightedIndex];
        handleSelectTerm(selectedTerm);
      }
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < filteredSearches.length) {
      handleSelectTerm(filteredSearches[highlightedIndex]);
    } else {
      handleSubmit(e);
      setIsFocused(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
      onClose?.();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative flex-1', className)}>
      <form onSubmit={onFormSubmit}>
        <div className="relative flex items-center rounded-md border bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-colors">
          {/* Scope Selector Dropdown */}
          {showScopeSelector && (
            <div className="relative border-r border-border shrink-0">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as SearchScope)}
                className="appearance-none bg-transparent py-1.5 pl-2.5 pr-6 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                aria-label="Filter search scope"
              >
                <option value="all" className="bg-background text-foreground">All</option>
                <option value="title" className="bg-background text-foreground">Title</option>
                <option value="author" className="bg-background text-foreground">Author</option>
                <option value="series" className="bg-background text-foreground">Series</option>
              </select>
              <ChevronDown className="size-3 text-muted-foreground pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Search Icon Submit Button */}
          <button
            type="submit"
            aria-label="Search"
            className="pl-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
          >
            <Search className="size-4" />
          </button>

          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 h-9 text-xs sm:text-sm bg-transparent pl-2 pr-8"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                handleClear();
                setIsFocused(true);
              }}
              aria-label="Clear Search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search History Dropdown Popover */}
      {isFocused && filteredSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-popover text-popover-foreground border shadow-xl rounded-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between px-3.5 pt-3 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Recent searches</span>
          </div>

          <ScrollArea className="max-h-[min(24rem,calc(100dvh-164px))] px-1.5 pt-1.5 **:data-[slot=scroll-area-content]:min-w-0!">
            <div className="flex flex-col gap-0.5 mb-1.5">
              {filteredSearches.map((term, index) => {
                const isHighlighted = highlightedIndex === index;
                return (
                  <div
                    key={term}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => handleSelectTerm(term)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-colors group select-none",
                      isHighlighted
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/60 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <History className="size-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{term}</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(term);
                      }}
                      aria-label={`Remove ${term} from search history`}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity rounded-md"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )
      }
    </div >
  );
};

export default SearchBar;
