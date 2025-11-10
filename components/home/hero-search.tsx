'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpeciesSearch } from '@/hooks/useSpeciesSearch';
import SearchDropdown from '@/components/ui/SearchDropdown';

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_LIMIT = 8;

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { results, loading, error } = useSpeciesSearch(
    debouncedQuery,
    SUGGESTION_LIMIT
  );

  const [open, setOpen] = useState(false);

  // Buka dropdown hanya jika query valid
  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) setOpen(true);
    else setOpen(false);
  }, [debouncedQuery]);

  const suggestions = useMemo(
    () => results.slice(0, SUGGESTION_LIMIT),
    [results]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/species?search=${encodeURIComponent(q)}`);
  };

  const clearQuery = () => setQuery('');

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
        {/* Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8EB69B] h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search species by name, taxonomy, or habitat..."
            aria-label="Search species"
            onFocus={() => debouncedQuery.length >= MIN_QUERY_LENGTH && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="pl-12 pr-10 py-3 text-base sm:text-lg bg-[#163832]/50 border-[#8EB69B]/30 text-[#DAF1DE] placeholder-[#8EB69B]/60 focus:border-[#8EB69B] focus:outline-none"
          />
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/70 hover:text-[#DAF1DE] focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE] flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </form>

      {/* Helper text */}
      <div className="mt-2 text-xs sm:text-sm text-[#8EB69B]/80">
        Powerful search looks through scientific names, common names, taxonomy, and habitats.
      </div>

      {/* Dropdown */}
      <SearchDropdown
        open={open}
        query={debouncedQuery}
        suggestions={suggestions}
        error={error}
        onClose={() => setOpen(false)}
        onSelect={(slug) => router.push(`/species/${slug}`)}
      />
    </div>
  );
}
