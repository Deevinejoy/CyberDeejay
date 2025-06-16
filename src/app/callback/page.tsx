'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPOTIFY_CONFIG } from '@/config/spotify'

export default function Callback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          console.error('Spotify auth error:', error)
          setError(`Authentication error: ${error}`)
          setTimeout(() => router.push('/'), 2000)
          return
        }

        if (!code) {
          console.error('No authorization code found')
          setError('No authorization code found')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        console.log('Exchanging code for token...')
        const response = await fetch('/api/spotify-token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            code,
            redirectUri: SPOTIFY_CONFIG.redirectUri,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Token exchange failed:', errorData)
          throw new Error(`Failed to exchange code for token: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        console.log('Token received successfully')

        if (!data.access_token) {
          console.error('No access token in response:', data)
          throw new Error('No access token in response')
        }

        // Validate token before storing
        const validationResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })

        if (!validationResponse.ok) {
          console.error('Token validation failed:', await validationResponse.json())
          throw new Error('Token validation failed')
        }

        console.log('Token validated successfully')
        localStorage.setItem('spotify_token', data.access_token)
        
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } catch (error) {
        console.error('Callback error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">
          {error ? 'Error' : 'Connecting to Spotify...'}
        </h1>
        {error ? (
          <p className="text-red-400 mb-4">{error}</p>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        )}
      </div>
    </div>
  )
} 