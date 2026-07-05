# Jammming

A React web application that lets you search the Spotify catalog, build custom playlists, and save them directly to your Spotify account.

## Features

- Search tracks by title using the Spotify Web API
- Preview track name, artist, and album
- Add and remove tracks from a playlist
- Name your playlist and save it to Spotify

## Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) application with a registered redirect URI

## Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/solcala/cc_jammming_music.git
cd cc_jammming_music
npm install
```

2.Copy the environment template and fill in your Spotify credentials:

```bash
cp .env.example .env
```

Edit `.env` with your `REACT_APP_SPOTIFY_CLIENT_ID` and `REACT_APP_REDIRECT_URI`.

3.Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the development server |
| `npm test` | Run Jest unit tests in watch mode |
| `npm run build` | Build for production to `build/` |
| `npm run test:e2e` | Run all Playwright end-to-end tests |
| `npm run test:api` | Run Playwright API tests only |
| `npm run test:ui` | Run Playwright UI tests only |
| `npm run test:e2e:ui` | Open the Playwright test UI |

## Testing

### Unit Tests (Jest)

```bash
npm test
```

### End-to-End Tests (Playwright)

Playwright tests mock all Spotify API calls, so no credentials are required.

```bash
npx playwright install chromium
npm run test:e2e
```

## Deployment

The project deploys to GitHub Pages via a unified CI workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that runs on every `pull_request` and on `push` to `main`.

### CI pipeline

1. Install dependencies (`npm ci`)
2. Run Jest unit tests
3. Build the React app for production
4. Run Playwright end-to-end tests
5. Embed the Playwright HTML report in `build/reports/`
6. Upload the Playwright report as a GitHub Actions artifact (every run)
7. Deploy to GitHub Pages only when all tests pass on a `main` branch push

### Live URLs

| Resource | URL |
| --- | --- |
| App | https://solcala.github.io/cc_jammming_music/ |
| Playwright report (after successful deploy) | https://solcala.github.io/cc_jammming_music/reports/index.html |

On failed runs, the Playwright report is still available from the **Artifacts** section of the GitHub Actions run page.

### Spotify configuration for production

Set `REACT_APP_REDIRECT_URI` to `https://solcala.github.io/cc_jammming_music/` and register that exact URI in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

For live Spotify login on the deployed app, add a GitHub repository secret named `REACT_APP_SPOTIFY_CLIENT_ID` with your Spotify client ID. Without it, the app still renders; only Spotify authentication will not work in production.

## Spotify authentication note

This app uses Spotify's implicit grant flow, which Spotify has deprecated for new applications. It remains sufficient for this learning project, but a future migration to Authorization Code with PKCE is recommended for production use.

## Tech Stack

- React 18 (Create React App)
- Spotify Web API (Implicit Grant Flow)
- Jest + React Testing Library (unit tests)
- Playwright (end-to-end tests)
- GitHub Actions (CI/CD)
- GitHub Pages (hosting)
