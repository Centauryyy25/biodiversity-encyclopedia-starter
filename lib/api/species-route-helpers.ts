import { z } from 'zod';
import type { Species } from '@/types/species';

type RawSpeciesRecord = Species & {
  image_urls?: unknown;
  habitat_map_coords?: unknown;
};

export const speciesPayloadSchema = z.object({
  scientific_name: z.string().min(2, 'Scientific name is required'),
  common_name: z.string().min(2).max(120).optional().nullable(),
  slug: z.string().min(2).optional(),
  kingdom: z.string().min(2).max(120).optional().nullable(),
  phylum: z.string().min(2).max(120).optional().nullable(),
  class: z.string().min(2).max(120).optional().nullable(),
  order: z.string().min(2).max(120).optional().nullable(),
  family: z.string().min(2).max(120).optional().nullable(),
  genus: z.string().min(2).max(120).optional().nullable(),
  species: z.string().min(1).max(120).optional().nullable(),
  description: z.string().min(10).optional().nullable(),
  info_detail: z.string().optional().nullable(),
  morphology: z.string().optional().nullable(),
  habitat_description: z.string().optional().nullable(),
  conservation_status: z.string().optional().nullable(),
  iucn_status: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  image_urls: z.array(z.string().min(1)).optional().default([]),
  habitat_map_coords: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional()
    .nullable(),
});

export const speciesUpdateSchema = speciesPayloadSchema.partial();

export const sanitizeSearchTerm = (value: string) => value.replace(/[,%()]/g, '').trim();

export const normalizeSpeciesRecord = (record: RawSpeciesRecord): Species => ({
  ...record,
  image_urls: Array.isArray(record.image_urls)
    ? (record.image_urls as string[])
    : [],
  habitat_map_coords:
    record.habitat_map_coords && typeof record.habitat_map_coords === 'object'
      ? (record.habitat_map_coords as Species['habitat_map_coords'])
      : null,
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
