'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SpeciesPagination from '@/components/pagination/Pagination';
import { SpeciesCard } from '@/components/species';
import type { Species } from '@/types/species';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SpeciesCatalogClientProps {
  initialSpecies: Species[];
  initialCount: number;
  currentPage?: number;
  pageSize?: number;
  initialSearch?: string;
  initialKingdom?: string;
  initialStatus?: string;
  disableInitialFetch?: boolean;
}

interface CatalogResponse {
  data: Species[];
  metadata?: {
    count?: number;
    limit?: number;
    offset?: number;
  };
  error?: string;
}

const KINGDOM_FILTERS = [
  { label: 'All kingdoms', value: 'all' },
  { label: 'Animalia', value: 'Animalia' },
  { label: 'Plantae', value: 'Plantae' },
  { label: 'Fungi', value: 'Fungi' },
  { label: 'Protista', value: 'Protista' },
];

const STATUS_FILTERS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Least Concern (LC)', value: 'LC' },
  { label: 'Near Threatened (NT)', value: 'NT' },
  { label: 'Vulnerable (VU)', value: 'VU' },
  { label: 'Endangered (EN)', value: 'EN' },
  { label: 'Critically Endangered (CR)', value: 'CR' },
  { label: 'Extinct in the Wild (EW)', value: 'EW' },
];

