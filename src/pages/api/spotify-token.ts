import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route hit:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirectUri } = req.body;
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('Request details:', {
    hasCode: !!code,
    hasRedirectUri: !!redirectUri,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret
  });

  if (!clientId || !clientSecret || !code || !redirectUri) {
    console.log('Missing parameters:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      code: !!code,
      redirectUri: !!redirectUri
    });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('Making request to Spotify...');
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
    console.log('Spotify response:', {
      status: response.status,
      ok: response.ok,
      hasData: !!data
    });

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in token exchange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 