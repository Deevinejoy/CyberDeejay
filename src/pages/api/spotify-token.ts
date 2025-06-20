import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirectUri } = req.body;
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('Received token request with:', {
    hasCode: !!code,
    hasRedirectUri: !!redirectUri,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret
  });

  if (!clientId || !clientSecret || !code || !redirectUri) {
    console.error('Missing required parameters:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      code: !!code,
      redirectUri: !!redirectUri
    });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('Making request to Spotify token endpoint...');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify token error:', data);
      return res.status(response.status).json(data);
    }

    console.log('Successfully obtained token');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
} 