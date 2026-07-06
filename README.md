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
| `npm run test:e2e` | Run Playwright E2E tests against the CRA dev server |
| `npm run test:e2e:ci` | Run Playwright E2E tests against the production `build/` |
| `npm run test:coverage` | Run Jest unit tests with coverage report |
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

**Local development** (CRA dev server):

```bash
npx playwright install chromium
npm run test:e2e
```

**CI / production build** (serves `build/` at the GitHub Pages subpath):

```bash
npm run build
npm run test:e2e:ci
```

**Docker** (same image as CI — keep in sync with `@playwright/test` in `package.json`):

```bash
npm run build
docker run --rm --ipc=host -v "$PWD":/app -w /app mcr.microsoft.com/playwright:v1.61.1-jammy npm run test:e2e:ci
```

See [`docker/playwright.Dockerfile`](docker/playwright.Dockerfile) for the pinned image reference. When upgrading `@playwright/test`, update both the Docker image tag and the Dockerfile to the matching Playwright release.

### Unit test coverage

```bash
npm run test:coverage
```

Report output is written to `coverage/`.

## Deployment

The project deploys to GitHub Pages via a unified CI workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that runs on every `pull_request` and on `push` to `main`.

### CI pipeline

The workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) runs three jobs on every `pull_request` and `push` to `main`:

| Job | Runner | Steps |
| --- | --- | --- |
| `build_and_unit` | `ubuntu-latest` | `npm ci` → Jest with coverage → production build → upload `build/` and `coverage/` artifacts |
| `e2e` | Playwright Docker (`v1.61.1-jammy`) | Download `build/` → `npm run test:e2e:ci` → upload Playwright report |
| `deploy` | `ubuntu-latest` | Embed report in `build/reports/` → deploy to GitHub Pages (only on successful `main` push) |

E2E tests run against the production `build/` (not the CRA dev server), matching the deployed GitHub Pages subpath.

### CI artifacts and reports

Every workflow run publishes downloadable artifacts and a job summary on the Actions run page:

| Artifact | Job | Contents |
| --- | --- | --- |
| `coverage` | `build_and_unit` | Jest HTML and LCOV report (`coverage/`) |
| `playwright-report-<run_id>` | `e2e` | Playwright HTML report and test traces |
| `build` | `build_and_unit` | Production build passed to E2E and deploy |

- **Jest coverage %** — shown in the `build_and_unit` job summary
- **Playwright report (live)** — embedded at `/reports/` after a successful `main` deploy (see Live URLs below)
- **Failed runs** — download the Playwright report from **Artifacts** on the run page; deploy is skipped until all jobs pass

### Live URLs

| Resource | URL |
| --- | --- |
| App | [https://solcala.github.io/cc_jammming_music/](https://solcala.github.io/cc_jammming_music/) |
| Playwright report (after successful deploy) | [https://solcala.github.io/cc_jammming_music/reports/index.html](https://solcala.github.io/cc_jammming_music/reports/index.html) |

Open `coverage/lcov-report/index.html` locally after `npm run test:coverage` for the Jest HTML report.

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
