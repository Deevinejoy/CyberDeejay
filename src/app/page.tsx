'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSpotify } from '@/contexts/SpotifyContext'

interface Playlist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: {
    items: {
      track: {
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
    }[]
  }
}

interface SearchResult {
  tracks: {
    items: {
      id: string
      name: string
      artists: { name: string }[]
      album: {
        name: string
        images: { url: string }[]
      }
      duration_ms: number
      uri: string
    }[]
  }
}

export default function Home() {
  const { token, login, currentTrack, isPlaying, play, pause, resume, next, previous, setVolume } = useSpotify()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [volume, setVolumeState] = useState(0.7)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (token) {
      // Fetch user's playlists
      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          // Fetch full playlist details
          Promise.all(
            data.items.map((playlist: { id: string }) =>
              fetch(`https://api.spotify.com/v1/playlists/${playlist.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }).then(res => res.json())
            )
          ).then(playlistDetails => {
            setPlaylists(playlistDetails)
          })
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !token) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <button
          onClick={login}
          className="px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
        >
          Connect with Spotify
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-black/30 text-white"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 h-full bg-black/30 backdrop-blur-lg border-r border-purple-500/20 p-6
        transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        w-64
      `}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            CyberDeejay
          </h1>
        </div>
        <nav className="space-y-4">
          <button 
            onClick={() => {
              setSelectedPlaylist(null)
              setSearchResults(null)
              setIsMobileMenuOpen(false)
            }}
            className="w-full text-left px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => {
              setSelectedPlaylist(null)
              setSearchResults(null)
              setIsMobileMenuOpen(false)
            }}
            className="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-purple-300 transition-colors"
          >
            Search
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-purple-300 transition-colors">
            Library
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs..."
              className="w-full px-4 py-3 bg-black/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchResults ? (
          // Search Results
          <div>
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={() => setSearchResults(null)}
                className="text-purple-300 hover:text-purple-400"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-bold text-white">Search Results</h1>
            </div>

            <div className="space-y-2">
              {searchResults.tracks.items.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer group"
                  onClick={() => play(track.uri)}
                >
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
          </div>
        ) : selectedPlaylist ? (
          // Playlist View
          <div>
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-purple-300 hover:text-purple-400"
              >
                ← Back to Playlists
              </button>
              <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                <Image
                  src={selectedPlaylist.images[0]?.url || '/placeholder.png'}
                  alt={selectedPlaylist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{selectedPlaylist.name}</h1>
                <p className="text-gray-400">{selectedPlaylist.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedPlaylist.tracks.items.map((item, index) => (
                <div
                  key={item.track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer group"
                  onClick={() => play(item.track.uri)}
                >
                  <span className="text-gray-400 w-8">{index + 1}</span>
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={item.track.album.images[0]?.url || '/placeholder.png'}
                      alt={item.track.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.track.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {item.track.artists.map(artist => artist.name).join(', ')}
                    </p>
                  </div>
                  <span className="text-gray-400">{formatDuration(item.track.duration_ms)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Playlists Grid
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Your Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="group relative bg-black/30 backdrop-blur-sm rounded-xl p-4 hover:bg-black/40 transition-all cursor-pointer"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={playlist.images[0]?.url || '/placeholder.png'}
                      alt={playlist.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
                  <p className="text-gray-400">{playlist.description}</p>
                </div>
              ))}
            </div>
          </section>
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
