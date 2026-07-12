import {
  parseSpotifyPlaylistResponse,
  parseSpotifySearchResponse,
  parseSpotifyTokenResponse,
  parseSpotifyUserResponse,
  parseTracks,
} from '../schemas/validate';

export const MOCK_ACCESS_TOKEN = 'mock-access-token';
export const MOCK_AUTH_CODE = 'mock-auth-code';
export const MOCK_PKCE_CODE_VERIFIER =
  'e2e-pkce-verifier-abcdefghijklmnopqrstuvwxyz123456';

export const mockTokenResponse = parseSpotifyTokenResponse({
  access_token: MOCK_ACCESS_TOKEN,
  token_type: 'Bearer',
  scope: 'playlist-modify-public',
  expires_in: 3600,
});

export const mockUser = parseSpotifyUserResponse({
  id: 'test-user-id',
  display_name: 'Test User',
});

const mockTracksRaw = [
  {
    id: 'track-1',
    name: 'Test Song One',
    uri: 'spotify:track:track-1',
    artists: [{ name: 'Test Artist' }],
    album: { name: 'Test Album' },
  },
  {
    id: 'track-2',
    name: 'Test Song Two',
    uri: 'spotify:track:track-2',
    artists: [{ name: 'Another Artist' }],
    album: { name: 'Another Album' },
  },
];

export const mockSearchResponse = parseSpotifySearchResponse({
  tracks: {
    items: mockTracksRaw,
  },
});

export const mockTracks = mockSearchResponse.tracks!.items;

export const mockPlaylist = parseSpotifyPlaylistResponse({
  id: 'playlist-123',
  name: 'Test Playlist',
  uri: 'spotify:playlist:playlist-123',
});

export const mappedMockTracks = parseTracks(
  mockTracks.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    uri: track.uri,
  })),
);
