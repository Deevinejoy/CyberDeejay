'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSpotify } from '@/contexts/SpotifyContext'
import Sidebar from '@/components/Sidebar'

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
  uri: string
}

export default function LikedSongs() {
  const { token, play, currentTrack, isPlaying, pause, resume, next, previous, setVolume } = useSpotify()
  const [likedSongs, setLikedSongs] = useState<Track[]>([])
  const [volume, setVolumeState] = useState(0.7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      console.log('Fetching liked songs with token:', token.substring(0, 10) + '...')
      
      // Fetch user's liked songs
      fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .then(async res => {
          console.log('Response status:', res.status)
          console.log('Response headers:', Object.fromEntries(res.headers.entries()))
          
          if (!res.ok) {
            const errorData = await res.json()
            console.error('API Error Response:', errorData)
            throw new Error(errorData.error?.message || 'Failed to fetch liked songs')
          }
          return res.json()
        })
        .then(data => {
          console.log('Spotify API Response:', data)
          if (!data || !Array.isArray(data.items)) {
            console.error('Invalid response format:', data)
            throw new Error('Invalid response format from Spotify API')
          }
          setLikedSongs(data.items.map((item: { track: Track }) => item.track))
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch liked songs:', error)
          setError(error.message)
          setLoading(false)
        })
    }
  }, [token])

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume)
    setVolume(newVolume)
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Liked Songs</h2>
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
          <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
          <p className="text-gray-400">Your favorite tracks</p>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No liked songs found. Start liking some songs to see them here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {likedSongs.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer group"
                onClick={() => play(track.uri)}
              >
                <span className="text-gray-400 w-8">{index + 1}</span>
                <div className="relative w-12 h-12 rounded overflow-hidden">
                  <Image
                    src={track.album.images[0]?.url || '/placeholder.png'}
                    alt={track.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{track.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <span className="text-gray-400">{formatDuration(track.duration_ms)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Now Playing */}
        {currentTrack && (
          <section className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-black/30 backdrop-blur-sm border-t border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={currentTrack.album.images[0]?.url || '/placeholder.png'}
                  alt={currentTrack.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{currentTrack.name}</h3>
                <p className="text-gray-400 text-sm">
                  {currentTrack.artists.map((artist: { name: string }) => artist.name).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  onClick={previous}
                >
                  ⏮
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  onClick={next}
                >
                  ⏭
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
} 