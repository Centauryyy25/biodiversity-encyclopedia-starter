import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SpeciesPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" disabled className="text-[#DAF1DE] hover:text-[#8EB69B]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Encyclopedia
          </Button>
        </div>

        {/* Species Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <Skeleton className="h-12 w-3/4 bg-[#163832]/50 mb-2" />
              <Skeleton className="h-8 w-1/2 bg-[#163832]/50 mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-20 bg-[#163832]/50" />
                <Skeleton className="h-6 w-24 bg-[#163832]/50" />
                <Skeleton className="h-6 w-32 bg-[#163832]/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-[#163832]/50" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-video bg-[#163832]/50 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-[#163832]/50" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-3/4 bg-[#163832]/50" />
                </div>
              </CardContent>
            </Card>

            {/* Taxonomy */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-40 bg-[#163832]/50" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20 bg-[#163832]/50" />
                      <Skeleton className="h-4 w-24 bg-[#163832]/50" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Morphology */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-36 bg-[#163832]/50" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-2/3 bg-[#163832]/50" />
                </div>
              </CardContent>
            </Card>

            {/* Habitat */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-40 bg-[#163832]/50" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-full bg-[#163832]/50" />
                  <Skeleton className="h-4 w-3/4 bg-[#163832]/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Conservation Status */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-[#163832]/50" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-32 mx-auto bg-[#163832]/50" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1 bg-[#163832]/50" />
                  <Skeleton className="h-4 w-16 bg-[#163832]/50" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1 bg-[#163832]/50" />
                  <Skeleton className="h-4 w-20 bg-[#163832]/50" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1 bg-[#163832]/50" />
                  <Skeleton className="h-4 w-16 bg-[#163832]/50" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-[#163832]/50 border-[#8EB69B]/20">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-[#163832]/50" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-0.5 w-full bg-[#8EB69B]/20 mb-2" />
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-3 w-20 bg-[#163832]/50" />
                      <Skeleton className="h-3 w-24 bg-[#163832]/50" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}