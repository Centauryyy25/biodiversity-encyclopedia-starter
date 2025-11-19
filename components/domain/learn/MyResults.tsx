"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { formatDateUTC } from '@/utils/date'

type QuizRow = {
  id: string
  quiz_id: string
  topic: string
  difficulty: string
  questions_count: number
  correct_count: number
  score: number
  finished_at: string
}

export default function MyResults() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['learn', 'quiz-results'],
    queryFn: async () => {
      const r = await fetch('/api/learn/quiz/results', { cache: 'no-store' })
      if (!r.ok) throw new Error('Failed to load results')
      const json = await r.json()
      return (json.data ?? []) as QuizRow[]
    },
  })

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
        <CardContent className="p-6 space-y-3">
          <div className="animate-pulse h-6 w-1/3 rounded bg-muted" />
          <div className="animate-pulse h-6 w-2/3 rounded bg-muted" />
          <div className="animate-pulse h-6 w-1/2 rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to load your results.</AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
        <CardHeader>
          <CardTitle className="text-[#2F5233] dark:text-[#DAF1DE]">My Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No quiz results yet. Start a quiz to see your progress.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
      <CardHeader>
        <CardTitle className="text-[#2F5233] dark:text-[#DAF1DE]">My Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 border-white/10 shadow-xl bg-[#112925]/50">
        {data.map((row) => (
          <div key={row.id} className="flex items-center justify-between border rounded-xl px-4 py-3">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">{row.topic} • {row.difficulty}</div>
              <div className="text-xs text-muted-foreground">{formatDateUTC(row.finished_at)} • {row.correct_count}/{row.questions_count} correct</div>
            </div>
            <div className="text-sm font-semibold">{Math.round(row.score)}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
