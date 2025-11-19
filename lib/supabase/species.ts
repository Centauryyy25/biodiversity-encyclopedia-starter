import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeSearchTerm } from '@/lib/api/species-route-helpers';
import type {
  Species,
  SpeciesWithDetails,
  SpeciesApiResponse,
  SpeciesListApiResponse,
  SearchApiResponse,
  FeaturedSpeciesApiResponse,
  SearchResult,
  FeaturedSpecies,
  ConservationData,
  SpeciesImage,
  TaxonomyHierarchy,
} from '@/types/species';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Database,
} from '@/types/database.types';

const supabase = createServerSupabaseClient();
type SpeciesRow = Tables<'species'>;
type ConservationRow = Tables<'conservation_data'> | null;
type SpeciesImageRow = Tables<'species_images'>;
type FeaturedFunctionRow =
  Database['public']['Functions']['get_featured_species']['Returns'][number];
type SearchFunctionRow =
  Database['public']['Functions']['search_species']['Returns'][number];

export interface SpeciesCatalogFilters {
  limit?: number;
  offset?: number;
  featured?: boolean;
  kingdom?: string | null;
  iucnStatus?: string | null;
  search?: string | null;
}

export interface SpeciesCatalogResult {
  data: Species[];
  count: number;
  error: string | null;
}

const mapSpeciesRow = (row: SpeciesRow): Species => ({
  ...row,
  featured: Boolean(row.featured),
  image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
  habitat_map_coords:
    row.habitat_map_coords && typeof row.habitat_map_coords === 'object'
      ? (row.habitat_map_coords as Species['habitat_map_coords'])
      : null,
  info_detail: row.info_detail ?? null,
});

const mapConservationRow = (
  row: ConservationRow
): SpeciesWithDetails['conservation'] => {
  if (!row) return null;
  return {
    ...(row as ConservationData),
    threats: row.threats ?? [],
    conservation_actions: row.conservation_actions ?? [],
    habitat_protection: row.habitat_protection ?? null,
  };
};

const mapImageRows = (
  rows: SpeciesImageRow[] | null
): SpeciesWithDetails['images'] => {
  if (!rows) return [];
  return rows.map(
    (image): SpeciesImage => ({
      ...image,
      is_primary: Boolean(image.is_primary),
      sort_order: image.sort_order ?? 0,
    })
  );
};

/**
 * Fetch a single species by slug
 */
