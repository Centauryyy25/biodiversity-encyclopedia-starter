import { supabaseLean } from '@/utils/supabase/lean-admin'
import { normalizeSpeciesRecord } from '@/lib/api/species-route-helpers'
import type { Species } from '@/types/species'

export async function getFeaturedSpecies(limit = 8): Promise<Species[]> {
  const { data, error } = await supabaseLean
    .from('species')
    .select('*')
    .eq('featured', true)
    .order('scientific_name', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[getFeaturedSpecies] Failed to load featured species:', error)
    return []
  }

  return (data ?? []).map((record) => normalizeSpeciesRecord(record as Species))
}
