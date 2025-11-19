import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { supabaseLean, hasServiceRole } from '@/utils/supabase/lean-admin'
import { isMissingTableError } from '@/utils/supabase/errors'
import type { Database, Json } from '@/types/database.types'

const ResultSchema = z.object({
  quiz_id: z.string().min(1),
  topic: z.enum(['Taxonomy','Habitats','Conservation','Classification','SpeciesSpec']),
  difficulty: z.enum(['Beginner','Intermediate','Advanced']),
  questions_count: z.number().int().nonnegative(),
  correct_count: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional(),
})

type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert']
type QuizResultRow = Database['public']['Tables']['quiz_results']['Row']

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasServiceRole) {
      return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY for writes' }, { status: 500 })
    }

    const parsed = ResultSchema.parse(await req.json())

    const payload: QuizResultInsert = {
      user_id: userId,
      quiz_id: parsed.quiz_id,
      topic: parsed.topic,
      difficulty: parsed.difficulty,
      questions_count: parsed.questions_count,
      correct_count: parsed.correct_count,
      metadata: (parsed.metadata as Json | undefined) ?? null,
    }

    const { error } = await supabaseLean
      .from('quiz_results')
      .insert([payload])

    if (error) {
      if (isMissingTableError(error, 'quiz_results')) {
        return NextResponse.json({ error: 'Quiz results table not found. Run Supabase migrations to create &lsquo;public.quiz_results&rsquo;.' }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues.map(i => i.message).join(', ') }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // If service role key isn't available (local dev or misconfig), degrade gracefully
    if (!hasServiceRole) {
      return NextResponse.json({ data: [] })
    }

    const { data, error } = await supabaseLean
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('finished_at', { ascending: false })
      .limit(20)
      .returns<QuizResultRow[]>()
    if (error) {
      if (isMissingTableError(error, 'quiz_results')) {
        // Degrade gracefully: return empty list instead of surfacing 503
        return NextResponse.json({ data: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
