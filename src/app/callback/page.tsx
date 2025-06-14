'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SPOTIFY_CONFIG } from '@/config/spotify'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        console.log('Callback code:', code)
        console.log('Callback error:', error)

        if (error) {
          console.error('Authentication error:', error)
          router.push('/')
          return
        }

        if (!code) {
          console.error('No authorization code found')
          router.push('/')
          return
        }

        // Log request details
        console.log('Token exchange request details:', {
          clientId: SPOTIFY_CONFIG.clientId,
          redirectUri: SPOTIFY_CONFIG.redirectUri,
          code: code
        })

        // Exchange the code for an access token via API route
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
          const errorData = await response.text()
          console.error('Token exchange failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            headers: Object.fromEntries(response.headers.entries())
          })
          throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Token response:', data)

        // Store the token
        localStorage.setItem('spotify_token', data.access_token)
        
        // Redirect to home page
        router.push('/')
      } catch (error) {
        console.error('Error in callback:', error)
        router.push('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  )
} 