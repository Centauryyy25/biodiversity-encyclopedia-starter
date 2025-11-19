"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import QuizCard from '@/components/domain/learn/QuizCard'
import Flashcard from '@/components/domain/learn/Flashcard'
import ProgressBar from '@/components/domain/learn/ProgressBar'
import QuizFilterBar, { type Difficulty, type TopicOption } from '@/components/domain/learn/QuizFilterBar'
import QuizStartDialog, { type QuizMeta } from '@/components/domain/learn/QuizStartDialog'
import MyResults from '@/components/domain/learn/MyResults'
import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const QUIZZES: QuizMeta[] = [
  { id: 'q1', title: 'Taxonomy Basics', difficulty: 'Beginner', questions: 10, topic: 'Taxonomy' },
  { id: 'q2', title: 'Habitats & Biomes', difficulty: 'Intermediate', questions: 12, topic: 'Habitats' },
  { id: 'q3', title: 'Conservation Categories', difficulty: 'Advanced', questions: 12, topic: 'Conservation' },
  { id: 'q4', title: 'Family & Genus Classification', difficulty: 'Intermediate', questions: 10, topic: 'Classification' },
  { id: 'q5', title: 'Species Specification', difficulty: 'Beginner', questions: 8, topic: 'SpeciesSpec' },
]

export default function LearnClient() {
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [topic, setTopic] = useState<TopicOption>('all')
  const [query, setQuery] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem('learnProgress') || '0')
      if (!Number.isNaN(stored)) setProgress(stored)
    } catch {}
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'learnProgress' && e.newValue) {
        const v = Number(e.newValue)
        if (!Number.isNaN(v)) setProgress(v)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const filtered = useMemo(() => {
    return QUIZZES.filter((q) =>
      (difficulty === 'all' || q.difficulty === difficulty) &&
      (topic === 'all' || q.topic === topic) &&
      (query.trim() === '' || q.title.toLowerCase().includes(query.trim().toLowerCase()))
    )
  }, [difficulty, topic, query])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9F1E8] to-white dark:from-[#051F20] dark:to-[#163832] py-12">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#2F5233] dark:text-[#DAF1DE]">Learn</h1>
            <p className="text-gray-600 dark:text-[#8EB69B] mt-2">Quizzes and flashcards designed with the same calm visual rhythm as species cards.</p>
          </div>

          <Tabs defaultValue="quizzes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-white/10 shadow-xl bg-[#112925]/50 rounded-xl">
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes" className="mt-6">
              <Card className="rounded-2xl border border-white/10 shadow-xl bg-[#112925]/50">
                <CardHeader>
                  <CardTitle className="text-[#2F5233] dark:text-[#DAF1DE]">Browse Quizzes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 shadow-xl">
                  <QuizFilterBar
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    topic={topic}
                    setTopic={setTopic}
                    query={query}
                    setQuery={setQuery}
                  />

                  {filtered.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No quizzes match your filters.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filtered.map((q) => (
                        <QuizCard
                          key={q.id}
                          title={q.title}
                          difficulty={q.difficulty}
                          questions={q.questions}
                          action={
                            <QuizStartDialog
                              quiz={q}
                              trigger={<Button aria-label={`Mulai kuis ${q.title}`} className="rounded-2xl">Mulai</Button>}
                            />
                          }
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-2">
                    <ProgressBar value={progress} label="Your progress" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="flashcards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Flashcard front="Panthera leo" back="Lion" />
                <Flashcard front="Quercus robur" back="English oak" />
                <Flashcard front="Ailuropoda melanoleuca" back="Giant panda" />
              </div>
            </TabsContent>
            <TabsContent value="results" className="mt-6">
              <MyResults />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
