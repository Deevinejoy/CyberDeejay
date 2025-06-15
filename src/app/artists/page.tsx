'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSpotify } from '@/contexts/SpotifyContext'
import Sidebar from '@/components/Sidebar'

interface Artist {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  popularity: number
  uri: string
}

export default function Artists() {
  const { token } = useSpotify()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Fetch user's followed artists
      fetch('https://api.spotify.com/v1/me/following?type=artist&limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setArtists(data.artists.items)
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch artists:', error)
          setLoading(false)
        })
    }
  }, [token])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
        >
          Connect with Spotify
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Sidebar onNavigate={() => {}} />
        <div className="md:ml-64 p-4 md:p-8">
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Sidebar onNavigate={() => {}} />

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Artists</h1>
          <p className="text-gray-400">Artists you follow</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="bg-black/30 rounded-lg overflow-hidden hover:bg-black/40 transition-colors cursor-pointer group"
            >
              <div className="relative aspect-square">
                <Image
                  src={artist.images[0]?.url || '/placeholder.png'}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium truncate">{artist.name}</h3>
                <p className="text-gray-400 text-sm truncate">
                  {artist.genres.slice(0, 2).join(', ')}
                </p>
                <div className="mt-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${artist.popularity}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Popularity: {artist.popularity}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 