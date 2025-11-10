'use client';

import { useEffect, useRef, useState } from 'react';
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
  pageSize?: number;
  initialSearch?: string;
  initialKingdom?: string;
  initialStatus?: string;
}

interface CatalogResponse {
  data: Species[];
  metadata?: {
    count: number;
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
  pageSize = 24,
  initialSearch = '',
  initialKingdom = 'all',
  initialStatus = 'all',
}: SpeciesCatalogClientProps) {
  const [species, setSpecies] = useState<Species[]>(initialSpecies);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [kingdomFilter, setKingdomFilter] = useState(initialKingdom);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setSpecies(initialSpecies);
    setTotalCount(initialCount);
  }, [initialSpecies, initialCount]);

  useEffect(() => {
    setSearchTerm(initialSearch);
    setKingdomFilter(initialKingdom);
    setStatusFilter(initialStatus);
    hasInitialized.current = false;
  }, [initialSearch, initialKingdom, initialStatus]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ limit: String(pageSize) });

        const trimmedSearch = searchTerm.trim();
        if (trimmedSearch) {
          params.set('search', trimmedSearch);
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

        setSpecies(payload.data ?? []);
        setTotalCount(payload.metadata?.count ?? payload.data?.length ?? 0);

        if (payload.error) {
          setError(typeof payload.error === 'string' ? payload.error : 'Unknown error');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load species catalog');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchTerm, kingdomFilter, statusFilter, pageSize]);

  const resetFilters = () => {
    if (searchTerm === '' && kingdomFilter === 'all' && statusFilter === 'all') {
      return;
    }
    setSearchTerm('');
    setKingdomFilter('all');
    setStatusFilter('all');
    setError(null);
  };

  const trimmedSearchTerm = searchTerm.trim();
  const isDefaultFilters =
    trimmedSearchTerm === '' && kingdomFilter === 'all' && statusFilter === 'all';

  return (
    <div className="space-y-6">
      <div className="bg-[#163832]/50 border border-[#8EB69B]/20 rounded-xl p-4 shadow-lg shadow-[#0B2B26]/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#DAF1DE]">Search species</label>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by common or scientific name..."
              className="bg-[#0B2B26]/60 border-[#8EB69B]/30 text-[#DAF1DE] placeholder-[#8EB69B]/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#DAF1DE]">Kingdom</label>
            <Select value={kingdomFilter} onValueChange={setKingdomFilter}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {trimmedSearchTerm && ` for “${trimmedSearchTerm}”`}
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {species.length === 0 && !loading ? (
        <div className="text-center py-16 bg-[#163832]/30 border border-dashed border-[#8EB69B]/20 rounded-xl">
          <p className="text-lg text-[#DAF1DE] mb-2">No species found</p>
          <p className="text-sm text-[#8EB69B]">
            Try adjusting your search, or reset the filters to see all available species.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading ? Array.from({ length: 6 }) : species).map((item, index) =>
            loading ? (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse bg-[#163832]/40 border border-[#8EB69B]/10 rounded-xl h-64"
              />
            ) : (
              <SpeciesCard key={item.id} species={item} />
            )
          )}
        </div>
      )}
    </div>
  );
}
