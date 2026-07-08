import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import { beforeAll, beforeEach, vi, type MockedFunction } from 'vitest';
import type { SpotifyTokenResponse } from '../types/spotify';
import {
  PKCE_CODE_VERIFIER_STORAGE_KEY,
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_PKCE_SCOPE,
  SPOTIFY_TOKEN_URL,
  buildAuthorizeUrl,
  clearCodeVerifier,
  exchangeAuthorizationCode,
  generateCodeChallenge,
  generateCodeVerifier,
  parseAuthorizationCode,
  readCodeVerifier,
  saveCodeVerifier,
} from './pkce';

const mockFetch = vi.fn() as MockedFunction<typeof fetch>;

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

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;

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
});

/** SHA-256 S256 challenge for the RFC 7636 Appendix B verifier (verified via Web Crypto). */
const RFC7636_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC7636_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

const pkceConfig = {
  clientId: 'test-client-id',
  redirectUri: 'http://localhost:3000',
};

describe('PKCE_CODE_VERIFIER_STORAGE_KEY', () => {
  it('is a stable session storage key name', () => {
    expect(PKCE_CODE_VERIFIER_STORAGE_KEY).toBe('spotify_pkce_code_verifier');
  });
});

describe('generateCodeVerifier', () => {
  it('returns a verifier within RFC 7636 length bounds by default', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBe(64);
  });

  it('uses only unreserved PKCE characters', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it('generates distinct verifiers on successive calls', () => {
    const first = generateCodeVerifier();
    const second = generateCodeVerifier();
    expect(first).not.toBe(second);
  });

  it('rejects lengths outside the RFC 7636 range', () => {
    expect(() => generateCodeVerifier(42)).toThrow(RangeError);
    expect(() => generateCodeVerifier(129)).toThrow(RangeError);
  });
});

describe('generateCodeChallenge', () => {
  it('matches the RFC 7636 S256 example', async () => {
    const challenge = await generateCodeChallenge(RFC7636_VERIFIER);
    expect(challenge).toBe(RFC7636_CHALLENGE);
  });

  it('is deterministic for the same verifier', async () => {
    const verifier = generateCodeVerifier();
    const first = await generateCodeChallenge(verifier);
    const second = await generateCodeChallenge(verifier);
    expect(first).toBe(second);
  });

  it('produces a base64url string without padding', async () => {
    const challenge = await generateCodeChallenge(generateCodeVerifier());
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(challenge.endsWith('=')).toBe(false);
  });
});

describe('buildAuthorizeUrl', () => {
  it('builds a Spotify authorize URL with PKCE parameters', () => {
    const url = buildAuthorizeUrl({
      ...pkceConfig,
      codeChallenge: RFC7636_CHALLENGE,
    });

    expect(url.startsWith(`${SPOTIFY_AUTHORIZE_URL}?`)).toBe(true);

    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('client_id')).toBe(pkceConfig.clientId);
    expect(params.get('response_type')).toBe('code');
    expect(params.get('redirect_uri')).toBe(pkceConfig.redirectUri);
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('code_challenge')).toBe(RFC7636_CHALLENGE);
    expect(params.get('scope')).toBe(SPOTIFY_PKCE_SCOPE);
    expect(params.get('state')).toBeNull();
  });

  it('includes state when provided', () => {
    const url = buildAuthorizeUrl({
      ...pkceConfig,
      codeChallenge: RFC7636_CHALLENGE,
      state: 'csrf-token',
    });

    expect(new URLSearchParams(url.split('?')[1]).get('state')).toBe(
      'csrf-token',
    );
  });
});

describe('parseAuthorizationCode', () => {
  it('reads the code from the callback query string', () => {
    expect(
      parseAuthorizationCode(
        'http://localhost:3000/?code=auth-code-123&state=csrf',
      ),
    ).toBe('auth-code-123');
  });

  it('returns null when no code is present', () => {
    expect(parseAuthorizationCode('http://localhost:3000/')).toBeNull();
    expect(
      parseAuthorizationCode('http://localhost:3000/?error=access_denied'),
    ).toBeNull();
  });
});

describe('code verifier session storage', () => {
  it('stores, reads, and clears the verifier', () => {
    saveCodeVerifier('verifier-123');
    expect(readCodeVerifier()).toBe('verifier-123');

    clearCodeVerifier();
    expect(readCodeVerifier()).toBeNull();
  });
});

describe('exchangeAuthorizationCode', () => {
  const tokenResponse: SpotifyTokenResponse = {
    access_token: 'access-token',
    token_type: 'Bearer',
    scope: SPOTIFY_PKCE_SCOPE,
    expires_in: 3600,
    refresh_token: 'refresh-token',
  };

  it('posts the authorization code and verifier to the Spotify token endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => tokenResponse,
    } as Response);

    const result = await exchangeAuthorizationCode(
      {
        ...pkceConfig,
        code: 'auth-code-123',
        codeVerifier: RFC7636_VERIFIER,
      },
      mockFetch,
    );

    expect(result).toEqual(tokenResponse);
    expect(mockFetch).toHaveBeenCalledWith(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'auth-code-123',
        redirect_uri: pkceConfig.redirectUri,
        client_id: pkceConfig.clientId,
        code_verifier: RFC7636_VERIFIER,
      }).toString(),
    });
  });

  it('throws when Spotify returns a non-success response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          error: 'invalid_client',
          error_description: 'Invalid client',
        }),
    } as Response);

    await expect(
      exchangeAuthorizationCode(
        {
          ...pkceConfig,
          code: 'bad-code',
          codeVerifier: RFC7636_VERIFIER,
        },
        mockFetch,
      ),
    ).rejects.toThrow('Invalid client');
  });
});
