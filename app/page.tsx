import type { ReactNode } from 'react';
import { Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthGatedButton from '@/components/auth/AuthGatedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import FeaturedSpeciesClient from '@/components/home/featured-species-client';
import HeroSearch from '@/components/home/hero-search';
import HeroActions from '@/components/home/hero-actions';
import NewsletterForm from '@/components/home/newsletter-form';
import encyclopediaImage from '@/public/Encyclopedia.png';
import { getFeaturedSpecies } from '@/lib/data/featured-species';
const CATEGORY_LINKS = [
  {
    title: 'Mammals',
    description: 'Warm-blooded vertebrates with hair or fur',
    icon: '🦁',
    count: 39,
    color: 'from-orange-600/20 to-red-600/20',
    filters: { kingdom: 'Animalia', search: 'mammal' },
  },
  {
    title: 'Birds',
    description: 'Feathered vertebrates capable of flight',
    icon: '🦅',
    count: 50,
    color: 'from-blue-600/20 to-cyan-600/20',
    filters: { kingdom: 'Animalia', search: 'bird' },
  },
  {
    title: 'Flora',
    description: 'Plants and trees from diverse ecosystems',
    icon: '🌿',
    count: 10,
    color: 'from-green-600/20 to-emerald-600/20',
    filters: { kingdom: 'Plantae' },
  },
  {
    title: 'Marine Life',
    description: 'Ocean-dwelling creatures and plants',
    icon: '🐠',
    count: 30,
    color: 'from-sky-600/20 to-indigo-600/20',
    filters: { search: 'marine' },
  },
] as const;

// Server Component
export default async function Home() {
  const featuredSpecies = await getFeaturedSpecies(8);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#163832]">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[#DAF1DE] mb-4 sm:mb-6 leading-tight">
              FloraFauna
              <span className="block text-2xl sm:text-3xl md:text-4xl font-sans text-[#8EB69B] mt-1 sm:mt-2">
                Encyclopedia
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#DAF1DE]/80 mb-4 sm:mb-6 leading-relaxed">
              Discover and Learn the Wonders of Biodiversity
            </p>

            <p className="text-sm sm:text-base md:text-lg text-[#8EB69B] mb-8 sm:mb-12 max-w-xl mx-auto px-2">
              Explore our comprehensive collection of flora and fauna species, featuring detailed information,
              stunning photography, and conservation insights from around the world.
            </p>

            {/* Search Component */}
            <div className="px-2 sm:px-0">
              <HeroSearch />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 sm:mt-8 md:mt-10">
              <HeroActions />
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%238EB69B" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none`}
          ></div>
        </div>
      </section>


      {/* Featured Species Section */}
      <section id="featured-species" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#DAF1DE] mb-4">
              Featured Species
            </h2>
            <p className="text-lg text-[#8EB69B] max-w-2xl mx-auto">
              Discover our curated selection of remarkable species from around the world,
              each with its own unique story and ecological importance.
            </p>
          </div>

          <FeaturedSpeciesClient species={featuredSpecies} />

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-[#8EB69B] text-[#DAF1DE] hover:bg-[#8EB69B]/20">
              <Link href="/species">
                View All Species
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative mb-52 py-16 lg:py-24">
        {/* subtle gradient background for the whole section */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e1a,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e91a,_transparent_55%)]" />

        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Categories
            </div>

            <h2 className="mt-5 text-3xl lg:text-4xl font-serif text-[#E4FFE9] tracking-tight">
              Explore Categories
            </h2>

            <p className="mt-3 text-base lg:text-lg text-[#9CCFB0] max-w-2xl mx-auto">
              Navigate through the diversity of life using our curated, easy-to-explore categories.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_LINKS.map((category) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                count={category.count}
                color={category.color}
                href={buildCategoryHref(category.filters)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section id="learn" className="py-16 lg:py-24 shadow-2xl bg-[#163832]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#DAF1DE] mb-6">
                Learn & Discover
              </h2>
              <p className="text-lg text-[#8EB69B] mb-8">
                Dive deep into the fascinating world of biodiversity with our educational resources,
                interactive guides, and expert-curated content.
              </p>

              <div className="space-y-4">
                <FeatureItem
                  icon={<BookOpen className="h-5 w-5" />}
                  title="Taxonomy Lessons"
                  description="Understand the scientific classification of living organisms"
                />
                <FeatureItem
                  icon={<Globe className="h-5 w-5" />}
                  title="Ecosystem Guides"
                  description="Explore different habitats and their unique inhabitants"
                />
                {/* <FeatureItem
                  icon={<Camera className="h-5 w-5" />}
                  title="AI Recognition Tool"
                  description="Upload photos to identify species using artificial intelligence"
                /> */}
              </div>

              <AuthGatedButton
                href="/learn"
                label="Start Learning"
                variant={undefined}
                className="mt-8 bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE]"
              />
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden">
              {/* <div className="absolute inset-0 bg-white/10 backdrop-blur-[10px] border border-white/20 z-10" /> */}

              <Image
                src={encyclopediaImage}
                alt="Educational content preview"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover p-2 relative z-10"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10 z-20 pointer-events-none" /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section
        id="contribute"
        className="relative overflow-hidden py-0 h-screen mt-0 lg:py-24 flex items-center justify-center"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/1.svg"
            alt=""
            width={640}
            height={640}
            className="absolute stroke-black w-56 md:w-[40rem] mt-0 opacity-[0.24] top-0 left-6 md:left-0 rotate-6 "
            priority
          />
          {/* <img
            src="/2.svg"
            alt=""
            className="absolute w-16 md:w-96 opacity-[0.23] top-24 right-10 md:right-16 -rotate-3 drop-shadow-[5px_7px_7px_rgba(0,0,0,0.2)] brightness-[1.15] saturate-[1.1]"
          /> */}
          <Image
            src="/3.svg"
            alt=""
            width={480}
            height={480}
            className="absolute w-20 md:w-72 opacity-25 bottom-0 left-10 md:left-20 rotate-9 drop-shadow-[7px_9px_9px_rgba(0,0,0,0.22)] brightness-[1.12] saturate-[1.08]"
            priority
          />
          <Image
            src="/4.svg"
            alt=""
            width={320}
            height={320}
            className="absolute w-16 md:w-48 opacity-[0.2] bottom-0 left-1/2 -translate-x-1/2 -rotate-12 drop-shadow-[6px_8px_8px_rgba(0,0,0,0.2)] brightness-[1.12] saturate-[1.08]"
            priority
          />
          <Image
            src="/5.svg"
            alt=""
            width={320}
            height={320}
            className="absolute w-[4.5rem] md:w-[20rem] opacity-[0.22] bottom-40 right-6 md:right-16 rotate-3 drop-shadow-[6px_9px_9px_rgba(0,0,0,0.24)] brightness-[1.15] saturate-[1.1]"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="bg-[#163832] shadow-2xl border-[#8EB69B]/20 max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl lg:text-4xl font-serif text-[#DAF1DE]">
                Become a Contributor
              </CardTitle>
              <p className="text-lg text-[#8EB69B] mt-4">
                Share your knowledge and help build the most comprehensive biodiversity encyclopedia.
              </p>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <p className="text-[#DAF1DE]">
                Join our community of scientists, photographers, and nature enthusiasts
                in documenting and preserving knowledge about Earth&apos;s incredible biodiversity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AuthGatedButton
                  href="/contribute"
                  label="Join as Contributor"
                  className="bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE]"
                />
                <Button
                  asChild
                  variant="outline"
                  className="border-[#8EB69B] text-[#DAF1DE] hover:bg-[#8EB69B]/20"
                >
                  <Link href="/contributors">View Contributors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Newsletter Section */}
      <section
        id="newsletter"
        className="relative overflow-hidden py-16 lg:py-24 bg-[#163832]/20"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/5.svg"
            alt=""
            width={320}
            height={320}
            className="absolute w-16 md:w-24 opacity-[0.23] top-2/3 left-8 md:left-16 rotate-3 drop-shadow-[6px_8px_8px_rgba(0,0,0,0.22)] brightness-[1.15] saturate-[1.1]"
            priority
          />
          <Image
            src="/2.svg"
            alt=""
            width={480}
            height={480}
            className="absolute w-16 md:w-[15rem] opacity-25 top-1/2 left-1/4 -translate-y-1/2 -rotate-4 drop-shadow-[6px_8px_8px_rgba(0,0,0,0.2)] brightness-[1.12] saturate-[1.08]"
            priority
          />
          {/* <img
            src="/1.svg"
            alt=""
            className="absolute w-20 md:w-28 opacity-[0.22] bottom-10 right-6 md:right-16 rotate-8 drop-shadow-[7px_9px_9px_rgba(0,0,0,0.24)] brightness-[1.15] saturate-[1.1]"
          /> */}
          <Image
            src="/3.svg"
            alt=""
            width={420}
            height={420}
            className="absolute w-16 md:w-52 opacity-[0.2] top-0 right-14 md:left-[86rem] -rotate-10 drop-shadow-[5px_7px_7px_rgba(0,0,0,0.18)] brightness-[1.12] saturate-[1.08]"
            priority
          />
          {/* <img
            src="/4.svg"
            alt=""
            className="absolute w-16 md:w-24 opacity-[0.22] bottom-24 left-8 md:left-20 rotate-2 drop-shadow-[6px_8px_8px_rgba(0,0,0,0.2)] brightness-[1.15] saturate-[1.1]"
          /> */}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#DAF1DE] mb-4">
              Stay Connected
            </h2>
            <p className="text-lg text-[#8EB69B] mb-8">
              Get weekly updates on new species, conservation news, and educational content.
            </p>

            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

// Supporting Components
function CategoryCard({ title, description, icon, count, color, href }: {
  title: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Browse ${title}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8EB69B]"
    >
      <Card className={`group cursor-pointer transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br ${color} border-[#8EB69B]/20 hover:border-[#8EB69B]/40 hover:shadow-lg hover:shadow-[#8EB69B]/10`}>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold text-[#DAF1DE] mb-2 group-hover:text-[#8EB69B] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[#8EB69B] mb-3">{description}</p>
          <Badge variant="secondary" className="bg-[#163832] text-[#DAF1DE]">
            {count.toLocaleString()} species
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function buildCategoryHref(filters: { search?: string; kingdom?: string; iucn_status?: string }) {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.kingdom) {
    params.set('kingdom', filters.kingdom);
  }
  if (filters.iucn_status) {
    params.set('iucn_status', filters.iucn_status);
  }

  const query = params.toString();
  return query ? `/species?${query}` : '/species';
}

function FeatureItem({ icon, title, description }: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-10 h-10 bg-[#8EB69B]/20 rounded-full flex items-center justify-center text-[#8EB69B]">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#DAF1DE] mb-1">{title}</h3>
        <p className="text-sm text-[#8EB69B]">{description}</p>
      </div>
    </div>
  );
}

