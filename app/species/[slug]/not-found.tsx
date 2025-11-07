import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';

export default function SpeciesNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347] flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-[#163832]/50 border-[#8EB69B]/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#8EB69B]/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-[#8EB69B]" />
            </div>
            <CardTitle className="text-3xl font-serif text-[#DAF1DE]">
              Species Not Found
            </CardTitle>
            <p className="text-[#8EB69B] mt-2">
              We couldn't find the species you're looking for.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-[#DAF1DE]">
              The species you requested may have been moved, renamed, or may not exist in our encyclopedia yet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="border-[#8EB69B] text-[#DAF1DE] hover:bg-[#8EB69B]/20">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Species
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-[#8EB69B]/20">
              <h3 className="text-lg font-semibold text-[#DAF1DE] mb-2">
                Looking for something specific?
              </h3>
              <p className="text-[#8EB69B] text-sm mb-4">
                Try searching for species using their common or scientific names, or browse our featured collection.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-[#163832] text-[#8EB69B] rounded-full text-sm">
                  Bengal Tiger
                </span>
                <span className="px-3 py-1 bg-[#163832] text-[#8EB69B] rounded-full text-sm">
                  Giant Panda
                </span>
                <span className="px-3 py-1 bg-[#163832] text-[#8EB69B] rounded-full text-sm">
                  Damask Rose
                </span>
                <span className="px-3 py-1 bg-[#163832] text-[#8EB69B] rounded-full text-sm">
                  Platypus
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}