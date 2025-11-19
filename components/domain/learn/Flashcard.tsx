"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div className="[perspective:1000px]" onClick={() => setFlipped((f) => !f)} aria-label="Flip flashcard" role="button" tabIndex={0}>
      <motion.div
        className="relative h-40 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Card className="absolute inset-0 border border-white/10 shadow-xl bg-[#112925]/50 backface-hidden flex items-center justify-center rounded-2xl">
          <CardContent className="text-center text-[#2F5233] dark:text-[#DAF1DE] flex items-center justify-center">
            <span className="text-lg font-serif">{front}</span>
          </CardContent>
        </Card>
        <Card className="absolute inset-0 border border-white/10 shadow-xl bg-[#112925]/50 [transform:rotateY(180deg)] backface-hidden flex items-center justify-center rounded-2xl">
          <CardContent className="text-center text-[#2F5233] dark:text-[#DAF1DE] flex items-center justify-center">
            <span className="text-lg">{back}</span>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
