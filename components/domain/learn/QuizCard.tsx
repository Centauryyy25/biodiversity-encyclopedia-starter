"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function QuizCard({ title, difficulty, questions, onStart, action }: { title: string; difficulty: string; questions: number; onStart?: () => void; action?: ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="rounded-2xl  border border-white/10 shadow-xl bg-[#112925]/50  hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#2F5233] dark:text-[#DAF1DE]">
            <span>{title}</span>
            <Badge className="rounded-full" variant="secondary">{difficulty}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-gray-600 dark:text-[#8EB69B]">
          <span>{questions} questions</span>
          {action ? action : (
            <Button aria-label={`Mulai kuis ${title}`} onClick={onStart}>Mulai</Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
