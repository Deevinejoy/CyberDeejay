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
      console.log('Spotify SDK Ready')
      setIsSDKReady(true)
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const initializeToken = async () => {
      const storedToken = localStorage.getItem('spotify_token')
      if (storedToken) {
        console.log('Found stored token, validating...')
        const isValid = await validateToken(storedToken)
        if (isValid) {
          console.log('Stored token is valid, setting token...')
          setToken(storedToken)
        } else {
          console.log('Stored token is invalid, removing...')
          localStorage.removeItem('spotify_token')
          setToken(null)
        }
      } else {
        // Check if we're on the callback page
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        if (code) {
          console.log('Found authorization code, redirecting to callback...')
          return
        }
        console.log('No stored token found')
      }
    }

    initializeToken()
  }, [])

  useEffect(() => {
    const initializePlayer = async () => {
      if (!token || !isSDKReady) {
        console.log('Waiting for token or SDK:', { hasToken: !!token, isSDKReady })
        return
      }

      console.log('Initializing player...')
      const isValid = await validateToken(token)
      if (!isValid) {
        console.log('Token validation failed during player initialization')
        localStorage.removeItem('spotify_token')
        setToken(null)
        return
      }

      try {
        const player = new window.Spotify.Player({
          name: 'CyberDeejay Web Player',
          getOAuthToken: cb => cb(token),
          volume: 0.5
        })

        player.addListener('initialization_error', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          if ('message' in state) {
            console.error('Initialization error:', state.message)
            if (state.message.includes('authentication') || state.message.includes('token')) {
              localStorage.removeItem('spotify_token')
              setToken(null)
            }
          }
        })

        player.addListener('authentication_error', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          if ('message' in state) {
            console.error('Authentication error:', state.message)
            localStorage.removeItem('spotify_token')
            setToken(null)
            window.location.href = '/'
          }
        })

        player.addListener('account_error', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          if ('message' in state) {
            console.error('Account error:', state.message)
            if (state.message.includes('premium')) {
              console.log('Premium account required for playback')
            } else {
              localStorage.removeItem('spotify_token')
              setToken(null)
            }
          }
        })

        player.addListener('player_state_changed', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          if ('track_window' in state) {
            setCurrentTrack(state.track_window.current_track)
            setIsPlaying(!state.paused)
          }
        })

        player.addListener('ready', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          console.log('Player ready')
          if ('device_id' in state) {
            fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                device_ids: [state.device_id],
                play: false
              })
            }).catch((error) => {
              if (!(error instanceof Error && error.message?.includes('CloudPlaybackClientError'))) {
                console.error('Error setting device:', error)
              }
            })
          }
        })

        player.addListener('not_ready', (state: Spotify.PlaybackState | { message: string } | { device_id: string }) => {
          console.log('Player not ready:', state)
        })

        console.log('Connecting player...')
        const success = await player.connect()
        if (success) {
          console.log('Player connected successfully')
          setPlayer(player)
        } else {
          console.error('Failed to connect player')
          localStorage.removeItem('spotify_token')
          setToken(null)
        }
      } catch (error) {
        if (error instanceof Error && error.message?.includes('CloudPlaybackClientError')) {
          console.log('Cloud playback error (non-critical):', error.message)
        } else {
          console.error('Error initializing player:', error)
          localStorage.removeItem('spotify_token')
          setToken(null)
        }
      }
    }

    initializePlayer()

    return () => {
      if (player) {
        console.log('Disconnecting player...')
        player.disconnect()
      }
    }
  }, [token, isSDKReady])

  const login = () => {
    if (!SPOTIFY_CONFIG.clientId || !SPOTIFY_CONFIG.redirectUri) {
      console.error('Missing Spotify configuration')
      return
    }

    console.log('Starting login process...')
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
    console.log('Redirecting to Spotify auth...')
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
    } catch (error) {
      if (!(error instanceof Error && error.message?.includes('CloudPlaybackClientError'))) {
        console.error('Error playing track:', error)
      }
    }
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