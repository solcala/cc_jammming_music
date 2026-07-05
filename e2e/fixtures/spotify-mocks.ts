export const MOCK_ACCESS_TOKEN = 'mock-access-token';

export const mockUser = {
  id: 'test-user-id',
  display_name: 'Test User',
};

export const mockTracks = [
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

export const mockSearchResponse = {
  tracks: {
    items: mockTracks,
  },
};

export const mockPlaylist = {
  id: 'playlist-123',
  name: 'Test Playlist',
  uri: 'spotify:playlist:playlist-123',
};

export const mappedMockTracks = mockTracks.map((track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists[0].name,
  album: track.album.name,
  uri: track.uri,
}));
