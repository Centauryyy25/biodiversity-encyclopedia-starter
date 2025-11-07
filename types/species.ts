export interface Species {
  id: string;
  scientific_name: string;
  common_name: string | null;
  slug: string;
  kingdom: string | null;
  phylum: string | null;
  class: string | null;
  order: string | null;
  family: string | null;
  genus: string | null;
  species: string | null;
  description: string | null;
  morphology: string | null;
  habitat_description: string | null;
  conservation_status: string | null;
  iucn_status: string | null;
  featured: boolean;
  image_urls: string[];
  habitat_map_coords: {
    latitude: number;
    longitude: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyHierarchy {
  id: string;
  species_id: string;
  kingdom: string | null;
  phylum: string | null;
  class: string | null;
  order: string | null;
  family: string | null;
  genus: string | null;
  species: string | null;
  subspecies: string | null;
  created_at: string;
}

export interface ConservationData {
  id: string;
  species_id: string;
  iucn_status: string | null;
  iucn_category: string | null;
  population_trend: string | null;
  population_size: string | null;
  threat_level: string | null;
  threats: string[];
  conservation_actions: string[];
  habitat_protection: boolean | null;
  last_assessed: string | null;
  assessor: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpeciesImage {
  id: string;
  species_id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  photographer: string | null;
  license: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface SpeciesWithDetails extends Species {
  taxonomy?: TaxonomyHierarchy | null;
  conservation?: ConservationData | null;
  images?: SpeciesImage[] | null;
}

export interface SearchResult {
  id: string;
  scientific_name: string;
  common_name: string | null;
  slug: string;
  description: string | null;
  iucn_status: string | null;
  featured: boolean;
  rank: number;
}

export interface FeaturedSpecies {
  id: string;
  scientific_name: string;
  common_name: string | null;
  slug: string;
  description: string | null;
  iucn_status: string | null;
  image_urls: string[];
  featured: boolean;
}

// Database function parameters
export interface SearchSpeciesParams {
  search_query: string;
}

export interface GetFeaturedSpeciesParams {
  limit_count?: number;
}

// API response types
export interface SpeciesApiResponse {
  data: SpeciesWithDetails | null;
  error?: string;
}

export interface SpeciesListApiResponse {
  data: Species[] | null;
  error?: string;
}

export interface SearchApiResponse {
  data: SearchResult[] | null;
  error?: string;
}

export interface FeaturedSpeciesApiResponse {
  data: FeaturedSpecies[] | null;
  error?: string;
}