export default function SpeciesCatalogClient({
  initialSpecies,
  initialCount,
  currentPage = 1,
  pageSize = 12,
  initialSearch = '',
  initialKingdom = 'all',
  initialStatus = 'all',
  disableInitialFetch = false,
}: SpeciesCatalogClientProps) {
  const [species, setSpecies] = useState<Species[]>(initialSpecies);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [kingdomFilter, setKingdomFilter] = useState(initialKingdom);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const trimmedSearchTerm = searchTerm.trim();
  const derivedTotalPages = useMemo(
    () => Math.max(1, Math.ceil(Math.max(totalCount, 0) / pageSize)),
    [totalCount, pageSize]
  );

  useEffect(() => {
    setSpecies(initialSpecies);
    setTotalCount(initialCount);
  }, [initialSpecies, initialCount]);

  useEffect(() => {
    setSearchTerm(initialSearch);
    setKingdomFilter(initialKingdom);
    setStatusFilter(initialStatus);
    setPage(currentPage);
    hasInitialized.current = false;
  }, [initialSearch, initialKingdom, initialStatus, currentPage, disableInitialFetch]);

  useEffect(() => {
    const targetPage = Math.max(1, Math.min(page, derivedTotalPages));
    if (targetPage !== page) {
      setPage(targetPage);
    }
  }, [derivedTotalPages, page]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (disableInitialFetch) return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const offset = Math.max(page - 1, 0) * pageSize;
        const params = new URLSearchParams({
          limit: String(pageSize),
          offset: String(offset),
        });

        if (trimmedSearchTerm) {
          params.set('search', trimmedSearchTerm);
        }

        if (kingdomFilter !== 'all') {
          params.set('kingdom', kingdomFilter);
        }

        if (statusFilter !== 'all') {
          params.set('iucn_status', statusFilter);
        }

        const response = await fetch(`/api/species?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load species catalog');
        }

        const payload: CatalogResponse = await response.json();
        const count = payload.metadata?.count;

        setSpecies(payload.data ?? []);
        setTotalCount((previous) => (typeof count === 'number' ? count : previous));

        if (payload.error) {
          console.warn('[SpeciesCatalogClient Warning]', payload.error);
          setError(typeof payload.error === 'string' ? payload.error : 'Unknown error');
        }

        const safeCount = typeof count === 'number' ? count : totalCount;
        const nextTotalPages = Math.max(1, Math.ceil(Math.max(safeCount, 0) / pageSize));
        const clampedPage = Math.max(1, Math.min(page, nextTotalPages));
        if (clampedPage !== page) {
          setPage(clampedPage);
        }
      } catch (err) {
        console.error('[SpeciesCatalogClient Fetch Error]', err);
        setError(err instanceof Error ? err.message : 'Failed to load species catalog');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchTerm, kingdomFilter, statusFilter, page, pageSize, disableInitialFetch, trimmedSearchTerm, totalCount]);

  useEffect(() => {
    syncQueryString({
      page,
      search: trimmedSearchTerm,
      kingdom: kingdomFilter,
      status: statusFilter,
    });
  }, [page, trimmedSearchTerm, kingdomFilter, statusFilter]);

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(nextPage, derivedTotalPages));
    if (clamped !== page) {
      setPage(clamped);
      scrollToGrid();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleKingdomChange = (value: string) => {
    setKingdomFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const resetFilters = () => {
    if (searchTerm === '' && kingdomFilter === 'all' && statusFilter === 'all') {
      return;
    }
    setSearchTerm('');
    setKingdomFilter('all');
    setStatusFilter('all');
    setPage(1);
    setError(null);
  };

  const isDefaultFilters =
    trimmedSearchTerm === '' && kingdomFilter === 'all' && statusFilter === 'all';
  const showPagination = derivedTotalPages > 1 && species.length > 0;
  const shouldShowGrid = species.length > 0 || loading;

  return (
    <div className="space-y-8">
      <div className="bg-[#163832]/50 border border-[#8EB69B]/20 rounded-xl p-4 shadow-lg shadow-[#0B2B26]/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#DAF1DE]">Search species</label>
            <Input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by common or scientific name..."
              className="bg-[#0B2B26]/60 border-[#8EB69B]/30 text-[#DAF1DE] placeholder-[#8EB69B]/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#DAF1DE]">Kingdom</label>
            <Select value={kingdomFilter} onValueChange={handleKingdomChange}>
              <SelectTrigger className="bg-[#0B2B26]/60 border-[#8EB69B]/30 text-[#DAF1DE]">
                <SelectValue placeholder="All kingdoms" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B2B26] text-[#DAF1DE] border-[#163832]">
                {KINGDOM_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#DAF1DE]">Conservation status</label>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-[#0B2B26]/60 border-[#8EB69B]/30 text-[#DAF1DE]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B2B26] text-[#DAF1DE] border-[#163832]">
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between text-sm text-[#8EB69B]">
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {totalCount} species match your filters
              {trimmedSearchTerm && ` for "${trimmedSearchTerm}"`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#8EB69B] hover:text-[#051F20]"
            disabled={isDefaultFilters && !error}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="bg-[#401414]/60 border border-[#F87171]/40 text-[#FECACA]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load the latest catalog data. {error}. Showing cached results if available.
          </AlertDescription>
        </Alert>
      )}

      <div
        id="species-card-wrapper"
        className="space-y-6 rounded-2xl border border-[#8EB69B]/20 bg-[#163832]/60 backdrop-blur-md shadow-xl shadow-[#0B2B26]/30 p-6"
      >
        {shouldShowGrid ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-pulse bg-[#0B2B26]/60 border border-[#8EB69B]/10 rounded-xl h-64"
                  />
                ))
              : species.map((item) => <SpeciesCard key={item.id} species={item} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#163832]/40 border border-dashed border-[#8EB69B]/20 rounded-xl">
            <p className="text-lg text-[#DAF1DE] mb-2">No species found</p>
            <p className="text-sm text-[#8EB69B]">
              Try adjusting your search, or reset the filters to see all available species.
            </p>
          </div>
        )}

        {showPagination && (
          <SpeciesPagination
            currentPage={page}
            totalPages={derivedTotalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

function syncQueryString({
  page,
  search,
  kingdom,
  status,
}: {
  page: number;
  search?: string;
  kingdom?: string;
  status?: string;
}) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (kingdom && kingdom !== 'all') params.set('kingdom', kingdom);
  if (status && status !== 'all') params.set('iucn_status', status);
  params.set('page', String(page));

  const qs = params.toString();
  const href = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', href);
}

function scrollToGrid() {
  if (typeof document === 'undefined') return;
  const wrapper = document.getElementById('species-card-wrapper');
  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
