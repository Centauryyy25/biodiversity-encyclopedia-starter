"use client"

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { sendEmailNotification } from '@/lib/sendEmail'
import { toast } from '@/hooks/use-toast'
import { Form } from '@/components/ui/form'
import { contributionFormSchema, emptyContributionValues, toSubmissionPayload, type ContributionFormValues } from '@/lib/domain/submission-form'
import { SpeciesSubmissionFields } from './SpeciesSubmissionFields'
import { slugify } from '@/lib/api/species-route-helpers'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function ContributionForm() {
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: emptyContributionValues,
  })
  const queryClient = useQueryClient()
  const { user } = useUser()
  const slugEdited = useRef(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [successOpen, setSuccessOpen] = useState(false)

  const steps = [
    { title: 'Species basics', caption: 'Identity details' },
    { title: 'Classification', caption: 'Kingdom to species' },
    { title: 'Narratives', caption: 'Descriptions & habitat' },
    { title: 'Status & media', caption: 'Conservation & assets' },
  ]
  const totalSteps = steps.length
  const requiredFieldsByStep: Record<number, (keyof ContributionFormValues)[]> = {
    1: ['scientific_name', 'common_name', 'slug'],
    2: ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'],
    3: ['description', 'info_detail', 'morphology', 'habitat_description'],
    4: ['conservation_status', 'iucn_status', 'image_inputs'],
  }
  const isLastStep = currentStep === totalSteps
  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setCurrentStep(1)
    }
  }

  const contributorName = user?.fullName || user?.username || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Contributor'
  const contributorEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const scientificName = form.watch('scientific_name')
  useEffect(() => {
    if (!slugEdited.current && scientificName) {
      form.setValue('slug', slugify(scientificName))
    }
  }, [scientificName, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      const payload = toSubmissionPayload(values)
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ species: payload }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to submit contribution')

      toast({
        title: 'Submission received!',
        description: 'Moderator akan mereview dan menghubungi Anda jika perlu.',
      })
      form.reset(emptyContributionValues)
      slugEdited.current = false
      await queryClient.invalidateQueries({ queryKey: ['contrib', 'mine'] })
      setOpen(false)
      setCurrentStep(1)
      setSuccessOpen(true)

      if (contributorEmail) {
        const emailResult = await sendEmailNotification({
          email: contributorEmail,
          species: payload.scientific_name,
          name: contributorName,
        })

        if (!emailResult.ok) {
          toast({
            title: 'Form terkirim, namun email gagal',
            description: emailResult.error ?? 'Silakan cek koneksi email Anda.',
            variant: 'destructive',
          })
        }
      }
    } catch (err) {
      toast({
        title: 'Failed to submit',
        description: err instanceof Error ? err.message : 'Unexpected error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  })

  const handleNextStep = async () => {
    const requiredFields = requiredFieldsByStep[currentStep] ?? []
    if (requiredFields.length) {
      const isValid = await form.trigger(requiredFields, { shouldFocus: true })
      if (!isValid) return
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-2xl bg-[#8EB69B] text-[#05231F] shadow-lg shadow-[#071C1C]/30 transition hover:bg-[#8EB69B]/90">
          Contribute
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-none bg-transparent px-2 py-3 text-white sm:max-w-2xl sm:px-0 sm:py-0">
        <div className="rounded-2xl border border-white/10 bg-[#163832]/80 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <DialogHeader className="border-b border-white/10 pb-5 text-left sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#8EB69B]/20 p-3 text-[#8EB69B]">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-semibold text-[#DAF1DE]">
                  Submit a biodiversity insight
                </DialogTitle>
                <DialogDescription className="text-sm text-[#CDE7D8]/80">
                  Provide high fidelity data so moderators can review and publish your entry.
                </DialogDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4 sm:mt-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {steps.map((step, index) => {
                  const stepNumber = index + 1
                  const status =
                    stepNumber === currentStep ? 'active' : stepNumber < currentStep ? 'complete' : 'upcoming'
                  return (
                    <div key={step.title} className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition',
                            status === 'active' && 'border-transparent bg-[#8EB69B] text-[#0B1F1F] shadow-lg shadow-[#000]/30',
                            status === 'complete' && 'border-[#8EB69B] text-[#8EB69B]',
                            status === 'upcoming' && 'border-white/30 text-white/60'
                          )}
                        >
                          {stepNumber}
                        </div>
                        {stepNumber < steps.length ? (
                          <span className="hidden h-px w-10 bg-white/20 md:inline-flex" aria-hidden="true" />
                        ) : null}
                      </div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#8EB69B]">{step.title}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-[#CDE7D8]/70">Step {currentStep} of {totalSteps}</p>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-100/30 px-3 py-3 text-sm text-[#1A3622] dark:border-white/10 dark:bg-white/5 dark:text-[#CDE7D8] sm:px-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Mengirim sebagai{' '}
                    <strong>{contributorName}</strong>
                    {contributorEmail ? ` (${contributorEmail})` : null}
                  </span>
                  <Badge variant="secondary" className="rounded-full border border-emerald-500/30 bg-white/70 dark:bg-transparent">
                    Clerk profile linked
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground dark:text-[#8EB69B]">
                  Data akun inilah yang akan digunakan moderator saat menghubungi Anda dan memberi kredit.
                </p>
              </div>

              <Separator className="bg-white/20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <SpeciesSubmissionFields
                    form={form}
                    step={currentStep as 1 | 2 | 3 | 4}
                    onSlugAuto={() => {
                      const next = slugify(form.getValues('scientific_name') || form.getValues('common_name') || '')
                      form.setValue('slug', next)
                      slugEdited.current = true
                    }}
                    onSlugManual={() => {
                      slugEdited.current = true
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              <DialogFooter className="mt-4 flex flex-col gap-3 sm:mt-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8EB69B]/80">
                  <span>{steps[currentStep - 1]?.title}</span>
                  <span>{steps[currentStep - 1]?.caption}</span>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                      className="w-full text-[#CDE7D8] hover:bg-white/10 sm:w-auto"
                    >
                      Back
                    </Button>
                  )}
                  {!isLastStep ? (
                    <Button
                      type="button"
                      onClick={() => {
                        void handleNextStep()
                      }}
                      className="w-full bg-[#8EB69B] text-[#031714] hover:bg-[#8EB69B]/90 sm:flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#8EB69B] text-[#031714] hover:bg-[#8EB69B]/90"
                    >
                      {loading ? 'Submitting...' : 'Submit for review'}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-emerald-500/20 bg-[#0D2624] text-white">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#8EB69B]/20 p-3 text-[#8EB69B]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl text-[#E5F6EC]">Kontribusi kamu terkirim!</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-[#CDE7D8]/70">
                  Moderator akan meninjau entri kamu. Kamu bisa cek statusnya di daftar submissions.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="rounded-2xl bg-[#8EB69B] text-[#05231F] hover:bg-[#8EB69B]/90">
              Siap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
