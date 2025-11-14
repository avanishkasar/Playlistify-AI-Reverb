// Spotify Service - Browser-compatible version inspired by spotify-web-api-node

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

class SpotifyServiceNew {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private async ensureAccessToken(credentials: SpotifyCredentials): Promise<string> {
    // Only refresh if token is expired or about to expire (within 60 seconds)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      console.log('✅ Using cached access token');
      return this.accessToken;
    }

    try {
      console.log('🔑 Refreshing Spotify access token...');
      
      const authHeader = 'Basic ' + btoa(`${credentials.clientId}:${credentials.clientSecret}`);
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${credentials.refreshToken}`,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token refresh failed: ${error}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      const expiresIn = data.expires_in || 3600;
      this.tokenExpiresAt = Date.now() + expiresIn * 1000;

      console.log('✅ Access token refreshed', { expiresIn });
      return this.accessToken;
    } catch (err: any) {
      console.error('❌ Failed to refresh access token:', err);
      throw new Error(`Spotify authentication failed: ${err?.message || 'Unknown error'}`);
    }
  }

  async generatePlaylist(
    credentials: SpotifyCredentials,
    params: PlaylistParams
  ): Promise<Track[]> {
    try {
      const accessToken = await this.ensureAccessToken(credentials);

      // Build simple search query
      let searchQuery = '';
      if (params.genres && params.genres.length > 0) {
        searchQuery = params.genres[0]; // Use first genre
      } else {
        searchQuery = 'pop';
      }

      console.log('🔍 Searching for:', searchQuery);

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${Math.min(params.trackCount || 20, 50)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      const items = data.tracks?.items || [];

      if (items.length === 0) {
        throw new Error('No tracks found for your criteria. Try different genres or settings.');
      }

      const tracks: Track[] = items.map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        album: t.album.name,
        albumArt: t.album.images[0]?.url || '',
        duration: t.duration_ms,
        uri: t.uri,
        previewUrl: t.preview_url,
        spotifyUrl: t.external_urls.spotify,
      }));

      console.log('✅ Found', tracks.length, 'tracks');
      return tracks;
    } catch (error: any) {
      console.error('❌ Error generating playlist:', error);
      throw error;
    }
  }

  async createPlaylistOnSpotify(
    credentials: SpotifyCredentials,
    playlistName: string,
    trackUris: string[],
    description?: string
  ): Promise<string> {
    try {
      const accessToken = await this.ensureAccessToken(credentials);

      console.log('🎵 Creating playlist:', playlistName);

      // Get current user ID first
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user profile');
      }

      const user = await userResponse.json();
      console.log('✅ Got user:', user.display_name);

      // Create the playlist
      const createResponse = await fetch(
        `https://api.spotify.com/v1/users/${user.id}/playlists`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: playlistName,
            description: description || `Created with AI Groove Lab on ${new Date().toLocaleDateString()}`,
            public: false,
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Failed to create playlist: ${error}`);
      }

      const playlist = await createResponse.json();
      console.log('✅ Playlist created:', playlist.id);

      // Add tracks if provided
      if (trackUris && trackUris.length > 0) {
        // Spotify allows up to 100 tracks per request
        const chunks: string[][] = [];
        for (let i = 0; i < trackUris.length; i += 100) {
          chunks.push(trackUris.slice(i, i + 100));
        }

        for (const chunk of chunks) {
          const addResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uris: chunk,
              }),
            }
          );

          if (!addResponse.ok) {
            const error = await addResponse.text();
            throw new Error(`Failed to add tracks: ${error}`);
          }
        }

        console.log('✅ Added', trackUris.length, 'tracks to playlist');
      }

      return playlist.external_urls.spotify;
    } catch (error: any) {
      console.error('❌ Error creating playlist:', error);
      throw new Error(`Create playlist failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async getCurrentUser(credentials: SpotifyCredentials): Promise<any> {
    try {
      const accessToken = await this.ensureAccessToken(credentials);
      
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }
}

export const spotifyServiceNew = new SpotifyServiceNew();
