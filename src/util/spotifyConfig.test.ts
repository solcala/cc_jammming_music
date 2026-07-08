import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSpotifyConfigError, getSpotifyRuntimeConfig } from './spotifyConfig';

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://127.0.0.1:3000/cc_jammming_music/',
      origin: 'http://127.0.0.1:3000',
      hostname: '127.0.0.1',
      port: '3000',
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSpotifyConfigError', () => {
  it('returns null when Spotify env vars are configured', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');

    expect(getSpotifyConfigError()).toBeNull();
  });

  it('accepts legacy REACT_APP_* env var names', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '');
    vi.stubEnv('VITE_REDIRECT_URI', '');
    vi.stubEnv('REACT_APP_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv(
      'REACT_APP_REDIRECT_URI',
      'http://127.0.0.1:3000/cc_jammming_music/',
    );

    expect(getSpotifyConfigError()).toBeNull();
    expect(getSpotifyRuntimeConfig().clientId).toBe(
      '0123456789abcdef0123456789abcdef',
    );
  });

  it('rejects placeholder client IDs', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'your_spotify_client_id_here');
    vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');

    expect(getSpotifyConfigError()).toMatch(/not configured/i);
  });

  it('rejects the CI fallback client ID', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');

    expect(getSpotifyConfigError()).toMatch(/not configured/i);
  });

  it('requires a redirect URI', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('VITE_REDIRECT_URI', '');
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://127.0.0.1:3000/',
        origin: undefined,
        hostname: '127.0.0.1',
        port: '3000',
      },
      writable: true,
      configurable: true,
    });

    expect(getSpotifyConfigError()).toMatch(/redirect uri/i);
  });

  it('normalizes redirect URIs with a trailing slash and replaces localhost', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('VITE_REDIRECT_URI', 'http://localhost:3000/cc_jammming_music');

    expect(getSpotifyRuntimeConfig().redirectUri).toBe(
      'http://127.0.0.1:3000/cc_jammming_music/',
    );
  });

  it('warns when the app is opened on localhost', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/cc_jammming_music/',
        origin: 'http://localhost:3000',
        hostname: 'localhost',
        port: '3000',
      },
      writable: true,
      configurable: true,
    });

    expect(getSpotifyConfigError()).toMatch(/127\.0\.0\.1/i);
  });
});
