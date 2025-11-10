'use client';

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HomeSearchProps {
  className?: string;
}

export default function HomeSearch({ className }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    scientific_name: string;
    common_name: string | null;
    slug: string;
    iucn_status: string | null;
  }>>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim();
    if (term.length > 0) {
      const params = new URLSearchParams({ search: term });
      router.push(`/species?${params.toString()}`);
    } else {
      router.push('/species');
    }
  };

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(await res.text());
        const payload = await res.json();
        const items = Array.isArray(payload.data) ? payload.data : [];
        setSuggestions(items);
        setOpen(items.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const s = suggestions[activeIndex];
      router.push(`/species/${s.slug}`);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8EB69B] h-5 w-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search species by name, taxonomy, or habitat..."
          className="pl-12 pr-10 py-4 text-lg bg-[#163832]/50 border-[#8EB69B]/30 text-[#DAF1DE] placeholder-[#8EB69B]/60 focus:border-[#8EB69B] focus:outline-none"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="home-search-suggestions"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#8EB69B]" />
        )}

        {open && suggestions.length > 0 && (
          <div
            id="home-search-suggestions"
            className="absolute z-20 mt-2 w-full rounded-lg border border-[#8EB69B]/20 bg-[#0B2B26] text-[#DAF1DE] shadow-xl shadow-[#0B2B26]/40 overflow-hidden"
            role="listbox"
          >
            {suggestions.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => router.push(`/species/${s.slug}`)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#163832] ${
                  idx === activeIndex ? 'bg-[#163832]' : ''
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {s.common_name || s.scientific_name}
                  </div>
                  {s.common_name && (
                    <div className="text-xs text-[#8EB69B] truncate italic">
                      {s.scientific_name}
                    </div>
                  )}
                </div>
                {s.iucn_status && (
                  <div className="ml-3 flex items-center gap-1 text-xs text-[#8EB69B]">
                    <Shield className="h-3 w-3" />
                    {s.iucn_status}
                  </div>
                )}
              </button>
            ))}
            <div className="border-t border-[#163832]">
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm text-[#8EB69B] hover:bg-[#163832]"
              >
                Search all results for "{query.trim()}"
              </button>
            </div>
          </div>
        )}
        {/* Hidden submit to allow Enter key without changing layout */}
        <button type="submit" className="hidden" aria-hidden="true" />
      </div>
    </form>
  );
}
