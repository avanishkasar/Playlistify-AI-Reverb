import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-spotify-client-id, x-spotify-client-secret, x-spotify-refresh-token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description, genres, moods, activities, trackCount = 20 } = await req.json();
    
    // Get Spotify credentials from headers
    const clientId = req.headers.get('x-spotify-client-id');
    const clientSecret = req.headers.get('x-spotify-client-secret');
    const refreshToken = req.headers.get('x-spotify-refresh-token');

    if (!clientId || !clientSecret || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Missing Spotify credentials' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get access token from refresh token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get Spotify access token', details: error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Get recommendations from Spotify
    const searchParams = new URLSearchParams();
    
    // Add seed genres (max 5)
    if (genres && genres.length > 0) {
      searchParams.append('seed_genres', genres.slice(0, 5).join(','));
    } else {
      // Default genres if none provided
      searchParams.append('seed_genres', 'pop,rock,indie');
    }
    
    searchParams.append('limit', Math.min(trackCount, 100).toString());

    // Add target features based on moods
    if (moods && moods.length > 0) {
      if (moods.includes('happy') || moods.includes('energetic') || moods.includes('excited')) {
        searchParams.append('target_valence', '0.8');
        searchParams.append('target_energy', '0.8');
      }
      if (moods.includes('sad') || moods.includes('melancholic')) {
        searchParams.append('target_valence', '0.3');
        searchParams.append('target_energy', '0.4');
      }
      if (moods.includes('calm') || moods.includes('peaceful')) {
        searchParams.append('target_valence', '0.6');
        searchParams.append('target_energy', '0.3');
      }
    }

    // Add target features based on activities
    if (activities && activities.length > 0) {
      if (activities.includes('workout') || activities.includes('party') || activities.includes('dance')) {
        searchParams.append('target_energy', '0.9');
        searchParams.append('target_danceability', '0.8');
      }
      if (activities.includes('sleep') || activities.includes('relax')) {
        searchParams.append('target_energy', '0.2');
        searchParams.append('target_acousticness', '0.7');
      }
      if (activities.includes('focus') || activities.includes('study')) {
        searchParams.append('target_instrumentalness', '0.6');
        searchParams.append('target_energy', '0.5');
      }
    }

    const recommendationsResponse = await fetch(
      `https://api.spotify.com/v1/recommendations?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    if (!recommendationsResponse.ok) {
      const error = await recommendationsResponse.text();
      console.error('Recommendations error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get recommendations', details: error }),
        { status: recommendationsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recommendationsData = await recommendationsResponse.json();
    
    // Format the tracks
    const tracks = recommendationsData.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '',
      duration: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        tracks,
        count: tracks.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
