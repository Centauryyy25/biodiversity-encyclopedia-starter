"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDateUTC } from '@/utils/date'
import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'

type Row = {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  created_at: string
  payload: SpeciesSubmissionPayload | null
  moderator_notes?: string | null
}

export default function MySubmissions() {
  const { data } = useQuery({
    queryKey: ['contrib', 'mine'],
    queryFn: async () => {
      const r = await fetch('/api/contributions', { cache: 'no-store' })
      if (!r.ok) return []
      const json = await r.json()
      return (json.data ?? []) as Row[]
    },
  })

  return (
    <Card className="rounded-3xl border-white/15 mt-10  text-[#0B1F1F] shadow-2xl backdrop-blur-md dark:bg-[#0B1F1F]/70 dark:text-[#DAF1DE]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-[#1A3622] dark:text-[#DAF1DE]">My Submissions</CardTitle>
        <p className="text-sm text-muted-foreground dark:text-[#8EB69B]">
          Track the status of every contribution you have shared.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/40 bg-white/60 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/15 dark:bg-white/5 dark:text-[#8EB69B]">
            No submissions yet. Share your first discovery to see it listed here.
          </div>
        ) : (
          data.map((row) => {
            const payload = row.payload
            const scientificName = payload?.scientific_name ?? row.title
            const displayName = payload?.common_name || payload?.scientific_name || row.title
            const kingdom = payload?.kingdom || 'N/A'
            const family = payload?.family || 'N/A'
            return (
              <div
                key={row.id}
                className="space-y-3 rounded-2xl border border-white/25 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{displayName} <span className="text-muted-foreground">({scientificName})</span></p>
                    <p className="text-xs text-muted-foreground dark:text-[#B6D9C7]">
                      Submitted {formatDateUTC(row.created_at)} - IUCN: {payload?.iucn_status || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-[#B6D9C7]">
                      Kingdom {kingdom} - Family {family}
                    </p>
                    {payload?.image_urls?.length ? (
                      <a
                        href={payload.image_urls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#2F5233] underline dark:text-[#8EB69B]"
                      >
                        Preview reference image
                      </a>
                    ) : null}
                  </div>
                  <Badge className="rounded-full capitalize">{row.status}</Badge>
                </div>
                {row.moderator_notes ? (
                  <>
                    <Separator className="bg-black/10 dark:bg-white/10" />
                    <p className="text-xs text-muted-foreground dark:text-[#8EB69B]">
                      Moderator note: {row.moderator_notes}
                    </p>
                  </>
                ) : null}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
