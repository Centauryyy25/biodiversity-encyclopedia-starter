import { z } from 'zod'
import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { normalizeSubmissionPayload } from '@/lib/api/submission-utils'

const imageListRegex = /[\n,]+/

export const contributionFormSchema = z.object({
  scientific_name: z.string().min(3, 'Scientific name is required'),
  common_name: z.string().min(2, 'Common name is required'),
  slug: z.string().min(2, 'Slug is required'),
  kingdom: z.string().min(2, 'Kingdom is required'),
  phylum: z.string().min(2, 'Phylum is required'),
  class: z.string().min(2, 'Class is required'),
  order: z.string().min(2, 'Order is required'),
  family: z.string().min(2, 'Family is required'),
  genus: z.string().min(2, 'Genus is required'),
  species: z.string().min(1, 'Species epithet is required'),
  description: z.string().min(40, 'Description must be at least 40 characters'),
  info_detail: z.string().min(60, 'Share additional detail (min 60 chars)'),
  morphology: z.string().min(30, 'Morphology must be at least 30 characters'),
  habitat_description: z.string().min(30, 'Habitat description must be at least 30 characters'),
  conservation_status: z.string().min(2, 'Conservation status is required'),
  iucn_status: z.string().min(2, 'IUCN status is required'),
  image_inputs: z
    .string()
    .min(1, 'Provide at least one reference image URL')
    .refine((value) => value.split(imageListRegex).map((line) => line.trim()).filter(Boolean).length > 0, {
      message: 'At least one valid URL is required',
    }),
  featured: z.boolean().default(false),
  habitatLatitude: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Number(value)), { message: 'Latitude must be numeric' })
    .refine((value) => !value || (Number(value) >= -90 && Number(value) <= 90), {
      message: 'Latitude must be between -90 and 90',
    }),
  habitatLongitude: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Number(value)), { message: 'Longitude must be numeric' })
    .refine((value) => !value || (Number(value) >= -180 && Number(value) <= 180), {
      message: 'Longitude must be between -180 and 180',
    }),
})
  .refine((values) => {
    const hasLat = Boolean(values.habitatLatitude?.trim())
    const hasLon = Boolean(values.habitatLongitude?.trim())
    return hasLat === hasLon
  }, {
    message: 'Provide both latitude and longitude or leave both blank.',
    path: ['habitatLatitude'],
  })

export type ContributionFormValues = z.infer<typeof contributionFormSchema>

export const emptyContributionValues: ContributionFormValues = {
  scientific_name: '',
  common_name: '',
  slug: '',
  kingdom: '',
  phylum: '',
  class: '',
  order: '',
  family: '',
  genus: '',
  species: '',
  description: '',
  info_detail: '',
  morphology: '',
  habitat_description: '',
  conservation_status: '',
  iucn_status: '',
  image_inputs: '',
  featured: false,
  habitatLatitude: '',
  habitatLongitude: '',
}

export function toSubmissionPayload(values: ContributionFormValues): SpeciesSubmissionPayload {
  const image_urls = values.image_inputs
    .split(imageListRegex)
    .map((line) => line.trim())
    .filter(Boolean)

  const coordsProvided = Boolean(values.habitatLatitude?.trim() && values.habitatLongitude?.trim())
  const habitat_map_coords = coordsProvided
    ? {
        latitude: Number(values.habitatLatitude),
        longitude: Number(values.habitatLongitude),
      }
    : null

  const payload: SpeciesSubmissionPayload = {
    scientific_name: values.scientific_name,
    common_name: values.common_name,
    slug: values.slug,
    kingdom: values.kingdom,
    phylum: values.phylum,
    class: values.class,
    order: values.order,
    family: values.family,
    genus: values.genus,
    species: values.species,
    description: values.description,
    info_detail: values.info_detail,
    morphology: values.morphology,
    habitat_description: values.habitat_description,
    conservation_status: values.conservation_status,
    iucn_status: values.iucn_status,
    featured: values.featured ?? false,
    image_urls,
    habitat_map_coords,
  }

  return normalizeSubmissionPayload(payload)
}

export function fromSubmissionPayload(payload: SpeciesSubmissionPayload): ContributionFormValues {
  return {
    scientific_name: payload.scientific_name ?? '',
    common_name: payload.common_name ?? '',
    slug: payload.slug ?? '',
    kingdom: payload.kingdom ?? '',
    phylum: payload.phylum ?? '',
    class: payload.class ?? '',
    order: payload.order ?? '',
    family: payload.family ?? '',
    genus: payload.genus ?? '',
    species: payload.species ?? '',
    description: payload.description ?? '',
    info_detail: payload.info_detail ?? '',
    morphology: payload.morphology ?? '',
    habitat_description: payload.habitat_description ?? '',
    conservation_status: payload.conservation_status ?? '',
    iucn_status: payload.iucn_status ?? '',
    image_inputs: (payload.image_urls ?? []).join('\n'),
    featured: Boolean(payload.featured),
    habitatLatitude: payload.habitat_map_coords?.latitude?.toString() ?? '',
    habitatLongitude: payload.habitat_map_coords?.longitude?.toString() ?? '',
  }
}
