import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { SearchScope } from '@/lib/playlist';
import { addSearchHistory } from '@/lib/searchHistory';

export interface UseSearchOptions {
  onSearch?: (query: string, scope?: SearchScope) => void;
}

export function useSearch(options?: UseSearchOptions) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialScope = (searchParams.get('scope') as SearchScope) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>(initialScope);

  // Sync internal state whenever URL search params change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setScope((searchParams.get('scope') as SearchScope) || 'all');
  }, [searchParams]);

  const executeSearch = (searchVal: string, searchScope: SearchScope = scope) => {
    const trimmed = searchVal.trim();
    if (trimmed) {
      addSearchHistory(trimmed);
    }

    if (options?.onSearch) {
      options.onSearch(trimmed, searchScope);
      return;
    }

    const params = new URLSearchParams();
    if (trimmed) {
      params.set('q', trimmed);
      if (searchScope && searchScope !== 'all') {
        params.set('scope', searchScope);
      }
      navigate(`/episodes?${params.toString()}`);
    } else {
      navigate('/episodes');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, scope);
  };

  const handleClear = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    scope,
    setScope,
    handleSubmit,
    handleClear,
    executeSearch,
  };
}
