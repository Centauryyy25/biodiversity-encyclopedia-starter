import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin, hasSupabaseServiceRole } from '@/utils/supabase/admin'
import { speciesSubmissionSchema, type SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { normalizeSubmissionPayload } from '@/lib/api/submission-utils'

const BodySchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending','approved','rejected','flagged']).optional(),
  moderator_notes: z.string().max(2000).optional(),
  payload: speciesSubmissionSchema.partial().optional(),
}).refine((body) => Boolean(body.status || body.payload || typeof body.moderator_notes !== 'undefined'), {
  message: 'Provide a status, payload update, or moderator note.',
})

function isAdminEmail(email?: string | null) {
  const list = process.env.ADMIN_EMAILS?.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) ?? []
  return email ? list.includes(email.toLowerCase()) : false
}

const getRoleFromMetadata = (metadata: unknown): string | undefined => {
  if (typeof metadata !== 'object' || metadata === null) return undefined
  const value = (metadata as Record<string, unknown>).role
  return typeof value === 'string' ? value : undefined
}

export async function PATCH(req: Request) {
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

    const { id, status, payload, moderator_notes } = BodySchema.parse(await req.json())

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (typeof moderator_notes !== 'undefined') updates.moderator_notes = moderator_notes

    if (payload) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('submissions')
        .select('payload')
        .eq('id', id)
        .limit(1)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
      }

      const currentPayload = coercePayload(existing?.payload)
      const mergedPayload: SpeciesSubmissionPayload = {
        ...currentPayload,
        ...payload,
      }
      const normalizedPayload = normalizeSubmissionPayload(mergedPayload)
      updates.payload = normalizedPayload
      updates.title = normalizedPayload.common_name
        ? `${normalizedPayload.common_name} (${normalizedPayload.scientific_name})`
        : normalizedPayload.scientific_name
      updates.content = normalizedPayload.info_detail || normalizedPayload.description
      updates.url = normalizedPayload.image_urls?.[0] ?? null
    }

    const { error } = await supabaseAdmin
      .from('submissions')
      .update(updates)
      .eq('id', id)
      .limit(1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues.map(i => i.message).join(', ') }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

function coercePayload(payload: unknown): SpeciesSubmissionPayload {
  const parsed = speciesSubmissionSchema.safeParse(payload)
  if (parsed.success) return parsed.data
  // fallback: ensure minimal shape to allow merging
  return normalizeSubmissionPayload({
    scientific_name: 'Unknown species',
    common_name: 'Unknown',
    slug: 'unknown-species',
    kingdom: 'Unknown',
    phylum: 'Unknown',
    class: 'Unknown',
    order: 'Unknown',
    family: 'Unknown',
    genus: 'Unknown',
    species: 'sp.',
    description: 'Pending contributor data.',
    info_detail: 'Pending contributor data.',
    morphology: 'Pending contributor data.',
    habitat_description: 'Pending contributor data.',
    conservation_status: 'Unknown',
    iucn_status: 'NE',
    featured: false,
    image_urls: [],
    habitat_map_coords: null,
  })
}
