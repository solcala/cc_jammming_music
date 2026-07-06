import type {
  SearchResult,
  SpotifyPlaylistResponse,
  SpotifySearchResponse,
  SpotifyUserResponse,
  Track,
} from '../types/spotify';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;
let accessToken: string | undefined;

function mapTrack(track: {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: { name: string };
}): Track {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    uri: track.uri,
  };
}

const Spotify = {
  loadSpotifyLoginPage(): void {
    const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
    window.location.href = accessUrl;
  },

  checkAccessToken(): string | undefined {
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => {
        accessToken = '';
      }, expiresIn * 1000);
      window.history.pushState(
        'Access Token',
        null,
        process.env.PUBLIC_URL || '/',
      );
      return accessToken;
    }
    return undefined;
  },

  getAccessToken(): string | undefined {
    try {
      if (accessToken) {
        return accessToken;
      }
      const accessTokenMatch =
        window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (!(accessTokenMatch && expiresInMatch)) {
        this.loadSpotifyLoginPage();
        return undefined;
      }

      accessToken = this.checkAccessToken();
      return accessToken;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },

  async search(term: string): Promise<SearchResult> {
    try {
      if (!term) {
        return undefined;
      }
      const token = this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        return [];
      }

      if (response.ok) {
        const jsonResponse = (await response.json()) as SpotifySearchResponse;

        if (!jsonResponse.tracks) {
          return [];
        }

        return jsonResponse.tracks.items.map(mapTrack);
      }
      return { error: true };
    } catch (error) {
      console.log(`Request failed - search by  ${term}`);
      console.log(error);
      return { error: true };
    }
  },

  async savePlaylist(
    name: string,
    trackUris: string[],
  ): Promise<number | undefined> {
    try {
      if (!name || !trackUris.length) {
        return undefined;
      }
      const token = this.getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers,
        cache: 'no-cache',
      });

      if (response.ok) {
        const jsonResponse = (await response.json()) as SpotifyUserResponse;
        const userId = jsonResponse.id;
        const response2 = await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists`,
          {
            headers,
            method: 'POST',
            body: JSON.stringify({ name }),
          },
        );

        if (response2.ok) {
          const jsonResponse2 =
            (await response2.json()) as SpotifyPlaylistResponse;
          const playlistId = jsonResponse2.id;
          const response3 = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
            {
              headers,
              method: 'POST',
              body: JSON.stringify({ uris: trackUris }),
            },
          );
          if (response3.ok) {
            return response3.status;
          }
        }
      }
      throw new Error('Request failed!');
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },
};

export default Spotify;
