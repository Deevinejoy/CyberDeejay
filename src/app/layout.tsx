import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SpotifyProvider } from '@/contexts/SpotifyContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CyberTunes - Futuristic Music Player',
  description: 'A modern music player with Spotify integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SpotifyProvider>
          {children}
        </SpotifyProvider>
      </body>
    </html>
  )
}
