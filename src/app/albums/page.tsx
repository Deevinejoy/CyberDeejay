'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSpotify } from '@/contexts/SpotifyContext'
import Sidebar from '@/components/Sidebar'

interface Album {
  id: string
  name: string
  images: { url: string }[]
  artists: { name: string }[]
  release_date: string
  total_tracks: number
  uri: string
}

export default function Albums() {
  const { token } = useSpotify()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      // Fetch user's saved albums
      fetch('https://api.spotify.com/v1/me/albums?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error?.message || 'Failed to fetch albums')
          }
          return res.json()
        })
        .then(data => {
          console.log('Spotify API Response:', data) // Debug log
          if (!data || !Array.isArray(data.items)) {
            throw new Error('Invalid response format from Spotify API')
          }
          setAlbums(data.items.map((item: { album: Album }) => item.album))
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch albums:', error)
          setError(error.message)
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Sidebar onNavigate={() => {}} />
        <div className="md:ml-64 p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Albums</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
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
          <h1 className="text-4xl font-bold text-white mb-2">Your Albums</h1>
          <p className="text-gray-400">Albums you&apos;ve saved</p>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No albums found. Start saving some albums to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-black/30 rounded-lg overflow-hidden hover:bg-black/40 transition-colors cursor-pointer group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={album.images[0]?.url || '/placeholder.png'}
                    alt={album.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium truncate">{album.name}</h3>
                  <p className="text-gray-400 text-sm truncate">
                    {album.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <div className="mt-2 flex justify-between items-center text-gray-400 text-xs">
                    <span>{new Date(album.release_date).getFullYear()}</span>
                    <span>{album.total_tracks} tracks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 