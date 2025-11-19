import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { slugify } from '@/lib/api/species-route-helpers'

export function normalizeSubmissionPayload(payload: SpeciesSubmissionPayload): SpeciesSubmissionPayload {
  return {
    ...payload,
    scientific_name: payload.scientific_name.trim(),
    common_name: payload.common_name?.trim() ?? '',
    slug: (payload.slug || slugify(payload.scientific_name)).trim(),
    kingdom: payload.kingdom?.trim() ?? '',
    phylum: payload.phylum?.trim() ?? '',
    class: payload.class?.trim() ?? '',
    order: payload.order?.trim() ?? '',
    family: payload.family?.trim() ?? '',
    genus: payload.genus?.trim() ?? '',
    species: payload.species?.trim() ?? '',
    description: payload.description?.trim() ?? '',
    info_detail: payload.info_detail?.trim() ?? '',
    morphology: payload.morphology?.trim() ?? '',
    habitat_description: payload.habitat_description?.trim() ?? '',
    conservation_status: payload.conservation_status?.trim() ?? '',
    iucn_status: payload.iucn_status?.trim() ?? '',
    featured: Boolean(payload.featured),
    image_urls: (payload.image_urls ?? []).map((url) => url.trim()),
    habitat_map_coords: payload.habitat_map_coords ?? null,
  }
}
