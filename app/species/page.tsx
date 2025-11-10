import { headers } from 'next/headers';
import type { Metadata } from 'next';
import SpeciesCatalogClient from '@/components/species/species-catalog-client';
import type { Species } from '@/types/species';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SpeciesListResponse {
  data: Species[];
  metadata?: {
    count: number;
  };
  error?: string;
}

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: 'Species Encyclopedia | FloraFauna',
  description:
    'Browse the FloraFauna encyclopedia to study detailed species profiles, taxonomy, and conservation data across kingdoms.',
};

const resolveBaseUrl = () => {
  const headerStore = headers();
  const forwardedProto = headerStore.get('x-forwarded-proto') ?? 'http';
  const host = headerStore.get('host');

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (!host) {
    return 'http://localhost:3000';
  }

  return `${forwardedProto}://${host}`;
};

interface SpeciesFilters {
  search?: string;
  kingdom?: string;
  status?: string;
}

async function fetchInitialSpecies(filters: SpeciesFilters): Promise<SpeciesListResponse> {
  const baseUrl = resolveBaseUrl();

  try {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });

    if (filters.search) {
      params.set('search', filters.search);
    }

    if (filters.kingdom) {
      params.set('kingdom', filters.kingdom);
    }

    if (filters.status) {
      params.set('iucn_status', filters.status);
    }

    const response = await fetch(`${baseUrl}/api/species?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to fetch species catalog');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to load species catalog:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default async function SpeciesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const kingdom = typeof searchParams?.kingdom === 'string' ? searchParams.kingdom : undefined;
  const status =
    typeof searchParams?.iucn_status === 'string' ? searchParams.iucn_status : undefined;

  const initialPayload = await fetchInitialSpecies({
    search,
    kingdom,
    status,
  });
  const initialSpecies = initialPayload.data ?? [];
  const initialCount = initialPayload.metadata?.count ?? initialSpecies.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347] py-16">
      <div className="container mx-auto px-4 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8EB69B]">Discover Life</p>
          <h1 className="text-4xl lg:text-5xl font-serif text-[#DAF1DE]">Species Encyclopedia</h1>
          <p className="text-[#8EB69B] max-w-3xl mx-auto leading-relaxed text-lg">
            Explore curated records spanning flora and fauna. Filter by taxonomy or conservation
            status to surface the species most relevant to your research.
          </p>
          <p className="text-sm text-[#8EB69B]/80">
            Currently tracking <span className="font-semibold text-[#DAF1DE]">{initialCount}</span>{' '}
            species
          </p>
        </div>

        {initialPayload.error && (
          <Alert className="bg-[#401414]/60 border border-[#F87171]/40 text-[#FECACA]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load the latest catalog data. Showing cached results where available.
            </AlertDescription>
          </Alert>
        )}

        <SpeciesCatalogClient
          initialSpecies={initialSpecies}
          initialCount={initialCount}
          pageSize={PAGE_SIZE}
          initialSearch={search ?? ''}
          initialKingdom={kingdom ?? 'all'}
          initialStatus={status ?? 'all'}
        />
      </div>
    </div>
  );
}
