'use client';

import { useEffect, useState } from 'react';
import { SpeciesCard } from '@/components/species';
import type { Species } from '@/types/species';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeaturedSpeciesResponse {
  data: Species[];
  error?: string;
}

export default function FeaturedSpeciesClient() {
  const [featuredSpecies, setFeaturedSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedSpecies = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/species?featured=true&limit=8', {
          cache: 'no-store',
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load featured species');
        }

        const payload: FeaturedSpeciesResponse = await response.json();

        if (payload.error) {
          setError(payload.error);
          return;
        }

        setFeaturedSpecies(payload.data || []);
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
          We&apos;re working on adding more amazing species to our collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {featuredSpecies.map((species) => (
        <SpeciesCard key={species.id} species={species} />
      ))}
    </div>
  );
}
