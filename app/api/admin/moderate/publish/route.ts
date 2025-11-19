import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, currentUser } from '@clerk/nextjs/server'
import { hasSupabaseServiceRole, supabaseAdmin } from '@/utils/supabase/admin'
import { speciesSubmissionSchema, type SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { normalizeSubmissionPayload } from '@/lib/api/submission-utils'
import type { TablesInsert } from '@/types/database.types'

const PublishSchema = z.object({
  id: z.string().min(1),
  action: z.enum(['publish', 'unpublish']),
})

function isAdminEmail(email?: string | null) {
  const list = process.env.ADMIN_EMAILS?.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) ?? []
  return email ? list.includes(email.toLowerCase()) : false
}

const ROLE_KEY = 'role'

const getRoleFromMetadata = (metadata: unknown): string | undefined => {
  if (typeof metadata !== 'object' || metadata === null) return undefined
  const record = metadata as Record<string, unknown>
  const value = record[ROLE_KEY]
  return typeof value === 'string' ? value : undefined
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress ?? null
    const role = getRoleFromMetadata(user?.publicMetadata)
    const isAllowed = Boolean(userId) && (role === 'admin' || isAdminEmail(email))
    if (!isAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (!hasSupabaseServiceRole) {
      return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const { id, action } = PublishSchema.parse(await req.json())

    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('id,status,payload,published,published_at,published_species_id')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: fetchError?.message ?? 'Submission not found' }, { status: fetchError ? 500 : 404 })
    }

    if (action === 'publish') {
      if (submission.status !== 'approved') {
        return NextResponse.json({ error: 'Approve the submission before publishing.' }, { status: 400 })
      }

      const parsedPayload = speciesSubmissionSchema.safeParse(submission.payload)
      if (!parsedPayload.success) {
        return NextResponse.json(
          { error: 'Submission payload is incomplete. Ask contributor to revise before publishing.' },
          { status: 400 }
        )
      }
      const normalizedPayload = normalizeSubmissionPayload(parsedPayload.data)
      const record = mapPayloadToSpeciesRow(normalizedPayload, submission.published_species_id)

      const query = submission.published_species_id
        ? supabaseAdmin.from('species').upsert([record]).select('id').single()
        : supabaseAdmin.from('species').insert([record]).select('id').single()

      const { data: speciesRow, error: publishError } = await query
      if (publishError || !speciesRow) {
        const status = publishError?.code === '23505' ? 409 : 500
        const message =
          publishError?.code === '23505'
            ? 'Slug already exists. Update the submission slug before publishing.'
            : publishError?.message ?? 'Failed to publish species.'
        return NextResponse.json({ error: message }, { status })
      }

      const publishedAt = new Date().toISOString()
      const { error: updateError } = await supabaseAdmin
        .from('submissions')
        .update({
          published: true,
          published_at: publishedAt,
          published_species_id: speciesRow.id,
        })
        .eq('id', id)
        .limit(1)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        published: true,
        published_at: publishedAt,
        published_species_id: speciesRow.id,
      })
    }

    // Handle unpublish
    if (!submission.published) {
      return NextResponse.json({ error: 'Submission is not published.' }, { status: 400 })
    }

    const previousState = {
      published: submission.published,
      published_at: submission.published_at,
      published_species_id: submission.published_species_id,
    }

    const unpublishedState = {
      published: false,
      published_at: null,
      published_species_id: null,
    }

    const { error: resetError } = await supabaseAdmin
      .from('submissions')
      .update(unpublishedState)
      .eq('id', id)
      .limit(1)

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }

    if (previousState.published_species_id) {
      const { error: deleteError } = await supabaseAdmin
        .from('species')
        .delete()
        .eq('id', previousState.published_species_id)

      if (deleteError) {
        await supabaseAdmin
          .from('submissions')
          .update(previousState)
          .eq('id', id)
          .limit(1)

        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    return NextResponse.json(unpublishedState)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((issue) => issue.message).join(', ') }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

function mapPayloadToSpeciesRow(payload: SpeciesSubmissionPayload, speciesId?: string | null): TablesInsert<'species'> {
  return {
    ...(speciesId ? { id: speciesId } : {}),
    scientific_name: payload.scientific_name,
    common_name: payload.common_name || null,
    slug: payload.slug,
    kingdom: payload.kingdom || null,
    phylum: payload.phylum || null,
    class: payload.class || null,
    order: payload.order || null,
    family: payload.family || null,
    genus: payload.genus || null,
    species: payload.species || null,
    description: payload.description || null,
    info_detail: payload.info_detail || null,
    morphology: payload.morphology || null,
    habitat_description: payload.habitat_description || null,
    conservation_status: payload.conservation_status || null,
    iucn_status: payload.iucn_status || null,
    featured: payload.featured ?? false,
    image_urls: payload.image_urls ?? [],
    habitat_map_coords: payload.habitat_map_coords ?? null,
  }
}
