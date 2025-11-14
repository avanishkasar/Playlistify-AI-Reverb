// Spotify API Service

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface PlaylistParams {
  description?: string;
  genres?: string[];
  moods?: string[];
  activities?: string[];
  trackCount?: number;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  uri: string;
  previewUrl: string | null;
  spotifyUrl: string;
}

export class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private availableGenres: string[] | null = null;

  async getAvailableGenres(credentials: SpotifyCredentials): Promise<string[]> {
    if (this.availableGenres) {
      return this.availableGenres;
    }

    try {
      const accessToken = await this.getAccessToken(credentials);
      
      const response = await fetch('http://localhost:3002/available-genre-seeds', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.availableGenres = data.genres || [];
        console.log('✅ Available Spotify genres:', this.availableGenres.length);
        return this.availableGenres;
      }
    } catch (error) {
      console.error('Failed to fetch available genres:', error);
    }

    // Return common genres as fallback
    return ['pop', 'rock', 'indie', 'electronic', 'hip-hop', 'jazz', 'classical', 'country', 'r-n-b', 'metal'];
  }

  private mapGenreToSpotifyGenre(genre: string, availableGenres: string[]): string | null {
    // Direct match
    if (availableGenres.includes(genre)) {
      return genre;
    }

    // Try lowercase with hyphens
    const normalized = genre.toLowerCase().replace(/\s+/g, '-');
    if (availableGenres.includes(normalized)) {
      return normalized;
    }

    // Common mappings
    const mappings: { [key: string]: string } = {
      'hip-hop': 'hip-hop',
      'hiphop': 'hip-hop',
      'r&b': 'r-n-b',
      'rnb': 'r-n-b',
      'edm': 'electronic',
      'dance': 'dance',
    };

    if (mappings[genre.toLowerCase()]) {
      const mapped = mappings[genre.toLowerCase()];
      if (availableGenres.includes(mapped)) {
        return mapped;
      }
    }

    return null;
  }

  async getAccessToken(credentials: SpotifyCredentials): Promise<string> {
    // Check if we have a valid cached token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    console.log('🔑 Getting new Spotify access token...');
    console.log('Credentials check:', {
      hasClientId: !!credentials.clientId,
      hasClientSecret: !!credentials.clientSecret,
      hasRefreshToken: !!credentials.refreshToken,
      clientIdLength: credentials.clientId?.length,
      clientSecretLength: credentials.clientSecret?.length,
      refreshTokenLength: credentials.refreshToken?.length,
    });

    try {
      const authHeader = 'Basic ' + btoa(`${credentials.clientId}:${credentials.clientSecret}`);
      console.log('Auth header created, length:', authHeader.length);

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
      });
      console.log('Request body:', body.toString());
      console.log('Using proxy URL: /api/spotify-token/api/token');

      const response = await fetch('http://localhost:3002/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(Object.fromEntries(body)),
      });

      console.log('Token response status:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Token error response:', error);
        throw new Error(`Failed to get access token: ${response.statusText} - ${error}`);
      }

      const data = await response.json();
      console.log('✅ Token response data:', { hasAccessToken: !!data.access_token });
      
      this.accessToken = data.access_token;
      // Set expiry to 50 minutes (tokens last 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      console.log('✅ Got access token successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      throw error;
    }
  }

  async generatePlaylist(
    credentials: SpotifyCredentials,
    params: PlaylistParams
  ): Promise<Track[]> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      // Build search query based on params - using search instead of recommendations
      // because recommendations endpoint returns 404 (not available in all regions/apps)
      let searchQuery = '';
      
      // Simple search with genre name (works better without quotes)
      if (params.genres && params.genres.length > 0) {
        // Use first genre as main search
        searchQuery = params.genres[0];
      } else {
        searchQuery = 'pop'; // default
      }
      
      console.log('🔍 Search query:', searchQuery);
      console.log('📊 Parameters:', {
        genres: params.genres,
        moods: params.moods,
        activities: params.activities,
        trackCount: params.trackCount,
      });

      // Use search endpoint
      const searchParams = new URLSearchParams();
      searchParams.append('q', searchQuery);
      searchParams.append('type', 'track');
      searchParams.append('limit', Math.min(50, params.trackCount || 20).toString());
      searchParams.append('market', 'IN'); // User's market

      console.log('🔍 Searching Spotify...');

      const searchResponse = await fetch(
        `http://localhost:3002/search?${searchParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('📥 Search response:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        ok: searchResponse.ok,
      });

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error('❌ Search error response:', error);
        
        try {
          const errorJson = JSON.parse(error);
          console.error('❌ Error details:', errorJson);
          throw new Error(`Failed to search tracks: ${errorJson.error?.message || searchResponse.statusText}`);
        } catch (e) {
          throw new Error(`Failed to search tracks: ${searchResponse.statusText} - ${error}`);
        }
      }

      const searchData = await searchResponse.json();
      
      console.log(`✅ Found ${searchData.tracks?.items?.length || 0} tracks`);

      if (!searchData.tracks || !searchData.tracks.items || searchData.tracks.items.length === 0) {
        console.warn('⚠️ No tracks returned from Spotify');
        throw new Error('No tracks found for your criteria. Try different genres or settings.');
      }

      // Format the tracks
      const tracks: Track[] = searchData.tracks.items.map((track: any) => ({
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

      return tracks;
    } catch (error) {
      console.error('❌ Error generating playlist:', error);
      throw error;
    }
  }

  async createPlaylistOnSpotify(
    credentials: SpotifyCredentials,
    userId: string,
    playlistName: string,
    trackUris: string[],
    description?: string
  ): Promise<string> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      // Create the playlist via proxy
      const createResponse = await fetch(
        `http://localhost:3002/create-playlist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            name: playlistName,
            description: description || 'Created with AI Groove Lab',
            public: false,
            trackUris,
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error('❌ Create playlist error:', error);
        throw new Error(`Failed to create playlist: ${createResponse.statusText}`);
      }

      const result = await createResponse.json();
      console.log('✅ Playlist created successfully:', result.url);
      return result.url;
    } catch (error) {
      console.error('❌ Error creating playlist on Spotify:', error);
      throw error;
    }
  }

  async getCurrentUser(credentials: SpotifyCredentials): Promise<any> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }
}

export const spotifyService = new SpotifyService();
