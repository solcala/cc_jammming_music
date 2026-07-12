import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import { z } from 'zod';
import type SpotifyType from './Spotify';
import { PKCE_CODE_VERIFIER_STORAGE_KEY, SPOTIFY_TOKEN_URL } from './pkce';

let Spotify: typeof SpotifyType;

const MOCK_ACCESS_TOKEN = 'mock-access-token';
const MOCK_CODE_VERIFIER = 'test-pkce-verifier-abcdefghijklmnopqrstuvwxyz123456';

const mockFetch = vi.fn() as MockedFunction<typeof fetch>;

/** Keep unit fixtures aligned with E2E Spotify token contract. */
const spotifyTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
});

const mockTokenResponse = spotifyTokenResponseSchema.parse({
  access_token: MOCK_ACCESS_TOKEN,
  token_type: 'Bearer',
  scope: 'playlist-modify-public',
  expires_in: 3600,
});

function mockSessionStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
    configurable: true,
  });
}

const seedAccessToken = async () => {
  window.sessionStorage.setItem(
    PKCE_CODE_VERIFIER_STORAGE_KEY,
    MOCK_CODE_VERIFIER,
  );
  window.location.href = 'http://127.0.0.1:3000/?code=auth-code-123';
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockTokenResponse,
  } as Response);

  await Spotify.getAccessToken();
  mockFetch.mockClear();
};

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
  }

  if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
  }
});

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();

  global.fetch = mockFetch;
  mockSessionStorage();

  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://127.0.0.1:3000/',
      origin: 'http://127.0.0.1:3000',
      hostname: '127.0.0.1',
      port: '3000',
    },
    writable: true,
    configurable: true,
  });

  window.history.pushState = vi.fn();

  vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
  vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');

  Spotify = (await import('./Spotify')).default;
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('checkAccessToken', () => {
  it('exchanges an authorization code and clears the callback URL', async () => {
    window.sessionStorage.setItem(
      PKCE_CODE_VERIFIER_STORAGE_KEY,
      MOCK_CODE_VERIFIER,
    );
    window.location.href = 'http://127.0.0.1:3000/?code=abc123';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    } as Response);

    const token = await Spotify.checkAccessToken();

    expect(token).toBe(MOCK_ACCESS_TOKEN);
    expect(mockFetch).toHaveBeenCalledWith(
      SPOTIFY_TOKEN_URL,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('code=abc123'),
      }),
    );
    expect(window.history.pushState).toHaveBeenCalledWith(
      '',
      '',
      '/cc_jammming_music/',
    );
    expect(
      window.sessionStorage.getItem(PKCE_CODE_VERIFIER_STORAGE_KEY),
    ).toBeNull();
  });

  it('shares one token exchange when called concurrently', async () => {
    window.sessionStorage.setItem(
      PKCE_CODE_VERIFIER_STORAGE_KEY,
      MOCK_CODE_VERIFIER,
    );
    window.location.href = 'http://127.0.0.1:3000/?code=abc123';

    let resolveToken!: (value: Response) => void;
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveToken = resolve;
        }),
    );

    const first = Spotify.checkAccessToken();
    const second = Spotify.checkAccessToken();

    resolveToken({
      ok: true,
      json: async () => mockTokenResponse,
    } as Response);

    await expect(Promise.all([first, second])).resolves.toEqual([
      MOCK_ACCESS_TOKEN,
      MOCK_ACCESS_TOKEN,
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('getAccessToken', () => {
  it('returns cached token without re-exchanging the authorization code', async () => {
    await seedAccessToken();
    window.location.href = 'http://127.0.0.1:3000/';

    expect(await Spotify.getAccessToken()).toBe(MOCK_ACCESS_TOKEN);
    expect(await Spotify.getAccessToken()).toBe(MOCK_ACCESS_TOKEN);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('loadSpotifyLoginPage', () => {
  it('redirects to Spotify authorize with PKCE parameters', async () => {
    const assignMock = vi.fn();
    Object.defineProperty(window.location, 'href', {
      set: assignMock,
      configurable: true,
    });

    await Spotify.loadSpotifyLoginPage();

    expect(assignMock).toHaveBeenCalledTimes(1);
    const authorizeUrl = assignMock.mock.calls[0][0] as string;
    expect(authorizeUrl).toContain('accounts.spotify.com/authorize');
    expect(authorizeUrl).toContain('response_type=code');
    expect(authorizeUrl).toContain('code_challenge_method=S256');
    expect(
      window.sessionStorage.getItem(PKCE_CODE_VERIFIER_STORAGE_KEY),
    ).toBeTruthy();
  });
});

describe('search', () => {
  it('returns early on empty term', async () => {
    const result = await Spotify.search('');

    expect(result).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('maps API response to track objects', async () => {
    await seedAccessToken();
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
        headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
      },
    );
  });

  it('returns [] on 401', async () => {
    await seedAccessToken();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    const tracks = await Spotify.search('test');

    expect(tracks).toEqual([]);
  });

  it('encodes special characters in the search query', async () => {
    await seedAccessToken();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ tracks: { items: [] } }),
    } as Response);

    await Spotify.search('a&b c');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/search?type=track&q=a%26b%20c',
      {
        headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
      },
    );
  });

  it('returns an error signal on non-401 HTTP failures', async () => {
    await seedAccessToken();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as Response);

    const result = await Spotify.search('test');

    expect(result).toEqual({ error: true });
  });

  it('returns an error signal when fetch rejects', async () => {
    await seedAccessToken();
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    const result = await Spotify.search('test');

    expect(result).toEqual({ error: true });
  });
});

describe('savePlaylist', () => {
  it('calls /me, create playlist, then add tracks in order', async () => {
    await seedAccessToken();
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
      headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
      cache: 'no-cache',
    });
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/users/user-1/playlists',
      {
        headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({ name: 'My Playlist' }),
      },
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      'https://api.spotify.com/v1/users/user-1/playlists/playlist-1/tracks',
      {
        headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          uris: ['spotify:track:1', 'spotify:track:2'],
        }),
      },
    );
  });
});
