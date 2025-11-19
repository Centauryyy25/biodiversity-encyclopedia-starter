import LearnClient from '@/components/domain/learn/LearnClient'

export const revalidate = 3600
export const dynamic = 'force-static'

export default function LearnPage() {
  return <LearnClient />
}
