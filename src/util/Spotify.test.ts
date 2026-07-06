import type SpotifyType from './Spotify';

let Spotify: typeof SpotifyType;

const seedAccessToken = () => {
  window.location.href =
    'http://localhost/#access_token=mock-access-token&expires_in=3600';
  Spotify.checkAccessToken();
};

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.useFakeTimers();

  global.fetch = mockFetch;

  delete (window as { location?: Location }).location;
  window.location = { href: 'http://localhost/' } as Location;

  window.history.pushState = jest.fn();

  process.env.PUBLIC_URL = '/cc_jammming_music';

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Spotify = require('./Spotify').default;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('checkAccessToken', () => {
  it('parses hash token and clears URL with PUBLIC_URL', () => {
    window.location.href =
      'http://localhost/#access_token=abc123&expires_in=3600';

    const token = Spotify.checkAccessToken();

    expect(token).toBe('abc123');
    expect(window.history.pushState).toHaveBeenCalledWith(
      'Access Token',
      null,
      '/cc_jammming_music',
    );
  });
});

describe('getAccessToken', () => {
  it('returns cached token without re-parsing the URL', () => {
    seedAccessToken();
    window.location.href = 'http://localhost/';

    expect(Spotify.getAccessToken()).toBe('mock-access-token');
    expect(Spotify.getAccessToken()).toBe('mock-access-token');
  });
});

describe('search', () => {
  it('returns early on empty term', async () => {
    const result = await Spotify.search('');

    expect(result).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('maps API response to track objects', async () => {
    seedAccessToken();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        tracks: {
          items: [
            {
              id: 'track-1',
              name: 'Test Song',
              uri: 'spotify:track:track-1',
              artists: [{ name: 'Test Artist' }],
              album: { name: 'Test Album' },
            },
          ],
        },
      }),
    } as Response);

    const tracks = await Spotify.search('test');

    expect(tracks).toEqual([
      {
        id: 'track-1',
        name: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        uri: 'spotify:track:track-1',
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/search?type=track&q=test',
      {
        headers: { Authorization: 'Bearer mock-access-token' },
      },
    );
  });

  it('returns [] on 401', async () => {
    seedAccessToken();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    const tracks = await Spotify.search('test');

    expect(tracks).toEqual([]);
  });

  it('encodes special characters in the search query', async () => {
    seedAccessToken();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ tracks: { items: [] } }),
    } as Response);

    await Spotify.search('a&b c');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/search?type=track&q=a%26b%20c',
      {
        headers: { Authorization: 'Bearer mock-access-token' },
      },
    );
  });

  it('returns an error signal on non-401 HTTP failures', async () => {
    seedAccessToken();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as Response);

    const result = await Spotify.search('test');

    expect(result).toEqual({ error: true });
  });

  it('returns an error signal when fetch rejects', async () => {
    seedAccessToken();
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    const result = await Spotify.search('test');

    expect(result).toEqual({ error: true });
  });
});

describe('savePlaylist', () => {
  it('calls /me, create playlist, then add tracks in order', async () => {
    seedAccessToken();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'playlist-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
      } as Response);

    const status = await Spotify.savePlaylist('My Playlist', [
      'spotify:track:1',
      'spotify:track:2',
    ]);

    expect(status).toBe(201);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.spotify.com/v1/me', {
      headers: { Authorization: 'Bearer mock-access-token' },
      cache: 'no-cache',
    });
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/users/user-1/playlists',
      {
        headers: { Authorization: 'Bearer mock-access-token' },
        method: 'POST',
        body: JSON.stringify({ name: 'My Playlist' }),
      },
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      'https://api.spotify.com/v1/users/user-1/playlists/playlist-1/tracks',
      {
        headers: { Authorization: 'Bearer mock-access-token' },
        method: 'POST',
        body: JSON.stringify({
          uris: ['spotify:track:1', 'spotify:track:2'],
        }),
      },
    );
  });
});
