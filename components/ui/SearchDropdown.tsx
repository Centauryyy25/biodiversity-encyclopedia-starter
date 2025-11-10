'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Species } from '@/types/species';
import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  query: string;
  suggestions: Species[];
  error: string | null;
  onSelect: (slug: string) => void;
  onClose: () => void;
  maxHeightClass?: string; // untuk override ketinggian
};

export default function SearchDropdown({
  open,
  query,
  suggestions,
  error,
  onSelect,
  onClose,
  maxHeightClass = 'max-h-72',
}: Props) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Reset fokus saat daftar berubah
  useEffect(() => {
    setActiveIndex(suggestions.length ? 0 : -1);
  }, [suggestions]);

  // Tutup dropdown bila Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="listbox"
      aria-label="Search suggestions"
      className="mt-3 bg-[#0B2B26]/90 border border-[#8EB69B]/30 rounded-xl backdrop-blur-sm shadow-lg shadow-black/20"
    >
      {error ? (
        <div className="px-4 py-3 text-sm text-red-300">{error}</div>
      ) : suggestions.length === 0 && query.length >= 2 ? (
        <div className="px-4 py-3 text-sm text-[#8EB69B]">
          No species found for “{query}”.
        </div>
      ) : (
        <ul
          ref={listRef}
          className={cn(
            'divide-y divide-[#163832]/60 overflow-y-auto',
            'transition-all duration-200',
            maxHeightClass
          )}
        >
          {suggestions.map((sp, idx) => {
            const label = sp.common_name || sp.scientific_name;
            const sub = sp.common_name ? sp.scientific_name : 'Scientific classification';
            const active = idx === activeIndex;
            return (
              <li key={sp.id}>
                {/* onMouseDown agar tidak kehilangan fokus sebelum klik */}
                <Link
                  href={`/species/${sp.slug}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(sp.slug)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors',
                    'text-[#DAF1DE] hover:bg-[#163832]/80',
                    active && 'bg-[#163832]/70'
                  )}
                  role="option"
                  aria-selected={active}
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-[#8EB69B] italic">{sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#8EB69B]" />
                </Link>
              </li>
            );
          })}
          {query.length >= 2 && (
            <li>
              <Link
                href={`/species?search=${encodeURIComponent(query)}`}
                onMouseDown={(e) => e.preventDefault()}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#8EB69B] hover:bg-[#163832]/80"
              >
                View all results for “{query}”
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
