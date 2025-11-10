import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import ClerkClientProvider from '@/components/providers/clerk-client-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'FloraFauna Encyclopedia - Discover Biodiversity',
  description: 'Explore our comprehensive collection of flora and fauna species. Learn about taxonomy, conservation, and the wonders of biodiversity through detailed species profiles, stunning photography, and educational content.',
  keywords: [
    'biodiversity',
    'encyclopedia',
    'species',
    'flora',
    'fauna',
    'conservation',
    'taxonomy',
    'wildlife',
    'nature',
    'plants',
    'animals',
    'ecosystem',
    'environment',
    'education'
  ],
  authors: [{ name: 'FloraFauna Encyclopedia Team' }],
  creator: 'FloraFauna Encyclopedia',
  publisher: 'FloraFauna Encyclopedia',
  metadataBase: new URL('https://florafauna-encyclopedia.com'),
  openGraph: {
    title: 'FloraFauna Encyclopedia - Discover Biodiversity',
    description: 'Explore our comprehensive collection of flora and fauna species. Learn about taxonomy, conservation, and the wonders of biodiversity.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FloraFauna Encyclopedia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FloraFauna Encyclopedia - Discover Biodiversity',
    description: 'Explore our comprehensive collection of flora and fauna species.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkClientProvider>
          <TanstackClientProvider>{children}</TanstackClientProvider>
        </ClerkClientProvider>
      </body>
    </html>
  )
}
