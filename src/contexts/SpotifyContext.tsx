'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SPOTIFY_CONFIG } from '@/config/spotify'

interface SpotifyContextType {
  token: string | null
  login: () => void
  currentTrack: Spotify.Track | null
  isPlaying: boolean
  play: (uri: string) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  setVolume: (volume: number) => void
}

const SpotifyContext = createContext<SpotifyContextType | null>(null)

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSDKReady, setIsSDKReady] = useState(false)

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsSDKReady(true)
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const initializePlayer = async () => {
      if (!token || !isSDKReady) return

      const isValid = await validateToken(token)
      if (!isValid) {
        localStorage.removeItem('spotify_token')
        setToken(null)
        return
      }

      const player = new window.Spotify.Player({
        name: 'CyberDeejay Web Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5
      })

      player.addListener('initialization_error', () => {
        localStorage.removeItem('spotify_token')
        setToken(null)
      })

      player.addListener('authentication_error', () => {
        localStorage.removeItem('spotify_token')
        setToken(null)
        window.location.href = '/'
      })

      player.addListener('account_error', () => {
        localStorage.removeItem('spotify_token')
        setToken(null)
      })

      player.addListener('player_state_changed', (state: Spotify.PlaybackState) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track)
          setIsPlaying(!state.paused)
        }
      })

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false
          })
        }).catch(() => {})
      })

      player.connect().then((success: boolean) => {
        if (success) {
          setPlayer(player)
        } else {
          localStorage.removeItem('spotify_token')
          setToken(null)
        }
      }).catch(() => {
        localStorage.removeItem('spotify_token')
        setToken(null)
      })
    }

    initializePlayer()

    return () => {
      if (player) {
        player.disconnect()
      }
    }
  }, [token, isSDKReady])

  useEffect(() => {
    const initializeToken = async () => {
      const storedToken = localStorage.getItem('spotify_token')
      if (storedToken) {
        const isValid = await validateToken(storedToken)
        if (isValid) {
          setToken(storedToken)
        } else {
          localStorage.removeItem('spotify_token')
          setToken(null)
        }
      }
    }

    initializeToken()
  }, [])

  const login = () => {
    if (!SPOTIFY_CONFIG.clientId || !SPOTIFY_CONFIG.redirectUri) return

    localStorage.removeItem('spotify_token')
    setToken(null)

    const authUrl = new URL('https://accounts.spotify.com/authorize')
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CONFIG.clientId,
      scope: SPOTIFY_CONFIG.scopes.join(' '),
      redirect_uri: SPOTIFY_CONFIG.redirectUri,
      show_dialog: 'true',
      state: Math.random().toString(36).substring(7)
    })

    authUrl.search = params.toString()
    window.location.href = authUrl.toString()
  }

  const play = async (uri: string) => {
    if (!player || !token) return

    try {
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [uri] })
      })
    } catch {}
  }

  const pause = () => {
    if (!player) return
    player.pause()
  }

  const resume = () => {
    if (!player) return
    player.resume()
  }

  const next = () => {
    if (!player) return
    player.nextTrack()
  }

  const previous = () => {
    if (!player) return
    player.previousTrack()
  }

  const setVolume = (volume: number) => {
    if (!player) return
    player.setVolume(volume)
  }

  return (
    <SpotifyContext.Provider
      value={{
        token,
        login,
        currentTrack,
        isPlaying,
        play,
        pause,
        resume,
        next,
        previous,
        setVolume
      }}
    >
      {children}
    </SpotifyContext.Provider>
  )
}

export function useSpotify() {
  const context = useContext(SpotifyContext)
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider')
  }
  return context
} 