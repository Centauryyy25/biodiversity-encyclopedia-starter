"use client"

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ActionButtons({ id, onChange }: { id: string; onChange?: (status: 'approved' | 'rejected' | 'flagged') => void }) {
  const update = async (status: 'approved' | 'rejected' | 'flagged') => {
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) throw new Error(await res.text())
      onChange?.(status)
      toast.success(`${status[0].toUpperCase()}${status.slice(1)} submission`)
    } catch (error) {
      console.error('Failed to update submission status', error)
      toast.error('Failed to update')
    }
  }

  return (
    <div className="inline-flex gap-2">
      <Button
        size="sm"
        className="bg-emerald-500 text-[#051F20] hover:bg-emerald-400 shadow-[0_6px_16px_rgba(16,185,129,0.35)]"
        aria-label="Approve"
        onClick={() => update('approved')}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-amber-400/70 text-amber-100 hover:bg-amber-500/15"
        aria-label="Reject"
        onClick={() => update('rejected')}
      >
        Reject
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="bg-red-500 text-white hover:bg-red-400"
        aria-label="Flag"
        onClick={() => update('flagged')}
      >
        Flag
      </Button>
    </div>
  )
}
