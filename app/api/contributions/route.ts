import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseLean, hasServiceRole } from '@/utils/supabase/lean-admin'
import { isMissingTableError } from '@/utils/supabase/errors'
import { speciesSubmissionSchema } from '@/lib/api/species-submission-schema'
import { normalizeSubmissionPayload } from '@/lib/api/submission-utils'

const SubmissionPreviewSchema = z.object({
  species: speciesSubmissionSchema,
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const parsed = SubmissionPreviewSchema.parse(body)
    if (!hasServiceRole) {
      return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const clerkUser = await currentUser()
    const contributorName = clerkUser?.fullName || clerkUser?.username || `${clerkUser?.firstName ?? 'Contributor'} ${clerkUser?.lastName ?? ''}`.trim()
    const contributorEmail = clerkUser?.primaryEmailAddress?.emailAddress || null

    const normalizedPayload = normalizeSubmissionPayload(parsed.species)

    const previewTitle = normalizedPayload.common_name
      ? `${normalizedPayload.common_name} (${normalizedPayload.scientific_name})`
      : normalizedPayload.scientific_name
    const previewContent = normalizedPayload.info_detail || normalizedPayload.description || ''
    const previewImage = normalizedPayload.image_urls?.[0] ?? null

    const { error } = await supabaseLean
      .from('submissions')
      .insert([{
        user_id: userId,
        title: previewTitle,
        type: 'text',
        url: previewImage,
        content: previewContent,
        status: 'pending',
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        payload: normalizedPayload,
      }])
    if (error) {
      if (isMissingTableError(error, 'submissions')) {
        return NextResponse.json({ error: 'Submissions table not found. Run Supabase migrations to create &lsquo;public.submissions&rsquo;.' }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, payload: normalizedPayload })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues.map(i => i.message).join(', ') }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasServiceRole) return NextResponse.json({ data: [] })
  const { data, error } = await supabaseLean
    .from('submissions')
    .select('id,title,status,created_at,payload,moderator_notes,contributor_name,contributor_email')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) {
    if (isMissingTableError(error, 'submissions')) {
      return NextResponse.json({ data: [] })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data: data ?? [] })
}
