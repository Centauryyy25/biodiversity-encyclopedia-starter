"use client"

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateUTC } from '@/utils/date'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { ModeratorSubmissionEditor } from './ModeratorSubmissionEditor'
import ActionButtons from './ActionButtons'
import PublishControls from './PublishControls'

interface Submission {
  id: string
  title: string
  user: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  createdAt: string
  url?: string | null
  content?: string | null
  payload: SpeciesSubmissionPayload | null
  moderator_notes: string | null
  contributor_name: string | null
  contributor_email: string | null
  published: boolean
  published_at: string | null
  published_species_id: string | null
}

type StatusFilter = 'all' | Submission['status']

export default function ModerationTable({ submissions }: { submissions: ReadonlyArray<Submission> }) {
  const [rows, setRows] = useState<Submission[]>([...submissions])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let next = rows
    if (statusFilter !== 'all') next = next.filter((s) => s.status === statusFilter)
    const q = query.trim().toLowerCase()
    if (q) next = next.filter((s) => {
      const haystack = [
        s.title,
        s.user,
        s.payload?.scientific_name ?? '',
        s.payload?.common_name ?? '',
      ]
      return haystack.some((item) => item.toLowerCase().includes(q))
    })
    return next
  }, [rows, statusFilter, query])

  const statusTone = (s: Submission['status']) =>
    s === 'pending'
      ? 'bg-amber-200/80 text-amber-900 border border-amber-300/60'
      : s === 'approved'
      ? 'bg-emerald-300/90 text-emerald-950 border border-emerald-400/70'
      : s === 'rejected'
      ? 'bg-red-200/90 text-red-900 border border-red-300/70'
      : 'bg-orange-200/90 text-orange-900 border border-orange-300/70'

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between bg-[#0B2520]/80 border border-emerald-500/10 rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-100 text-xs border border-emerald-400/30">Live Queue</div>
          <div className="text-sm text-emerald-100/80">
            {filtered.length} {filtered.length === 1 ? 'submission' : 'submissions'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or user..."
              className="rounded-xl bg-[#0E2B25] border-emerald-500/20 text-emerald-50 placeholder:text-emerald-100/50"
              aria-label="Search submissions"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger aria-label="Filter by status" className="w-44 rounded-xl bg-[#0E2B25] border-emerald-500/20 text-emerald-50">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-[#0E2B25] border border-emerald-500/30 text-emerald-50">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/15 overflow-hidden bg-[#0B2520]/70 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        <Table>
          <TableHeader className="bg-[#0E332C] border-b border-emerald-500/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-emerald-50">Title</TableHead>
              <TableHead className="text-emerald-50">Contributor</TableHead>
              <TableHead className="text-emerald-50">IUCN</TableHead>
              <TableHead className="text-emerald-50">Status</TableHead>
              <TableHead className="text-emerald-50">Submitted</TableHead>
              <TableHead className="text-right text-emerald-50">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="border-border/20 hover:bg-emerald-500/5">
                <TableCell className="font-medium text-emerald-50">{s.title}</TableCell>
                <TableCell className="text-emerald-100/90">
                  <div className="flex flex-col">
                    <span>{s.contributor_name ?? s.user}</span>
                    <span className="text-xs text-emerald-100/70">{s.contributor_email ?? '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-emerald-100/90">{s.payload?.iucn_status ?? '—'}</TableCell>
                <TableCell>
                  <Badge className={`${statusTone(s.status)} rounded-full px-3 py-1 text-xs capitalize shadow-sm`}>{s.status}</Badge>
                </TableCell>
                <TableCell className="text-emerald-100/70">{formatDateUTC(s.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-50 bg-emerald-500/10 hover:bg-emerald-500/20 transition" aria-label="View details">View</button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl max-w-4xl border-emerald-500/20 bg-[#0E2B25] text-emerald-50 p-0">
                        <ScrollArea className="max-h-[85vh] px-6 py-6">
                          <DialogHeader className="text-left">
                            <DialogTitle className="text-lg text-[#E4FFE9]">Submission Detail</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                            <div className="space-y-6 text-sm">
                              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-500/20 bg-black/20 p-4">
                                <Info label="Scientific name" value={s.payload?.scientific_name ?? '—'} />
                                <Info label="Common name" value={s.payload?.common_name ?? '—'} />
                                <Info label="Status" value={s.status} />
                                <Info label="Submitted" value={formatDateUTC(s.createdAt)} />
                              </div>
                              {s.payload ? <TaxonomyGrid payload={s.payload} /> : null}
                              {s.payload?.image_urls?.length ? (
                                <div className="space-y-2">
                                  <span className="font-medium text-emerald-50">Primary image</span>
                                  <div className="relative h-64 rounded-xl overflow-hidden border border-emerald-500/20 bg-black/20">
                                    <Image
                                      src={s.payload.image_urls[0]}
                                      alt={`Preview ${s.payload.scientific_name}`}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                      className="object-contain"
                                      unoptimized
                                    />
                                  </div>
                                </div>
                              ) : null}
                              {s.payload?.description ? (
                                <div className="space-y-2">
                                  <span className="font-medium text-emerald-50">Description</span>
                                  <p className="mt-1 whitespace-pre-wrap text-emerald-100/80 bg-black/10 rounded-xl p-3 border border-emerald-500/10">
                                    {s.payload.description}
                                  </p>
                                </div>
                              ) : null}
                              {s.moderator_notes ? (
                                <div className="space-y-2">
                                  <span className="font-medium text-emerald-50">Moderator notes</span>
                                  <p className="text-emerald-100/70 bg-black/10 rounded-xl p-3 border border-amber-500/20">
                                    {s.moderator_notes}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-base font-semibold text-emerald-50">Moderator revisions</h4>
                              <div className="rounded-2xl border border-emerald-500/20 bg-black/20 p-3">
                                <ModeratorSubmissionEditor
                                  submissionId={s.id}
                                  payload={s.payload}
                                  defaultNotes={s.moderator_notes}
                                  onSaved={(payload, notes) => {
                                    setRows((prev) =>
                                      prev.map((row) =>
                                        row.id === s.id
                                          ? {
                                              ...row,
                                              payload,
                                              moderator_notes: notes,
                                              title: payload.common_name
                                                ? `${payload.common_name} (${payload.scientific_name})`
                                                : payload.scientific_name,
                                              url: payload.image_urls?.[0] ?? row.url ?? null,
                                            }
                                          : row
                                      )
                                    )
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <Separator className="my-6 bg-emerald-500/20" />
                          <div className="flex flex-col gap-4 text-sm text-emerald-100/70">
                            <p>Gunakan panel revisi di samping untuk memperbaiki payload sebelum dipublish.</p>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    <ActionButtons
                      id={s.id}
                      onChange={(next) => {
                        setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, status: next } : r)))
                      }}
                    />
                    <PublishControls
                      id={s.id}
                      status={s.status}
                      published={s.published}
                      publishedAt={s.published_at}
                      onStateChange={(nextState) => {
                        setRows((prev) =>
                          prev.map((row) =>
                            row.id === s.id
                              ? {
                                  ...row,
                                  published: nextState.published,
                                  published_at: nextState.published_at,
                                  published_species_id: nextState.published_species_id,
                                }
                              : row
                          )
                        )
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-emerald-100/70">
                  No submissions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-emerald-200/70">{label}</span>
      <span className="font-medium text-emerald-50">{value}</span>
    </div>
  )
}

function TaxonomyGrid({ payload }: { payload: SpeciesSubmissionPayload }) {
  const fields: Array<[string, string | null | undefined]> = [
    ['Kingdom', payload.kingdom],
    ['Phylum', payload.phylum],
    ['Class', payload.class],
    ['Order', payload.order],
    ['Family', payload.family],
    ['Genus', payload.genus],
    ['Species', payload.species],
  ]
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-500/10 bg-[#0E2B25]/60 p-4">
      {fields.map(([label, value]) => (
        <div key={label} className="text-xs text-emerald-100/80">
          <span className="block text-[10px] uppercase tracking-wide text-emerald-200/60">{label}</span>
          <span className="font-medium">{value || '—'}</span>
        </div>
      ))}
    </div>
  )
}
