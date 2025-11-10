'use client';

import { useEffect, useRef, useState } from 'react';
import type { Species } from '@/types/species';

type SpeciesListResponse = {
  data: Species[] | null;
  error?: string;
};

const MIN_QUERY_LENGTH = 2;

export function useSpeciesSearch(query: string, limit = 8) {
  const [results, setResults] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache hasil pencarian di memori
  const cacheRef = useRef<Map<string, Species[]>>(new Map());
  // Satu AbortController yang bisa direuse
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      // bersihkan state jika query pendek
      controllerRef.current?.abort();
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Ambil dari cache bila ada
    const cacheKey = `${q}:${limit}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setError(null);
      setLoading(false);
      return;
    }

    // Batalkan request sebelumnya
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: String(limit),
          search: q,
        });

        const res = await fetch(`/api/species?${params.toString()}`, {
          signal: controller.signal,
          // Hint ke cache browser (boleh diabaikan server)
          headers: { 'x-search-intent': 'hero' },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Unable to search species');
        }

        const payload: SpeciesListResponse = await res.json();
        const data = payload.data ?? [];
        cacheRef.current.set(cacheKey, data);
        setResults(data);
      } catch (err) {
        // Abaikan abort
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResults([]);
        setError(err instanceof Error ? err.message : 'Unable to search species');
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [query, limit]);

  return { results, loading, error };
}
