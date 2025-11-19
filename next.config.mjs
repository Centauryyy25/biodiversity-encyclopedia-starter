/** @type {import('next').NextConfig} */
const nextConfig = {
  // Past runs used custom distDir outside project which broke module resolution in dev.
  // Keep dist inside repo; allow override via NEXT_DIST_DIR if needed, default .next.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'inaturalist-open-data.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
    ],
    minimumCacheTTL: 3600, // seconds
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    largePageDataBytes: 512000, // 500 KB
  },
};

export default nextConfig;
