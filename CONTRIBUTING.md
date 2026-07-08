# Contributing

Thanks for helping improve Jammming. This guide covers the local workflow used on this repo.

## Requirements

- **Node.js 20** (CI uses Node 20; Node 18+ usually works, but prefer 20 for parity)
- npm (ships with Node)
- For E2E browsers: `npx playwright install chromium`

## Getting started

```bash
git clone https://github.com/solcala/cc_jammming_music.git
cd cc_jammming_music
npm install
cp .env.example .env
```

Fill in `VITE_SPOTIFY_CLIENT_ID` and `VITE_REDIRECT_URI` for live Spotify auth. E2E tests mock Spotify and do not need real credentials.

Local redirect URI (must match Spotify Dashboard and use `127.0.0.1`, not `localhost`):

```text
http://127.0.0.1:3000/cc_jammming_music/
```

Start the app:

```bash
npm start
```

Open [http://127.0.0.1:3000/cc_jammming_music/](http://127.0.0.1:3000/cc_jammming_music/).

## Branch and PR workflow

1. Branch from up-to-date `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b feat/short-description
   ```

2. Prefer **small, reviewable batches** over large mixed PRs (docs, tooling, and UI changes are easier to land separately).

3. Before opening a PR, run:

   ```bash
   npm run lint
   npm run typecheck
   npm run test:all
   ```

   `npm run test:all` runs Vitest coverage, an E2E production build, and Playwright against `dist/`.

4. Open a PR into `main` and fill out the [pull request template](.github/pull_request_template.md).

5. Wait for GitHub Actions (`Build, Test, and Deploy`) to go green before merging.

## Scripts cheat sheet

| Script | Purpose |
| --- | --- |
| `npm start` | Vite dev server |
| `npm run lint` | ESLint (`src/` + `e2e/`) |
| `npm run typecheck` | TypeScript (`src/`, config, `e2e/`) |
| `npm run test:coverage` | Vitest + coverage |
| `npm run test:ui` | Playwright desktop UI project |
| `npm run test:ui:mobile` | Playwright mobile smoke (`Pixel 5`) |
| `npm run test:api` | Playwright API project |
| `npm run test:e2e:ci` | Full Playwright against production `dist/` |
| `npm run test:all` | Coverage + E2E CI path (full local gate) |

## Coding notes

- Preserve existing `data-testid` and accessibility attributes used by Playwright.
- E2E specs stay declarative: put branching/helpers in `e2e/fixtures/`, not inside tests.
- Do not commit secrets (`.env`, webhook URLs, client secrets). `.env` is gitignored.

## Dependabot

Dependabot opens weekly PRs for npm and GitHub Actions (see [`.github/dependabot.yml`](.github/dependabot.yml)).

**Merge tips:**

- Prefer small, focused Dependabot PRs.
- Grouped `development-dependencies` excludes toolchain packages (`eslint`, `typescript`, etc.) so those can be upgraded deliberately.
- Avoid mega-bumps that combine major ESLint + TypeScript + Vite upgrades in one PR.
- After any dependency bump, run `npm run test:all` and confirm CI is green.

## Reporting issues

Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser / Node version when relevant
- Whether the issue is local, CI, or the [live GitHub Pages app](https://solcala.github.io/cc_jammming_music/)

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
