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

The project deploys to GitHub Pages via a unified CI workflow (`.github/workflows/deploy.yml`) that builds, runs all tests, and deploys only when tests pass on the `main` branch.

When deploying to GitHub Pages, set `REACT_APP_REDIRECT_URI` to your published app URL (for example `https://solcala.github.io/cc_jammming_music/`) and register that exact URI in your Spotify Developer Dashboard.

Playwright reports from CI are embedded at `/reports/index.html` on the deployed site when tests run.

## Spotify authentication note

This app uses Spotify's implicit grant flow, which Spotify has deprecated for new applications. It remains sufficient for this learning project, but a future migration to Authorization Code with PKCE is recommended for production use.

## Tech Stack

- React 18 (Create React App)
- Spotify Web API (Implicit Grant Flow)
- Jest + React Testing Library (unit tests)
- Playwright (end-to-end tests)
- GitHub Actions (CI/CD)
- GitHub Pages (hosting)
