"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { QuizTopic } from '@/lib/supabase/learn'
import { fetchSpeciesForQuiz } from '@/lib/supabase/learn'
import { buildQuestionsFromSpecies, type QuizQuestion } from '@/utils/quiz'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'

export default function QuizRunner({ quizId, topic, difficulty }: { quizId: string; topic: QuizTopic; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const queryClient = useQueryClient()

  const total = questions.length
  const correctCount = useMemo(() => answers.reduce((acc, a, i) => acc + (a === questions[i]?.correctIndex ? 1 : 0), 0), [answers, questions])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const limit = difficulty === 'Advanced' ? 40 : difficulty === 'Intermediate' ? 30 : 20
        const species = await fetchSpeciesForQuiz(topic, limit)
        const count = difficulty === 'Advanced' ? 12 : difficulty === 'Intermediate' ? 10 : 8
        const qs = buildQuestionsFromSpecies(species, count, { includeImages: true, topic })
        setQuestions(qs)
        setAnswers(Array(qs.length).fill(-1))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [topic, difficulty])

  const onSelect = (choice: number) => {
    const next = [...answers]
    next[index] = choice
    setAnswers(next)
  }

  const onNext = async () => {
    if (index < total - 1) setIndex(index + 1)
    else {
      setFinished(true)
      const scorePct = Math.round((correctCount / total) * 100)
      try {
        const current = Number(localStorage.getItem('learnProgress') || '0')
        const updated = Math.max(current, scorePct)
        localStorage.setItem('learnProgress', String(updated))
      } catch {}
      // Persist to server
      try {
        const res = await fetch('/api/learn/quiz/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quizId,
            topic,
            difficulty,
            questions_count: total,
            correct_count: correctCount,
          })
        })
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          toast.error(msg || 'Failed to save quiz result')
        } else {
          // Invalidate cached results so /learn Results tab refreshes
          queryClient.invalidateQueries({ queryKey: ['learn','quiz-results'] })
        }
      } catch {}
      toast.success(`Quiz selesai • Skor ${scorePct}%`)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
        <CardContent className="p-6">
          <div className="animate-pulse h-24 rounded-xl bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (finished) {
    const scorePct = Math.round((correctCount / total) * 100)
    return (
      <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
        <CardHeader>
          <CardTitle>Hasil Kuis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span>Benar {correctCount} dari {total} soal • {scorePct}%</span>
          </div>
          <Progress value={scorePct} className="h-3 rounded-full" />
          <div className="flex gap-3">
            <Button asChild className="rounded-2xl"><a href="/learn">Kembali ke Learn</a></Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => { setFinished(false); setIndex(0); setAnswers(Array(total).fill(-1)) }}>Ulangi</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const q = questions[index]
  const progress = total ? Math.round(((index) / total) * 100) : 0

  return (
    <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
      <CardHeader>
        <CardTitle className="text-[#2F5233] dark:text-[#DAF1DE]">Soal {index + 1} dari {total}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2 rounded-full" />
        {q.image ? (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={q.image}
              alt="Gambar referensi spesies untuk kuis"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="text-lg">{q.prompt}</div>
        <div className="grid gap-3">
          {q.choices.map((c, i) => (
            <Button
              key={i}
              type="button"
              variant={answers[index] === i ? 'default' : 'outline'}
              onClick={() => onSelect(i)}
              className="justify-start rounded-2xl"
              aria-pressed={answers[index] === i}
            >
              {String.fromCharCode(65 + i)}. {c}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={answers[index] < 0} className="rounded-2xl">{index < total - 1 ? 'Selanjutnya' : 'Selesai'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
