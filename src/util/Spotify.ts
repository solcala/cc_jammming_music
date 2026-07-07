import type {
  SearchResult,
  SpotifyPlaylistResponse,
  SpotifySearchResponse,
  SpotifyUserResponse,
  Track,
} from '../types/spotify';
import {
  buildAuthorizeUrl,
  clearCodeVerifier,
  exchangeAuthorizationCode,
  generateCodeChallenge,
  generateCodeVerifier,
  parseAuthorizationCode,
  readCodeVerifier,
  saveCodeVerifier,
} from './pkce';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
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

function clearAuthorizationUrl(): void {
  window.history.pushState('', '', import.meta.env.BASE_URL || '/');
}

const Spotify = {
  async loadSpotifyLoginPage(): Promise<void> {
    if (!clientId || !redirectUri) {
      return;
    }

    const verifier = generateCodeVerifier();
    saveCodeVerifier(verifier);
    const challenge = await generateCodeChallenge(verifier);
    window.location.href = buildAuthorizeUrl({
      clientId,
      redirectUri,
      codeChallenge: challenge,
    });
  },

  async checkAccessToken(): Promise<string | undefined> {
    const code = parseAuthorizationCode(window.location.href);
    if (!code || !clientId || !redirectUri) {
      return undefined;
    }

    const verifier = readCodeVerifier();
    if (!verifier) {
      return undefined;
    }

    try {
      const tokenResponse = await exchangeAuthorizationCode({
        clientId,
        redirectUri,
        code,
        codeVerifier: verifier,
      });

      accessToken = tokenResponse.access_token;
      window.setTimeout(() => {
        accessToken = '';
      }, tokenResponse.expires_in * 1000);
      clearCodeVerifier();
      clearAuthorizationUrl();
      return accessToken;
    } catch (error) {
      console.log(error);
      clearCodeVerifier();
      return undefined;
    }
  },

  async getAccessToken(): Promise<string | undefined> {
    try {
      if (accessToken) {
        return accessToken;
      }

      if (parseAuthorizationCode(window.location.href)) {
        return this.checkAccessToken();
      }

      await this.loadSpotifyLoginPage();
      return undefined;
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
      const token = await this.getAccessToken();
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
      const token = await this.getAccessToken();
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
