/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  readonly VITE_REDIRECT_URI?: string;
  readonly REACT_APP_SPOTIFY_CLIENT_ID?: string;
  readonly REACT_APP_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
