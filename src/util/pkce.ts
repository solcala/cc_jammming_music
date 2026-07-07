/** Session storage key for the PKCE code verifier between authorize redirect and token exchange. */
export const PKCE_CODE_VERIFIER_STORAGE_KEY = 'spotify_pkce_code_verifier';

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

const DEFAULT_CODE_VERIFIER_LENGTH = 64;
const MIN_CODE_VERIFIER_LENGTH = 43;
const MAX_CODE_VERIFIER_LENGTH = 128;

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

function base64UrlEncode(buffer: Uint8Array): string {
  const binary = Array.from(buffer, (byte) => String.fromCharCode(byte)).join(
    '',
  );
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
