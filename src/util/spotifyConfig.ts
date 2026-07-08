const PLACEHOLDER_CLIENT_IDS = new Set([
  '',
  'your_spotify_client_id_here',
]);

export interface SpotifyRuntimeConfig {
  clientId: string;
  redirectUri: string;
}

function readEnv(name: string): string {
  return import.meta.env[name as keyof ImportMetaEnv]?.trim() ?? '';
}

function normalizeRedirectUri(uri: string): string {
  const url = new URL(uri);
  // Only rewrite localhost in local development. CI Playwright serves on
  // localhost and mocks Spotify; rewriting there breaks redirect_uri parity.
  if (import.meta.env.DEV && url.hostname === 'localhost') {
    url.hostname = '127.0.0.1';
  }
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }
  return url.href;
}

function getRedirectUriFromWindow(): string | null {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return null;
  }

  return normalizeRedirectUri(
    new URL(import.meta.env.BASE_URL || '/', window.location.origin).href,
  );
}

function resolveRedirectUri(): string {
  const envRedirectUri = readEnv('VITE_REDIRECT_URI') || readEnv('REACT_APP_REDIRECT_URI');
  const windowRedirectUri = getRedirectUriFromWindow();

  if (!envRedirectUri) {
    return windowRedirectUri ?? '';
  }

  if (!windowRedirectUri || !import.meta.env.DEV) {
    return normalizeRedirectUri(envRedirectUri);
  }

  const envOrigin = new URL(normalizeRedirectUri(envRedirectUri)).origin;
  const windowOrigin = new URL(windowRedirectUri).origin;

  if (envOrigin !== windowOrigin) {
    return windowRedirectUri;
  }

  return normalizeRedirectUri(envRedirectUri);
}

export function getSpotifyRuntimeConfig(): SpotifyRuntimeConfig {
  return {
    clientId:
      readEnv('VITE_SPOTIFY_CLIENT_ID') || readEnv('REACT_APP_SPOTIFY_CLIENT_ID'),
    redirectUri: resolveRedirectUri(),
  };
}

export function getSpotifyConfigError(): string | null {
  const { clientId, redirectUri } = getSpotifyRuntimeConfig();

  if (!clientId || PLACEHOLDER_CLIENT_IDS.has(clientId)) {
    return 'Spotify is not configured. Copy .env.example to .env and set VITE_SPOTIFY_CLIENT_ID (not REACT_APP_*). Restart npm start after saving.';
  }

  if (!redirectUri) {
    return 'Spotify redirect URI is missing. Set VITE_REDIRECT_URI in .env.';
  }

  try {
    new URL(redirectUri);
  } catch {
    return 'VITE_REDIRECT_URI must be a valid URL that matches your Spotify app redirect URI exactly.';
  }

  // Localhost redirect checks are only for interactive local development.
  // CI Playwright builds use localhost + mocked Spotify and must stay unblocked.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const redirectUrl = new URL(redirectUri);
    if (redirectUrl.hostname === 'localhost') {
      return 'Spotify no longer allows localhost redirect URIs. Use http://127.0.0.1:3000/cc_jammming_music/ in .env and the Spotify Dashboard.';
    }

    if (window.location.hostname === 'localhost') {
      const port = window.location.port || '3000';
      return `Open this app at http://127.0.0.1:${port}/cc_jammming_music/ instead of localhost. Spotify OAuth requires 127.0.0.1.`;
    }

    const envRedirectUri = readEnv('VITE_REDIRECT_URI') || readEnv('REACT_APP_REDIRECT_URI');
    const windowRedirectUri = getRedirectUriFromWindow();

    if (envRedirectUri && windowRedirectUri) {
      const envOrigin = new URL(normalizeRedirectUri(envRedirectUri)).origin;
      const windowOrigin = new URL(windowRedirectUri).origin;

      if (envOrigin !== windowOrigin) {
        return `Spotify redirect URI mismatch: the app is running on ${windowRedirectUri} but .env points to ${normalizeRedirectUri(envRedirectUri)}. Add ${windowRedirectUri} to your Spotify app Redirect URIs, update VITE_REDIRECT_URI, and restart npm start.`;
      }
    }
  }

  return null;
}
