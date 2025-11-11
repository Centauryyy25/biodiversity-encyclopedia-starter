import type { Metadata } from 'next';
import SpeciesCatalogClient from '@/components/species/species-catalog-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getSpeciesCatalogSnapshot } from '@/lib/supabase/species';

const PAGE_SIZE = 24;
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Species Encyclopedia | FloraFauna',
  description:
    'Browse the FloraFauna encyclopedia to study detailed species profiles, taxonomy, and conservation data across kingdoms.',
};

type SpeciesPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const search =
    typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : undefined;
  const kingdom =
    typeof resolvedSearchParams?.kingdom === 'string' ? resolvedSearchParams.kingdom : undefined;
  const status =
    typeof resolvedSearchParams?.iucn_status === 'string'
      ? resolvedSearchParams.iucn_status
      : undefined;

  const initialPayload = await getSpeciesCatalogSnapshot({
    search,
    kingdom,
    iucnStatus: status,
    limit: PAGE_SIZE,
  });
  const initialSpecies = initialPayload.data;
  const initialCount = initialPayload.count;

  if (initialPayload.error) {
    console.warn('[SpeciesPage Warning]', initialPayload.error);
  }

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
              Unable to load the latest catalog data. {initialPayload.error}. Showing cached results
              where available.
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
