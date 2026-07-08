import type { SpotifyTokenResponse } from '../types/spotify';

/** Session storage key for the PKCE code verifier between authorize redirect and token exchange. */
export const PKCE_CODE_VERIFIER_STORAGE_KEY = 'spotify_pkce_code_verifier';

export const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_PKCE_SCOPE = 'playlist-modify-public';

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

const DEFAULT_CODE_VERIFIER_LENGTH = 64;
const MIN_CODE_VERIFIER_LENGTH = 43;
const MAX_CODE_VERIFIER_LENGTH = 128;

export interface SpotifyPkceConfig {
  clientId: string;
  redirectUri: string;
}

export interface BuildAuthorizeUrlParams extends SpotifyPkceConfig {
  codeChallenge: string;
  state?: string;
}

export interface ExchangeAuthorizationCodeParams extends SpotifyPkceConfig {
  code: string;
  codeVerifier: string;
}

export function generateCodeVerifier(
  length = DEFAULT_CODE_VERIFIER_LENGTH,
): string {
  if (length < MIN_CODE_VERIFIER_LENGTH || length > MAX_CODE_VERIFIER_LENGTH) {
    throw new RangeError(
      `PKCE code verifier length must be between ${MIN_CODE_VERIFIER_LENGTH} and ${MAX_CODE_VERIFIER_LENGTH}`,
    );
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) => PKCE_CHARSET[byte % PKCE_CHARSET.length],
  ).join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

export function buildAuthorizeUrl({
  clientId,
  redirectUri,
  codeChallenge,
  state,
}: BuildAuthorizeUrlParams): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SPOTIFY_PKCE_SCOPE,
  });

  if (state) {
    params.set('state', state);
  }

  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}

export function parseAuthorizationCode(url: string): string | null {
  const query = url.includes('?')
    ? url.slice(url.indexOf('?') + 1).split('#')[0]
    : '';
  return new URLSearchParams(query).get('code');
}

export function saveCodeVerifier(verifier: string): void {
  sessionStorage.setItem(PKCE_CODE_VERIFIER_STORAGE_KEY, verifier);
}

export function readCodeVerifier(): string | null {
  return sessionStorage.getItem(PKCE_CODE_VERIFIER_STORAGE_KEY);
}

export function clearCodeVerifier(): void {
  sessionStorage.removeItem(PKCE_CODE_VERIFIER_STORAGE_KEY);
}

export async function exchangeAuthorizationCode(
  params: ExchangeAuthorizationCodeParams,
  fetchFn: typeof fetch = fetch,
): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: params.codeVerifier,
  });

  const response = await fetchFn(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Spotify sign-in failed (${response.status})`;

    try {
      const json = JSON.parse(errorBody) as {
        error?: string;
        error_description?: string;
      };
      message = json.error_description || json.error || message;
    } catch {
      if (errorBody.trim()) {
        message = errorBody.trim();
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

function base64UrlEncode(buffer: Uint8Array): string {
  const binary = Array.from(buffer, (byte) => String.fromCharCode(byte)).join(
    '',
  );
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
