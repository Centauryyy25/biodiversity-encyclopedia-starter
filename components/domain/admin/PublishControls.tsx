"use client"

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateUTC } from '@/utils/date'
import { toast } from 'sonner'

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

type PublishState = {
  published: boolean
  published_at: string | null
  published_species_id: string | null
}

type Props = {
  id: string
  status: SubmissionStatus
  published: boolean
  publishedAt: string | null
  onStateChange?: (state: PublishState) => void
}

export default function PublishControls({ id, status, published, publishedAt, onStateChange }: Props) {
  const [isPending, startTransition] = useTransition()

  const canPublish = status === 'approved'
  const buttonLabel = published ? 'Unpublish' : 'Publish'
  const badgeText = published
    ? `Published${publishedAt ? ` · ${formatDateUTC(publishedAt)}` : ''}`
    : 'Hidden'

  const handleAction = (action: 'publish' | 'unpublish') => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/moderate/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data?.error ?? 'Failed to update publish state.')
        }
        onStateChange?.(data as PublishState)
        toast.success(action === 'publish' ? 'Species published' : 'Species unpublished')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update publish state.'
        toast.error(message)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <Badge
        className={`rounded-full px-3 py-1 text-[11px] ${
          published
            ? 'bg-emerald-500/20 text-emerald-50 border border-emerald-500/40'
            : 'bg-emerald-500/5 text-emerald-100/80 border border-emerald-500/20'
        }`}
      >
        {badgeText}
      </Badge>
      <Button
        size="sm"
        className={`min-w-[120px] ${
          published ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-[#8EB69B] text-[#053329] hover:bg-[#8EB69B]/85'
        }`}
        disabled={isPending || (!published && !canPublish)}
        onClick={() => {
          if (!published && !canPublish) return
          handleAction(published ? 'unpublish' : 'publish')
        }}
      >
        {isPending ? 'Processing...' : buttonLabel}
      </Button>
      {!published && !canPublish ? (
        <p className="text-[11px] text-amber-300">Approve submission to enable publishing.</p>
      ) : null}
    </div>
  )
}
