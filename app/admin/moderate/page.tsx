import { auth, currentUser } from '@clerk/nextjs/server'
import ModerationTable from '@/components/domain/admin/ModerationTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin, hasSupabaseServiceRole } from '@/utils/supabase/admin'
import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

type SubmissionRow = {
  id: string
  title: string
  user_id: string
  status: SubmissionStatus
  created_at: string
  url: string | null
  content: string | null
  payload: SpeciesSubmissionPayload | null
  moderator_notes: string | null
  contributor_name: string | null
  contributor_email: string | null
  published: boolean
  published_at: string | null
  published_species_id: string | null
}

type Submission = {
  id: string
  title: string
  user: string
  status: SubmissionStatus
  createdAt: string
  url?: string | null
  content?: string | null
  payload: SpeciesSubmissionPayload | null
  moderator_notes: string | null
  contributor_name: string | null
  contributor_email: string | null
  published: boolean
  published_at: string | null
  published_species_id: string | null
}

const placeholderPayload: SpeciesSubmissionPayload = {
  scientific_name: 'Tulipa gesneriana',
  common_name: 'Tulip',
  slug: 'tulipa-gesneriana',
  kingdom: 'Plantae',
  phylum: 'Tracheophyta',
  class: 'Liliopsida',
  order: 'Liliales',
  family: 'Liliaceae',
  genus: 'Tulipa',
  species: 'gesneriana',
  description: 'Herba umbi hias ikonik.',
  info_detail: 'Tulip taman yang banyak dibudidayakan.',
  morphology: 'Daun pita kebiruan; bunga berbentuk cawan warna-warni.',
  habitat_description: 'Ladang bunga beriklim sedang.',
  conservation_status: 'Tidak Dievaluasi',
  iucn_status: 'NE',
  featured: false,
  image_urls: ['https://example.com/image.jpg'],
  habitat_map_coords: null,
}

const fakeSubmissions: Submission[] = [
  {
    id: 's1',
    title: 'Panthera leo photo',
    user: 'alice',
    status: 'pending',
    createdAt: '2025-01-01',
    payload: placeholderPayload,
    moderator_notes: null,
    contributor_name: 'Alice',
    contributor_email: 'alice@example.com',
    content: null,
    url: null,
    published: false,
    published_at: null,
    published_species_id: null,
  },
  {
    id: 's2',
    title: 'New species note: Oak gall',
    user: 'bob',
    status: 'pending',
    createdAt: '2025-01-02',
    payload: placeholderPayload,
    moderator_notes: null,
    contributor_name: 'Bob',
    contributor_email: 'bob@example.com',
    content: null,
    url: null,
    published: false,
    published_at: null,
    published_species_id: null,
  },
  {
    id: 's3',
    title: 'Habitat update: Wetlands',
    user: 'chris',
    status: 'flagged',
    createdAt: '2025-01-03',
    payload: placeholderPayload,
    moderator_notes: null,
    contributor_name: 'Chris',
    contributor_email: 'chris@example.com',
    content: null,
    url: null,
    published: false,
    published_at: null,
    published_species_id: null,
  },
]

function isAdminEmail(email?: string | null) {
  const list = process.env.ADMIN_EMAILS?.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) ?? []
  return email ? list.includes(email.toLowerCase()) : false
}

const ROLE_KEY = 'role'

const getRoleFromMetadata = (metadata: unknown): string | undefined => {
  if (typeof metadata !== 'object' || metadata === null) return undefined
  const record = metadata as Record<string, unknown>
  const value = record[ROLE_KEY]
  return typeof value === 'string' ? value : undefined
}

export default async function ModeratePage() {
  const { userId } = await auth()
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const role = getRoleFromMetadata(user?.publicMetadata)
  const isAllowed = Boolean(userId) && (role === 'admin' || isAdminEmail(email))

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#051F20] to-[#0E2B25] text-[#DAF1DE]">
        <Card className="max-w-md rounded-2xl bg-[#0E2B25]/80 border-emerald-500/20 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Forbidden</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-emerald-100/80">
            You don&apos;t have access to this area.
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch latest submissions for moderation (server-side)
  let submissions: Submission[] = []
  let missingTable = false
  if (isAllowed && hasSupabaseServiceRole) {
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('id,title,user_id,status,created_at,url,content,payload,moderator_notes,contributor_name,contributor_email,published,published_at,published_species_id')
      .order('created_at', { ascending: false })
      .limit(50)
      .returns<SubmissionRow[]>()
    if (error) {
      // When the table is missing, show a helpful message
      missingTable = true
    } else if (Array.isArray(data)) {
      submissions = data.map((row) => ({
        id: row.id,
        title: row.title,
        user: row.user_id,
        status: row.status,
        createdAt: row.created_at,
        url: row.url ?? null,
        content: row.content ?? null,
        payload: row.payload ?? null,
        moderator_notes: row.moderator_notes ?? null,
        contributor_name: row.contributor_name ?? null,
        contributor_email: row.contributor_email ?? null,
        published: Boolean(row.published),
        published_at: row.published_at ?? null,
        published_species_id: row.published_species_id ?? null,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] via-[#0E2B25] to-[#163832] text-[#DAF1DE] flex items-center justify-center px-4 md:px-8 lg:px-12 py-12">
      <div className="w-full max-w-[1200px] space-y-8 flex flex-col items-center justify-center text-center">
        <header className="space-y-2 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Admin Only</p>
          <h1 className="text-3xl md:text-4xl font-serif text-[#E4FFE9] tracking-tight">Moderation Dashboard</h1>
          <p className="text-sm md:text-base text-emerald-100/80">
            Review and act on pending submissions from contributors. Decisions apply immediately and are logged.
          </p>
        </header>

        <Card className="w-full rounded-2xl bg-[#0E2B25]/70 border-emerald-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-[#E4FFE9]">Queue</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {(!hasSupabaseServiceRole) ? (
              <div className="text-sm text-amber-300">Server missing SUPABASE_SERVICE_ROLE_KEY. Cannot load submissions.</div>
            ) : missingTable ? (
              <div className="text-sm text-amber-300">Submissions table not found. Run Supabase migrations to create ‘public.submissions’.</div>
            ) : (
              <ModerationTable submissions={submissions.length ? submissions : fakeSubmissions} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
