import { z } from 'zod'
import { speciesPayloadSchema } from '@/lib/api/species-route-helpers'

export const speciesSubmissionSchema = speciesPayloadSchema.extend({
  common_name: z.string().min(2, 'Common name is required'),
  kingdom: z.string().min(2, 'Kingdom is required'),
  phylum: z.string().min(2, 'Phylum is required'),
  class: z.string().min(2, 'Class is required'),
  order: z.string().min(2, 'Order is required'),
  family: z.string().min(2, 'Family is required'),
  genus: z.string().min(2, 'Genus is required'),
  species: z.string().min(1, 'Species epithet is required'),
  description: z.string().min(40, 'Description must be at least 40 characters'),
  info_detail: z.string().min(60, 'Tell the story behind this species (min 60 chars)'),
  morphology: z.string().min(30, 'Morphology must be at least 30 characters'),
  habitat_description: z.string().min(30, 'Habitat description must be at least 30 characters'),
  conservation_status: z.string().min(2, 'Conservation status is required'),
  iucn_status: z.string().min(2, 'IUCN status is required'),
  slug: z.string().min(2, 'Slug is required'),
  image_urls: z.array(z.string().url('Each image entry must be a valid URL')).min(1, 'Provide at least one image URL'),
})

export type SpeciesSubmissionPayload = z.infer<typeof speciesSubmissionSchema>
export type SpeciesSubmissionFormValues = z.input<typeof speciesSubmissionSchema>
