import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/cc_jammming_music/',
    server: {
      port: 3000,
    },
    // Spike shim: keep CRA env names until batch 5.2 migrates to VITE_.
    define: {
      'process.env.REACT_APP_SPOTIFY_CLIENT_ID': JSON.stringify(
        env.REACT_APP_SPOTIFY_CLIENT_ID ?? '',
      ),
      'process.env.REACT_APP_REDIRECT_URI': JSON.stringify(
        env.REACT_APP_REDIRECT_URI ?? '',
      ),
      'process.env.PUBLIC_URL': JSON.stringify('/cc_jammming_music'),
      'process.env.NODE_ENV': JSON.stringify(
        mode === 'production' ? 'production' : 'development',
      ),
    },
  };
});
