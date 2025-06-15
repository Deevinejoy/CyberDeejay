'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onNavigate: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleNavigation = () => {
    setIsMobileMenuOpen(false)
    onNavigate()
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-black/30 text-white hover:bg-black/40 transition-colors"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu Overlay - Only visible on mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop, slides on mobile */}
      <aside
        className={`
          fixed md:fixed top-0 left-0 h-screen bg-black/30 backdrop-blur-lg border-r border-purple-500/20 p-6
          transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64
        `}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            CyberDeejay
          </h1>
        </div>
        <nav className="space-y-4">
          <Link
            href="/"
            onClick={handleNavigation}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              isActive('/') 
                ? 'bg-purple-500/10 text-purple-300' 
                : 'text-gray-400 hover:text-purple-300'
            } transition-colors block`}
          >
            Home
          </Link>
         
          <Link
            href="/liked"
            onClick={handleNavigation}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              isActive('/liked') 
                ? 'bg-purple-500/10 text-purple-300' 
                : 'text-gray-400 hover:text-purple-300'
            } transition-colors block`}
          >
            Liked Songs
          </Link>
          <Link
            href="/artists"
            onClick={handleNavigation}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              isActive('/artists') 
                ? 'bg-purple-500/10 text-purple-300' 
                : 'text-gray-400 hover:text-purple-300'
            } transition-colors block`}
          >
            Artists
          </Link>
          <Link
            href="/albums"
            onClick={handleNavigation}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              isActive('/albums') 
                ? 'bg-purple-500/10 text-purple-300' 
                : 'text-gray-400 hover:text-purple-300'
            } transition-colors block`}
          >
            Albums
          </Link>
         
        </nav>
      </aside>
    </>
  )
} 