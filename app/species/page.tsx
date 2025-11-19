import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SpeciesCatalogClient from '@/components/species/species-catalog-client';
import { FadeIn } from '@/components/ui/fade-in';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getSpeciesCatalogSnapshot } from '@/lib/supabase/species';

const PAGE_SIZE = 12;
export const revalidate = 120;

type SearchParams = { [key: string]: string | string[] | undefined };

const coerceParam = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

const buildUrlWithPage = (page: number, params: SearchParams) => {
  const query = new URLSearchParams();
  const search = coerceParam(params.search);
  const kingdom = coerceParam(params.kingdom);
  const status = coerceParam(params.iucn_status);

  if (search) query.set('search', search);
  if (kingdom) query.set('kingdom', kingdom);
  if (status) query.set('iucn_status', status);
  query.set('page', String(page));

  const qs = query.toString();
  return qs ? `/species?${qs}` : '/species';
};

const resolveSearchParams = async (params?: Promise<SearchParams>) =>
  (params ? (await params) ?? {} : {}) as SearchParams;

export async function generateMetadata(
  { searchParams }: { searchParams?: Promise<SearchParams> }
): Promise<Metadata> {
  const resolvedParams = await resolveSearchParams(searchParams);
  const pageParam = coerceParam(resolvedParams.page);
  const page = Number.parseInt(pageParam ?? '1', 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const title =
    safePage > 1
      ? `Species Encyclopedia - Page ${safePage} | FloraFauna`
      : 'Species Encyclopedia | FloraFauna';

  const canonical = buildUrlWithPage(safePage, resolvedParams);

  return {
    title,
    description:
      'Browse the FloraFauna encyclopedia to study detailed species profiles, taxonomy, and conservation data across kingdoms.',
    alternates: {
      canonical,
    },
  };
}

export default async function SpeciesPage(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  const resolvedParams = await resolveSearchParams(searchParams);
  const search = coerceParam(resolvedParams.search);
  const kingdom = coerceParam(resolvedParams.kingdom);
  const status = coerceParam(resolvedParams.iucn_status);

  const pageParam = coerceParam(resolvedParams.page);
  const parsedPage = Number.parseInt(pageParam ?? '1', 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    redirect(buildUrlWithPage(1, resolvedParams));
  }

  const offset = (page - 1) * PAGE_SIZE;

  const initialPayload = await getSpeciesCatalogSnapshot({
    search,
    kingdom,
    iucnStatus: status,
    limit: PAGE_SIZE,
    offset,
  });
  const initialSpecies = initialPayload.data;
  const initialCount = initialPayload.count;
  const totalPages = Math.max(1, Math.ceil((initialCount ?? 0) / PAGE_SIZE));

  if (page > totalPages && totalPages > 0) {
    redirect(buildUrlWithPage(1, resolvedParams));
  }

  if (initialPayload.error) {
    console.warn('[SpeciesPage Warning]', initialPayload.error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347] py-16">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-12 space-y-10">
        <FadeIn className="space-y-4 text-center">
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
        </FadeIn>

        {initialPayload.error && (
          <Alert className="bg-[#401414]/60 border border-[#F87171]/40 text-[#FECACA]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load the latest catalog data. {initialPayload.error}. Showing cached results
              where available.
            </AlertDescription>
          </Alert>
        )}

        <FadeIn>
          <SpeciesCatalogClient
            initialSpecies={initialSpecies}
            initialCount={initialCount}
            currentPage={page}
            pageSize={PAGE_SIZE}
            initialSearch={search ?? ''}
            initialKingdom={kingdom ?? 'all'}
            initialStatus={status ?? 'all'}
            disableInitialFetch
          />
        </FadeIn>
      </div>
    </div>
  );
}
