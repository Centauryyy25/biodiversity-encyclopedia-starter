"use client"

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'

export default function NavbarUser() {
  const { user } = useUser()
  const role = (user?.publicMetadata?.role as string | undefined) ?? ''
  const isAdmin = role === 'admin' || role === 'moderator'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50
      flex items-center justify-between
      px-6 py-3
      border-b border-white/10
      bg-[rgba(13,40,33,0.4)] backdrop-blur-md
      shadow-[0_4px_30px_rgba(0,0,0,0.1)]
      text-emerald-50"
    >
      {/* Brand */}
      <Link
        href="/"
        className="text-2xl font-semibold tracking-tight
        text-emerald-100 drop-shadow-sm hover:text-emerald-200 transition"
      >
        Encyclopedia
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <SignedIn>
          <Link
            href="/learn"
            className="hidden sm:inline px-4 py-1.5 rounded-md
            border border-emerald-700/40
            bg-emerald-800/20 hover:bg-emerald-700/30
            text-emerald-50 transition-all duration-200
            backdrop-blur-sm"
          >
            Learn
          </Link>
          <Link
            href="/contribute"
            className="hidden sm:inline px-4 py-1.5 rounded-md
            border border-emerald-700/40
            bg-emerald-800/20 hover:bg-emerald-700/30
            text-emerald-50 transition-all duration-200
            backdrop-blur-sm"
          >
            Contribute
          </Link>
          <Link
            href="/"
            className="hidden sm:inline px-4 py-1.5 rounded-md
            border border-emerald-700/40
            bg-emerald-800/20 hover:bg-emerald-700/30
            text-emerald-50 transition-all duration-200
            backdrop-blur-sm"
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              href="/admin/moderate"
              className="hidden sm:inline px-4 py-1.5 rounded-md
              border border-emerald-500/50
              bg-emerald-500/15 hover:bg-emerald-500/25
              text-emerald-50 transition-all duration-200
              backdrop-blur-sm shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
            >
              Moderator Center
            </Link>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="px-4 py-1.5 rounded-md border border-emerald-700/40
              bg-emerald-800/20 hover:bg-emerald-700/30
              text-emerald-50 transition-all duration-200
              backdrop-blur-sm"
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}
