"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export interface QuizMeta {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  questions: number
  topic: 'Taxonomy' | 'Habitats' | 'Conservation' | 'Classification' | 'SpeciesSpec'
}

export default function QuizStartDialog({ quiz, trigger }: { quiz: QuizMeta; trigger: React.ReactNode }) {
  const router = useRouter()
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl border-white/10 shadow-xl bg-[#112925]/80">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
          <DialogDescription>
            <span className="mt-2 inline-flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="rounded-full">{quiz.difficulty}</Badge>
              <span>•</span>
              <span>{quiz.questions} questions</span>
              <span>•</span>
              <span>{quiz.topic}</span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Answer multiple-choice questions at your pace. Your demo progress updates locally.
        </div>
        <DialogFooter>
          <Button
            aria-label="Start quiz"
            onClick={() => {
              try {
                const current = Number(localStorage.getItem('learnProgress') || '0')
                const next = Math.min(100, current + 10)
                localStorage.setItem('learnProgress', String(next))
              } catch {}
              toast.success('Quiz started (demo)')
              router.push(`/learn/quiz/${quiz.id}?topic=${quiz.topic}&difficulty=${quiz.difficulty}`)
            }}
            className="rounded-2xl"
          >
            Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
