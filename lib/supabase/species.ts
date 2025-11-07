import { createClient } from '@/utils/supabase/client';
import {
  Species,
  SpeciesWithDetails,
  SearchResult,
  FeaturedSpecies,
  SearchSpeciesParams,
  GetFeaturedSpeciesParams,
  SpeciesApiResponse,
  SpeciesListApiResponse,
  SearchApiResponse,
  FeaturedSpeciesApiResponse
} from '@/types/species';

const supabase = createClient();

/**
 * Fetch a single species by slug
 */
export async function getSpeciesBySlug(slug: string): Promise<SpeciesApiResponse> {
  try {
    const { data: species, error: speciesError } = await supabase
      .from('species')
      .select('*')
      .eq('slug', slug)
      .single();

    if (speciesError) {
      console.error('Error fetching species:', speciesError);
      return { data: null, error: speciesError.message };
    }

    if (!species) {
      return { data: null, error: 'Species not found' };
    }

    // Fetch related data
    const { data: taxonomy } = await supabase
      .from('taxonomy_hierarchy')
      .select('*')
      .eq('species_id', species.id)
      .single();

    const { data: conservation } = await supabase
      .from('conservation_data')
      .select('*')
      .eq('species_id', species.id)
      .single();

    const { data: images } = await supabase
      .from('species_images')
      .select('*')
      .eq('species_id', species.id)
      .order('sort_order', { ascending: true });

    const speciesWithDetails: SpeciesWithDetails = {
      ...species,
      image_urls: species.image_urls || [],
      taxonomy,
      conservation,
      images: images || []
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

    return { data: data || [] };
  } catch (error) {
    console.error('Error in getAllSpecies:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
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
      search_query: searchQuery
    });

    if (error) {
      console.error('Error searching species:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [] };
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
      limit_count: limit
    });

    if (error) {
      console.error('Error fetching featured species:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [] };
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

    return { data: data || [] };
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

    return { data: data || [] };
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
    const { data, error } = await supabase
      .from('species')
      .insert(species)
      .select()
      .single();

    if (error) {
      console.error('Error creating species:', error);
      return { data: null, error: error.message };
    }

    return { data };
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
    const { data, error } = await supabase
      .from('species')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating species:', error);
      return { data: null, error: error.message };
    }

    return { data };
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