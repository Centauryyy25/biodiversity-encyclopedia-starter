'use client';

import { useEffect, useState } from 'react';
import { SpeciesCard } from '@/components/species';
import { FeaturedSpecies } from '@/types/species';
import { getFeaturedSpecies } from '@/lib/supabase/species';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FeaturedSpeciesClient() {
  const [featuredSpecies, setFeaturedSpecies] = useState<FeaturedSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedSpecies = async () => {
      try {
        setLoading(true);
        const { data, error } = await getFeaturedSpecies(8);

        if (error) {
          setError(error);
        } else {
          setFeaturedSpecies(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedSpecies();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-[#163832]/50 border-[#8EB69B]/20 rounded-lg overflow-hidden">
              <div className="aspect-video bg-[#0B2B26]/50"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-[#0B2B26]/50 rounded"></div>
                <div className="h-4 bg-[#0B2B26]/50 rounded w-3/4"></div>
                <div className="h-4 bg-[#0B2B26]/50 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-[#163832]/50 border-[#8EB69B]/20 text-[#DAF1DE]">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load featured species. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (featuredSpecies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#8EB69B] text-lg mb-4">
          No featured species available at the moment.
        </div>
        <p className="text-[#DAF1DE]/60">
          We're working on adding more amazing species to our collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {featuredSpecies.map((species) => (
        <SpeciesCard
          key={species.id}
          species={{
            id: species.id,
            scientific_name: species.scientific_name,
            common_name: species.common_name,
            slug: species.slug,
            kingdom: null,
            phylum: null,
            class: null,
            order: null,
            family: null,
            genus: null,
            species: null,
            description: species.description,
            morphology: null,
            habitat_description: null,
            conservation_status: null,
            iucn_status: species.iucn_status,
            featured: species.featured,
            image_urls: species.image_urls || [],
            habitat_map_coords: null,
            created_at: '',
            updated_at: ''
          }}
        />
      ))}
    </div>
  );
}