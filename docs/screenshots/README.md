# Screenshots

Captured from the Phase 7 dark-mock UI with mocked Spotify search/playlist state.

| File | Viewport |
| --- | --- |
| [desktop/app.png](desktop/app.png) | Desktop Chrome (`1280×720`) |
| [mobile/app.png](mobile/app.png) | Pixel 5 Playwright device |

Regenerate locally (requires a running app/serve at `PLAYWRIGHT_BASE_URL`, Chromium installed):

```bash
# temporary one-off specs or Playwright codegen/screenshot commands as needed
npm run build:e2e
node scripts/prepare-playwright-serve.mjs
npx serve .playwright-serve -l 3457
```

These PNGs are documentation assets only and are not asserted by CI.
