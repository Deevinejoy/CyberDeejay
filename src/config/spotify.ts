// Client-side configuration
export const SPOTIFY_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'user-follow-read',
    'user-library-modify'
  ]
}

// Validate client-side configuration
if (!SPOTIFY_CONFIG.clientId) {
  throw new Error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not defined')
}

if (!SPOTIFY_CONFIG.redirectUri) {
  throw new Error('NEXT_PUBLIC_REDIRECT_URI is not defined')
} 