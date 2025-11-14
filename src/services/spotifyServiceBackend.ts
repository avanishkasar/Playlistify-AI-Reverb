// Spotify Service using Backend API

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
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

class SpotifyServiceBackend {
  /**
   * Generate playlist by searching for tracks
   */
  async generatePlaylist(
    credentials: SpotifyCredentials,
    genres: string[],
    moods: string[],
    activities: string[],
    limit: number = 20
  ): Promise<Track[]> {
    try {
      // Build search query from genres, moods, and activities
      const searchTerms = [...genres, ...moods, ...activities].filter(Boolean);
      const query = searchTerms.join(' ');

      console.log('🔍 Searching with query:', query);

      const response = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          credentials,
        }),
      });

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      // Map backend response to frontend Track format
      const tracks: Track[] = result.data.tracks.map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        album: t.album.name,
        albumArt: t.album.images?.[0]?.url || '',
        duration: t.duration_ms,
        uri: t.uri,
        previewUrl: t.preview_url || null,
        spotifyUrl: t.external_urls.spotify,
      }));

      console.log(`✅ Found ${tracks.length} tracks`);
      return tracks;
    } catch (error: any) {
      console.error('❌ Error generating playlist:', error);
      throw new Error(`Generate playlist failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create playlist on Spotify
   */
  async createPlaylistOnSpotify(
    credentials: SpotifyCredentials,
    playlistName: string,
    trackUris: string[],
    description?: string
  ): Promise<string> {
    try {
      console.log('🎵 Creating playlist on Spotify...');

      const response = await fetch(`${BACKEND_URL}/api/create-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: description || `Created with Playlistify on ${new Date().toLocaleDateString()}`,
          trackUris,
          isPublic: false,
          credentials,
        }),
      });

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      const playlistUrl = result.data.playlist.external_urls.spotify;
      console.log('✅ Playlist created:', playlistUrl);

      return playlistUrl;
    } catch (error: any) {
      console.error('❌ Error creating playlist:', error);
      throw new Error(`Create playlist failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if backend is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export const spotifyServiceBackend = new SpotifyServiceBackend();
