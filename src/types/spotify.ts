export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

export interface SearchError {
  error: true;
}

export type SearchResult = Track[] | SearchError | undefined;

export interface SpotifyArtist {
  name: string;
}

export interface SpotifyAlbum {
  name: string;
}

export interface SpotifyApiTrack {
  id: string;
  name: string;
  uri: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}

export interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyApiTrack[];
  };
}

export interface SpotifyUserResponse {
  id: string;
}

export interface SpotifyPlaylistResponse {
  id: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}
