'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SPOTIFY_CONFIG } from '@/config/spotify'

interface SpotifyContextType {
  token: string | null
  player: Spotify.Player | null
  isPlaying: boolean
  currentTrack: Spotify.Track | null
  deviceId: string | null
  login: () => void
  logout: () => void
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('spotify_token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    // Initialize Spotify Web Playback SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'CyberTunes Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5
      })

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message)
      })

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message)
      })

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message)
      })

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message)
      })

      // Playback status updates
      player.addListener('player_state_changed', state => {
        if (state) {
          setIsPlaying(!state.paused)
          setCurrentTrack(state.track_window.current_track)
        }
      })

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        setDeviceId(device_id)
        setPlayer(player)
      })

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
      })

      // Connect to the player
      player.connect().then(success => {
        if (success) {
          console.log('Successfully connected to Spotify!')
        }
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [token])

  const login = () => {
    if (!SPOTIFY_CONFIG.clientId) {
      console.error('Spotify Client ID is missing')
      return
    }
    if (!SPOTIFY_CONFIG.redirectUri) {
      console.error('Redirect URI is missing')
      return
    }
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CONFIG.clientId}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.redirectUri)}&scope=${encodeURIComponent(SPOTIFY_CONFIG.scopes)}&show_dialog=true`
    console.log('Auth URL:', authUrl)
    window.location.href = authUrl
  }

  const logout = () => {
    localStorage.removeItem('spotify_token')
    setToken(null)
    setPlayer(null)
    setIsPlaying(false)
    setCurrentTrack(null)
    setDeviceId(null)
  }

  const play = async (uri: string) => {
    if (player && deviceId) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        })
      } catch (error) {
        console.error('Error playing track:', error)
      }
    }
  }

  const pause = () => {
    player?.pause()
  }

  const resume = () => {
    player?.resume()
  }

  const next = () => {
    player?.nextTrack()
  }

  const previous = () => {
    player?.previousTrack()
  }

  const setVolume = (volume: number) => {
    player?.setVolume(volume)
  }

  return (
    <SpotifyContext.Provider value={{
      token,
      player,
      isPlaying,
      currentTrack,
      deviceId,
      login,
      logout,
      play,
      pause,
      resume,
      next,
      previous,
      setVolume,
    }}>
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