export async function getSpeciesBySlug(slug: string): Promise<SpeciesApiResponse> {
  try {
    const { data: speciesRow, error: speciesError } = await supabase
      .from('species')
      .select('*')
      .eq('slug', slug)
      .single();

    if (speciesError) {
      console.error('Error fetching species:', speciesError);
      return { data: null, error: speciesError.message };
    }

    if (!speciesRow) {
      return { data: null, error: 'Species not found' };
    }

    // Fetch related data
    const { data: taxonomy } = await supabase
      .from('taxonomy_hierarchy')
      .select('*')
      .eq('species_id', speciesRow.id)
      .single();

    const { data: conservation } = await supabase
      .from('conservation_data')
      .select('*')
      .eq('species_id', speciesRow.id)
      .single();

    const { data: images } = await supabase
      .from('species_images')
      .select('*')
      .eq('species_id', speciesRow.id)
      .order('sort_order', { ascending: true });

    const speciesWithDetails: SpeciesWithDetails = {
      ...mapSpeciesRow(speciesRow),
      taxonomy: (taxonomy as TaxonomyHierarchy | null),
      conservation: mapConservationRow(conservation as ConservationRow),
      images: mapImageRows(images as SpeciesImageRow[] | null),
    };

    return { data: speciesWithDetails };
  } catch (error) {
    console.error('Error in getSpeciesBySlug:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Fetch all species (with optional pagination)
 */
export async function getAllSpecies(
  limit: number = 50,
  offset: number = 0,
  featured: boolean = false
): Promise<SpeciesListApiResponse> {
  try {
    let query = supabase
      .from('species')
      .select('*')
      .order('scientific_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (featured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching species list:', error);
      return { data: null, error: error.message };
    }

    return { data: (data ?? []).map((row) => mapSpeciesRow(row as SpeciesRow)) };
  } catch (error) {
    console.error('Error in getAllSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Fetch the catalog snapshot with robust logging to keep RSC data fresh.
 */
export async function getSpeciesCatalogSnapshot(
  filters: SpeciesCatalogFilters = {}
): Promise<SpeciesCatalogResult> {
  const {
    limit = 12,
    offset = 0,
    featured = false,
    kingdom,
    iucnStatus,
    search,
  } = filters;

  try {
    let query = supabase
      .from('species')
      .select('*', { count: 'exact' })
      .order('featured', { ascending: false })
      .order('scientific_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (featured) {
      query = query.eq('featured', true);
    }

    if (kingdom && kingdom !== 'all') {
      query = query.ilike('kingdom', kingdom);
    }

    if (iucnStatus && iucnStatus !== 'all') {
      query = query.eq('iucn_status', iucnStatus);
    }

    if (search) {
      const term = sanitizeSearchTerm(search);
      if (term) {
        query = query.or(
          `scientific_name.ilike.%${term}%,common_name.ilike.%${term}%`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Supabase Fetch Error]', error.message);
      return {
        data: [],
        count: 0,
        error: `Failed to fetch species list: ${error.message}`,
      };
    }

    const mapped = (data ?? []).map((row) => mapSpeciesRow(row as SpeciesRow));
    console.info(
      `[Supabase Fetch Success] Loaded ${
        mapped.length
      } species at ${new Date().toISOString()} (filters=${JSON.stringify({
        limit,
        offset,
        featured,
        kingdom,
        iucnStatus,
        hasSearch: Boolean(search),
      })})`
    );

    return {
      data: mapped,
      count: count ?? mapped.length,
      error: null,
    };
  } catch (error) {
    console.error('[Unexpected Fetch Error]', error);
    return {
      data: [],
      count: 0,
      error: 'Unexpected error while fetching species data',
    };
  }
}

/**
 * Search species using the database function
 */
export async function searchSpecies(
  searchQuery: string
): Promise<SearchApiResponse> {
  try {
    const { data, error } = await supabase.rpc('search_species', {
      search_query: searchQuery,
    });

    if (error) {
      console.error('Error searching species:', error);
      return { data: null, error: error.message };
    }

    const mapped: SearchResult[] = (data ?? []).map((row: SearchFunctionRow) => ({
      id: row.id,
      scientific_name: row.scientific_name ?? '',
      common_name: row.common_name ?? null,
      slug: row.slug ?? '',
      description: row.description ?? null,
      iucn_status: row.iucn_status ?? null,
      featured: Boolean(row.featured),
      rank: row.rank ?? 0,
    }));

    return { data: mapped };
  } catch (error) {
    console.error('Error in searchSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get featured species using the database function
 */
export async function getFeaturedSpecies(
  limit: number = 8
): Promise<FeaturedSpeciesApiResponse> {
  try {
    const { data, error } = await supabase.rpc('get_featured_species', {
      limit_count: limit,
    });

    if (error) {
      console.error('Error fetching featured species:', error);
      return { data: null, error: error.message };
    }

    const featuredRows = (data as FeaturedFunctionRow[] | null) ?? [];
    const payload: FeaturedSpecies[] = featuredRows.map((row) => ({
      id: row.id,
      scientific_name: row.scientific_name ?? '',
      common_name: row.common_name ?? null,
      slug: row.slug ?? '',
      description: row.description ?? null,
      iucn_status: row.iucn_status ?? null,
      image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
      featured: Boolean(row.featured),
    }));
    return {
      data: payload,
    };
  } catch (error) {
    console.error('Error in getFeaturedSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get species by kingdom
 */
export async function getSpeciesByKingdom(
  kingdom: string,
  limit: number = 50
): Promise<SpeciesListApiResponse> {
  try {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('kingdom', kingdom)
      .order('scientific_name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching species by kingdom:', error);
      return { data: null, error: error.message };
    }

    return { data: (data ?? []).map((row) => mapSpeciesRow(row as SpeciesRow)) };
  } catch (error) {
    console.error('Error in getSpeciesByKingdom:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get species by conservation status
 */
export async function getSpeciesByConservationStatus(
  status: string,
  limit: number = 50
): Promise<SpeciesListApiResponse> {
  try {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('iucn_status', status)
      .order('scientific_name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching species by conservation status:', error);
      return { data: null, error: error.message };
    }

    return { data: (data ?? []).map((row) => mapSpeciesRow(row as SpeciesRow)) };
  } catch (error) {
    console.error('Error in getSpeciesByConservationStatus:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Create a new species (requires authentication)
 */
export async function createSpecies(
  species: Omit<Species, 'id' | 'created_at' | 'updated_at'>
): Promise<SpeciesApiResponse> {
  try {
    const insertPayload: TablesInsert<'species'> = species as TablesInsert<'species'>;

    const { data, error } = await supabase
      .from('species')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating species:', error);
      return { data: null, error: error.message };
    }

    return { data: mapSpeciesRow(data as SpeciesRow) };
  } catch (error) {
    console.error('Error in createSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Update an existing species (requires authentication)
 */
export async function updateSpecies(
  id: string,
  updates: Partial<Species>
): Promise<SpeciesApiResponse> {
  try {
    const updatePayload: TablesUpdate<'species'> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('species')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating species:', error);
      return { data: null, error: error.message };
    }

    return { data: mapSpeciesRow(data as SpeciesRow) };
  } catch (error) {
    console.error('Error in updateSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Delete a species (requires authentication)
 */
export async function deleteSpecies(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('species')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting species:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteSpecies:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
