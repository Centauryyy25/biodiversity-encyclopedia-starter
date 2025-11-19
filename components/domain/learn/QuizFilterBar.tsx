"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export type Difficulty = 'all' | 'Beginner' | 'Intermediate' | 'Advanced'
export type TopicOption = 'all' | 'Taxonomy' | 'Habitats' | 'Conservation' | 'Classification' | 'SpeciesSpec'

export default function QuizFilterBar({
  difficulty,
  setDifficulty,
  topic,
  setTopic,
  query,
  setQuery,
}: {
  difficulty: Difficulty
  setDifficulty: (d: Difficulty) => void
  topic: TopicOption
  setTopic: (t: TopicOption) => void
  query: string
  setQuery: (q: string) => void
}) {
  return (
    <div className="flex flex-col  gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
          <SelectTrigger aria-label="Filter by difficulty" className="w-40 border-white/10 shadow-xl bg-[#112925]/50 rounded-2xl">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 shadow-xl bg-[#112925]/50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={topic} onValueChange={(v) => setTopic(v as TopicOption)}>
          <SelectTrigger aria-label="Filter by topic" className="w-44 border-white/10 shadow-xl bg-[#112925]/50 rounded-2xl">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 shadow-xl bg-[#112925]/50">
            <SelectItem value="all">All Topics</SelectItem>
            <SelectItem value="Taxonomy">Taxonomy</SelectItem>
            <SelectItem value="Habitats">Habitats & Biomes</SelectItem>
            <SelectItem value="Classification">Classification</SelectItem>
            <SelectItem value="SpeciesSpec">Species Specification</SelectItem>
            <SelectItem value="Conservation">Conservation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:w-72">
        <label htmlFor="quiz-search" className="sr-only border-white/10 shadow-xl bg-[#112925]/50">Search quizzes</label>
        <Input
          id="quiz-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quizzes..."
          aria-label="Search quizzes"
          className="rounded-2xl"
        />
      </div>
    </div>
  )
}
