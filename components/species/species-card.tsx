import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, MapPin } from 'lucide-react';
import { Species } from '@/types/species';

interface SpeciesCardProps {
  species: Species;
  showDescription?: boolean;
  className?: string;
}

export function SpeciesCard({
  species,
  showDescription = true,
  className = ''
}: SpeciesCardProps) {
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

  const primaryImage = species.image_urls && species.image_urls.length > 0
    ? species.image_urls[0]
    : null;

  return (
    <Link href={`/species/${species.slug}`}>
      <Card className={`
        group cursor-pointer transition-all duration-300 hover:scale-[1.02]
        bg-[#163832]/50 border-[#8EB69B]/20 hover:border-[#8EB69B]/40
        hover:shadow-lg hover:shadow-[#8EB69B]/10
        ${className}
      `}>
        {/* Image Section */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${species.common_name || species.scientific_name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0B2B26] to-[#163832] flex items-center justify-center">
              <Globe className="w-12 h-12 text-[#8EB69B]/50" />
            </div>
          )}

          {/* Featured Badge */}
          {species.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#8EB69B] text-[#051F20] text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}

          {/* Conservation Status Badge */}
          {species.iucn_status && (
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(species.iucn_status)} text-xs font-semibold flex items-center gap-1`}>
                <Shield className="w-3 h-3" />
                {species.iucn_status}
              </Badge>
            </div>
          )}

          {/* Habitat Map Indicator */}
          {species.habitat_map_coords && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-[#051F20]/80 backdrop-blur-sm rounded-full p-2">
                <MapPin className="w-4 h-4 text-[#DAF1DE]" />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Names */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-[#DAF1DE] group-hover:text-[#8EB69B] transition-colors line-clamp-1">
              {species.common_name || species.scientific_name}
            </h3>
            <p className="text-sm text-[#8EB69B] italic">
              {species.common_name && species.common_name !== species.scientific_name
                ? species.scientific_name
                : ''
              }
            </p>
          </div>

          {/* Taxonomy Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {species.kingdom && (
              <Badge variant="secondary" className="text-xs bg-[#0B2B26] text-[#DAF1DE]">
                {species.kingdom}
              </Badge>
            )}
            {species.family && (
              <Badge variant="secondary" className="text-xs bg-[#0B2B26] text-[#DAF1DE]">
                {species.family}
              </Badge>
            )}
          </div>

          {/* Description */}
          {showDescription && species.description && (
            <p className="text-sm text-[#DAF1DE]/80 line-clamp-2 leading-relaxed">
              {species.description}
            </p>
          )}

          {/* Conservation Status Text */}
          {species.iucn_status && (
            <div className="mt-3 pt-3 border-t border-[#8EB69B]/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8EB69B]">Conservation Status</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(species.iucn_status)}`}>
                  {getStatusText(species.iucn_status)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default SpeciesCard;