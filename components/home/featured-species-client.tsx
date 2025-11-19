'use client';

import { SpeciesCard } from '@/components/species';
import type { Species } from '@/types/species';

// Presentational client component (no fetch). Data sudah disuplai dari RSC.
export default function FeaturedSpeciesClient({ species }: { species: Species[] }) {
  if (!species || species.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#8EB69B] text-lg mb-4">
          Tidak ada species unggulan saat ini.
        </div>
        <p className="text-[#DAF1DE]/60">
          Kami sedang menambahkan koleksi unggulan berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {species.map((item) => (
        <SpeciesCard key={item.id} species={item} />
      ))}
    </div>
  );
}
