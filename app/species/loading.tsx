export default function SpeciesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051F20] to-[#235347] py-16">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-12 space-y-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-4 w-32 rounded-full bg-[#8EB69B]/30 animate-pulse" />
          <div className="mx-auto h-10 w-64 rounded-full bg-[#8EB69B]/40 animate-pulse" />
          <div className="mx-auto h-5 w-5/6 max-w-2xl rounded-full bg-[#8EB69B]/20 animate-pulse" />
          <div className="mx-auto h-5 w-56 rounded-full bg-[#8EB69B]/20 animate-pulse" />
        </div>

        <div className="space-y-6 rounded-2xl border border-[#8EB69B]/20 bg-[#163832]/60 backdrop-blur-md shadow-xl shadow-[#0B2B26]/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-64 rounded-xl border border-[#8EB69B]/20 bg-[#0B2B26]/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
