"use client"

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form } from '@/components/ui/form'
import { SpeciesSubmissionFields } from '@/components/domain/contribute/SpeciesSubmissionFields'
import { contributionFormSchema, fromSubmissionPayload, toSubmissionPayload, type ContributionFormValues } from '@/lib/domain/submission-form'
import type { SpeciesSubmissionPayload } from '@/lib/api/species-submission-schema'
import { slugify } from '@/lib/api/species-route-helpers'
import { toast } from 'sonner'

type Props = {
  submissionId: string
  payload: SpeciesSubmissionPayload | null
  defaultNotes: string | null
  onSaved: (payload: SpeciesSubmissionPayload, notes: string | null) => void
}

const fallbackPayload: SpeciesSubmissionPayload = {
  scientific_name: 'Unknown species',
  common_name: 'Unknown',
  slug: 'unknown-species',
  kingdom: '',
  phylum: '',
  class: '',
  order: '',
  family: '',
  genus: '',
  species: '',
  description: '',
  info_detail: '',
  morphology: '',
  habitat_description: '',
  conservation_status: '',
  iucn_status: 'NE',
  featured: false,
  image_urls: [],
  habitat_map_coords: null,
}

export function ModeratorSubmissionEditor({ submissionId, payload, defaultNotes, onSaved }: Props) {
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: fromSubmissionPayload(payload ?? fallbackPayload),
  })
  const [notes, setNotes] = useState(defaultNotes ?? '')
  const [saving, setSaving] = useState(false)
  const slugEdited = useRef(false)

  const scientificName = form.watch('scientific_name')
  useEffect(() => {
    if (!slugEdited.current && scientificName) {
      form.setValue('slug', slugify(scientificName))
    }
  }, [scientificName, form])

  useEffect(() => {
    form.reset(fromSubmissionPayload(payload ?? fallbackPayload))
    setNotes(defaultNotes ?? '')
    slugEdited.current = false
  }, [payload, defaultNotes, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const nextPayload = toSubmissionPayload(values)
      const trimmedNotes = notes.trim() || null
      const res = await fetch('/api/admin/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId,
          payload: nextPayload,
          moderator_notes: trimmedNotes,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save revision')
      }
      onSaved(nextPayload, trimmedNotes)
      toast.success('Submission updated')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to save submission')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <SpeciesSubmissionFields
          form={form}
          onSlugAuto={() => {
            const nextSlug = slugify(form.getValues('scientific_name') || form.getValues('common_name') || '')
            form.setValue('slug', nextSlug)
            slugEdited.current = true
          }}
          onSlugManual={() => {
            slugEdited.current = true
          }}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-emerald-50">Moderator notes</label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Berikan catatan revisi untuk kontributor (opsional)"
            className="min-h-[90px]"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset(fromSubmissionPayload(payload ?? fallbackPayload))
              setNotes(defaultNotes ?? '')
              slugEdited.current = false
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save revisions'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
