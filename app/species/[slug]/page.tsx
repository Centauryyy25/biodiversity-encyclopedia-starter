import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpeciesBySlug } from '@/lib/supabase/species';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Shield, Info, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Next.js 16: params is a Promise and must be awaited
interface SpeciesPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SpeciesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: species } = await getSpeciesBySlug(slug);

  if (!species) {
    return {
      title: 'Species Not Found',
      description: 'The requested species could not be found.',
    };
  }

  const taxonomyKeywords = [
    species.kingdom,
    species.phylum,
    species.class,
    species.order,
    species.family,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

  const keywords = [
    species.scientific_name,
    species.common_name,
    ...taxonomyKeywords,
    'biodiversity',
    'conservation',
    'taxonomy',
    'flora',
    'fauna',
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

  return {
    title: `${species.common_name || species.scientific_name} - FloraFauna Encyclopedia`,
    description: species.description
      ? `${species.description.substring(0, 160)}...`
      : `Learn about ${species.scientific_name}, including taxonomy, habitat, and conservation status.`,
    openGraph: {
      title: `${species.common_name || species.scientific_name} - FloraFauna Encyclopedia`,
      description: species.description || `Discover ${species.scientific_name}`,
      images: species.image_urls?.[0] ? [
        {
          url: species.image_urls[0],
          width: 1200,
          height: 630,
          alt: `${species.common_name || species.scientific_name}`,
        }
      ] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${species.common_name || species.scientific_name}`,
      description: species.description || `Learn about ${species.scientific_name}`,
      images: species.image_urls?.[0] ? [species.image_urls[0]] : [],
    },
    keywords,
  };
}

export default async function SpeciesPage({ params }: SpeciesPageProps) {
  const { slug } = await params;
  const { data: species, error } = await getSpeciesBySlug(slug);

  if (error || !species) {
    notFound();
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case 'CR': return 'bg-red-500 text-white';
      case 'EN': return 'bg-orange-500 text-white';
      case 'VU': return 'bg-yellow-500 text-black';
      case 'NT': return 'bg-blue-500 text-white';
      case 'LC': return 'bg-green-500 text-white';
      case 'EW': return 'bg-gray-800 text-white';
      case 'EX': return 'bg-black text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case 'CR': return 'Critically Endangered';
      case 'EN': return 'Endangered';
      case 'VU': return 'Vulnerable';
      case 'NT': return 'Near Threatened';
      case 'LC': return 'Least Concern';
      case 'EW': return 'Extinct in the Wild';
      case 'EX': return 'Extinct';
      default: return status || 'Not Assessed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-[#DAF1DE] hover:text-[#8EB69B]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Encyclopedia
            </Button>
          </Link>
        </div>

        {/* Species Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-6xl font-serif text-[#DAF1DE] mb-2">
                {species.common_name}
              </h1>
              <p className="text-2xl lg:text-3xl text-[#8EB69B] italic mb-4">
                {species.scientific_name}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {species.kingdom && (
                  <Badge variant="secondary" className="bg-[#163832] text-[#DAF1DE]">
                    {species.kingdom}
                  </Badge>
                )}
                {species.family && (
                  <Badge variant="secondary" className="bg-[#163832] text-[#DAF1DE]">
                    {species.family}
                  </Badge>
                )}
                {species.iucn_status && (
                  <Badge className={getStatusColor(species.iucn_status)}>
                    <Shield className="mr-1 h-3 w-3" />
                    {getStatusText(species.iucn_status)}
                  </Badge>
                )}
              </div>
              {species.featured && (
                <Badge className="bg-[#8EB69B] text-[#051F20] mb-4">
                  <Info className="mr-1 h-3 w-3" />
                  Featured Species
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {species.image_urls && species.image_urls.length > 0 && (
          <div className="mb-8">
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <CardTitle className="text-[#DAF1DE]">Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {species.image_urls.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${species.common_name || species.scientific_name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- NEW SECTION: Detailed Description --- */}
        <div className="mb-8">
          <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
            <CardHeader>
              <CardTitle className="text-[#DAF1DE]">Detailed Description</CardTitle>
            </CardHeader>
            <CardContent>
              {species.info_detail ? (
                <p className="text-[#DAF1DE] leading-relaxed whitespace-pre-line">{species.info_detail}</p>
              ) : (
                <p className="text-[#8EB69B] italic">No additional description available for this species.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description and Taxonomy */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {species.description && (
              <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
                <CardHeader>
                  <CardTitle className="text-[#DAF1DE]">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#DAF1DE] leading-relaxed">
                    {species.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Taxonomy */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <CardTitle className="text-[#DAF1DE] flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Taxonomic Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {species.kingdom && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Kingdom:</span>
                      <span className="text-[#DAF1DE]">{species.kingdom}</span>
                    </div>
                  )}
                  {species.phylum && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Phylum:</span>
                      <span className="text-[#DAF1DE]">{species.phylum}</span>
                    </div>
                  )}
                  {species.class && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Class:</span>
                      <span className="text-[#DAF1DE]">{species.class}</span>
                    </div>
                  )}
                  {species.order && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Order:</span>
                      <span className="text-[#DAF1DE]">{species.order}</span>
                    </div>
                  )}
                  {species.family && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Family:</span>
                      <span className="text-[#DAF1DE]">{species.family}</span>
                    </div>
                  )}
                  {species.genus && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Genus:</span>
                      <span className="text-[#DAF1DE] italic">{species.genus}</span>
                    </div>
                  )}
                  {species.species && (
                    <div className="flex justify-between">
                      <span className="text-[#8EB69B]">Species:</span>
                      <span className="text-[#DAF1DE] italic">{species.species}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Morphology */}
            {species.morphology && (
              <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
                <CardHeader>
                  <CardTitle className="text-[#DAF1DE]">Physical Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#DAF1DE] leading-relaxed">
                    {species.morphology}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Habitat */}
            {species.habitat_description && (
              <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
                <CardHeader>
                  <CardTitle className="text-[#DAF1DE] flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Habitat & Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#DAF1DE] leading-relaxed">
                    {species.habitat_description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Conservation Status */}
          <div className="space-y-6">
            {/* Conservation Status */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <CardTitle className="text-[#DAF1DE] flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Conservation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getStatusColor(species.iucn_status)} text-lg px-4 py-2`}>
                    {getStatusText(species.iucn_status)}
                  </Badge>
                </div>

                {species.conservation?.population_trend && (
                  <div>
                    <h4 className="text-[#8EB69B] font-semibold mb-1">Population Trend</h4>
                    <p className="text-[#DAF1DE]">{species.conservation.population_trend}</p>
                  </div>
                )}

                {species.conservation?.population_size && (
                  <div>
                    <h4 className="text-[#8EB69B] font-semibold mb-1">Population Size</h4>
                    <p className="text-[#DAF1DE]">{species.conservation.population_size}</p>
                  </div>
                )}

                {species.conservation?.threat_level && (
                  <div>
                    <h4 className="text-[#8EB69B] font-semibold mb-1">Threat Level</h4>
                    <p className="text-[#DAF1DE]">{species.conservation.threat_level}</p>
                  </div>
                )}

                {species.conservation?.threats && species.conservation.threats.length > 0 && (
                  <div>
                    <h4 className="text-[#8EB69B] font-semibold mb-2">Main Threats</h4>
                    <div className="space-y-1">
                      {species.conservation.threats.map((threat, index) => (
                        <Badge key={index} variant="outline" className="text-[#DAF1DE] border-[#8EB69B]/50">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {species.conservation?.conservation_actions && species.conservation.conservation_actions.length > 0 && (
                  <div>
                    <h4 className="text-[#8EB69B] font-semibold mb-2">Conservation Actions</h4>
                    <div className="space-y-1">
                      {species.conservation.conservation_actions.map((action, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#8EB69B]/20 text-[#DAF1DE]">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <CardTitle className="text-[#DAF1DE]">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
<<<<<<< HEAD
                {(() => {
                  const habitatProtection = species.conservation?.habitat_protection;
                  const showHabitatProtection = habitatProtection !== undefined && habitatProtection !== null;
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8EB69B]">Scientific Name:</span>
                        <span className="text-[#DAF1DE] italic">{species.scientific_name}</span>
                      </div>
                      <Separator className="bg-[#8EB69B]/20" />
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8EB69B]">Conservation Status:</span>
                        <span className="text-[#DAF1DE]">{getStatusText(species.iucn_status)}</span>
                      </div>
                      {showHabitatProtection && (
                        <>
                          <Separator className="bg-[#8EB69B]/20" />
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8EB69B]">Habitat Protection:</span>
                            <span className="text-[#DAF1DE]">
                              {habitatProtection ? 'Protected' : 'Not Protected'}
                            </span>
                          </div>
                        </>
                      )}
                      <Separator className="bg-[#8EB69B]/20" />
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8EB69B]">Last Updated:</span>
                        <span className="text-[#DAF1DE]">
                          {new Date(species.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  );
                })()}
=======
                <div className="flex justify-between text-sm">
                  <span className="text-[#8EB69B]">Scientific Name:</span>
                  <span className="text-[#DAF1DE] italic">{species.scientific_name}</span>
                </div>
                <Separator className="bg-[#8EB69B]/20" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#8EB69B]">Conservation Status:</span>
                  <span className="text-[#DAF1DE]">{getStatusText(species.iucn_status)}</span>
                </div>
                {species.conservation && species.conservation.habitat_protection !== null && (
                  <>
                    <Separator className="bg-[#8EB69B]/20" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8EB69B]">Habitat Protection:</span>
                      <span className="text-[#DAF1DE]">
                        {species.conservation.habitat_protection ? 'Protected' : 'Not Protected'}
                      </span>
                    </div>
                  </>
                )}
                <Separator className="bg-[#8EB69B]/20" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#8EB69B]">Last Updated:</span>
                  <span className="text-[#DAF1DE]">
                    {new Date(species.updated_at).toLocaleDateString()}
                  </span>
                </div>
>>>>>>> dd66b8e7f0ac13e48187d7fedf0f9349ee942198
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
