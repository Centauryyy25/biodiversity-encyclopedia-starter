import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe } from 'lucide-react';
import { Species } from '@/types/species';

interface SpeciesCardCompactProps {
  species: Species;
  className?: string;
}

export function SpeciesCardCompact({
  species,
  className = ''
}: SpeciesCardCompactProps) {
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

  const primaryImage = species.image_urls && species.image_urls.length > 0
    ? species.image_urls[0]
    : null;

  return (
    <Link href={`/species/${species.slug}`}>
      <Card className={`
        group cursor-pointer transition-all duration-300 hover:scale-[1.03]
        bg-[#163832]/50 border-[#8EB69B]/20 hover:border-[#8EB69B]/40
        hover:shadow-lg hover:shadow-[#8EB69B]/10 overflow-hidden
        ${className}
      `}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${species.common_name || species.scientific_name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0B2B26] to-[#163832] flex items-center justify-center">
              <Globe className="w-8 h-8 text-[#8EB69B]/50" />
            </div>
          )}

          {/* Status Badges Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#051F20]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center justify-between">
                {/* Featured Badge */}
                {species.featured && (
                  <Badge className="bg-[#8EB69B] text-[#051F20] text-xs font-semibold">
                    Featured
                  </Badge>
                )}

                {/* Conservation Status */}
                {species.iucn_status && (
                  <Badge className={`${getStatusColor(species.iucn_status)} text-xs font-semibold flex items-center gap-1`}>
                    <Shield className="w-3 h-3" />
                    {species.iucn_status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Top Status Indicators (always visible) */}
          <div className="absolute top-2 left-2">
            {species.featured && (
              <div className="w-2 h-2 bg-[#8EB69B] rounded-full"></div>
            )}
          </div>
          <div className="absolute top-2 right-2">
            {species.iucn_status && (
              <div className={`w-2 h-2 rounded-full ${
                species.iucn_status.toUpperCase() === 'LC' ? 'bg-green-500' :
                species.iucn_status.toUpperCase() === 'NT' ? 'bg-blue-500' :
                species.iucn_status.toUpperCase() === 'VU' ? 'bg-yellow-500' :
                species.iucn_status.toUpperCase() === 'EN' ? 'bg-orange-500' :
                species.iucn_status.toUpperCase() === 'CR' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#DAF1DE] group-hover:text-[#8EB69B] transition-colors line-clamp-1">
              {species.common_name || species.scientific_name}
            </h3>
            <p className="text-xs text-[#8EB69B] italic line-clamp-1">
              {species.common_name && species.common_name !== species.scientific_name
                ? species.scientific_name
                : ''
              }
            </p>
            <div className="flex items-center justify-between">
              {species.kingdom && (
                <Badge variant="secondary" className="text-xs bg-[#0B2B26] text-[#DAF1DE]">
                  {species.kingdom}
                </Badge>
              )}
              {species.iucn_status && (
                <Badge className={`${getStatusColor(species.iucn_status)} text-xs`}>
                  {species.iucn_status}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default SpeciesCardCompact;