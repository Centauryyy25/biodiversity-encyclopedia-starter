import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ContributionForm from '@/components/domain/contribute/ContributionForm'
import MySubmissions from '@/components/domain/contribute/MySubmissions'
import Link from 'next/link'
import { Leaf, Sparkles } from 'lucide-react'

const highlightItems = [
  {
    title: 'Field observations',
    description: 'Share detailed notes, behaviors, and conservation insights.',
    Icon: Leaf,
  },
  {
    title: 'High-quality media',
    description: 'Upload photos or illustrations with contextual metadata.',
    Icon: Sparkles,
  },
] as const

export default async function ContributePage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#051F20] via-[#0C2A2B] to-[#163832]">
        <BackgroundGlow />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <Card className="max-w-lg rounded-3xl border-white/10 bg-white/95 shadow-2xl dark:bg-[#0B1F1F]/90">
            <CardHeader className="space-y-4 text-center">
              <CardTitle className="text-3xl text-[#1A3622] dark:text-[#DAF1DE]">Sign in required</CardTitle>
              <p className="text-base text-muted-foreground dark:text-[#8EB69B]">
                Please <Link href="/sign-in" className="underline">sign in</Link> to share your discoveries with the community.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#051F20] via-[#0C2A2B] to-[#163832]">
      <BackgroundGlow />
      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-6xl">
            <div className="grid gap-10 items-center lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6 text-center text-[#DAF1DE] lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#8EB69B]">Community Program</p>
                <h1 className="font-serif text-4xl leading-tight md:text-5xl">Contribute to the Biodiversity Encyclopedia</h1>
                <p className="text-base text-[#CDE7D8]/80 md:text-lg">
                  Help scientists, students, and nature enthusiasts expand our shared knowledge base.
                  Submit field notes, specimen details, and visual documentation that highlight flora and fauna diversity.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightItems.map(({ title, description, Icon }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-sm"
                    >
                      <Icon className="mb-3 h-5 w-5 text-[#8EB69B]" />
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-[#CDE7D8]/80">{description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="rounded-3xl mt-10 border-white/15 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-[#0B1F1F]/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-[#1A3622] dark:text-[#DAF1DE]">Submit a new entry</CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-[#8EB69B]">
                    Provide as much detail as possible so the team can review it quickly.
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  <ContributionForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 mt-0 backdrop-blur-md dark:">
          <div className="mx-auto mt-10 w-full max-w-5xl">
            <MySubmissions />
          </div>
        </section>
      </div>
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#5FA47C]/20 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[22rem] w-[22rem] rounded-full bg-[#82C39C]/15 blur-[160px]" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#4A8271]/20 blur-[140px]" />
    </div>
  )
}
