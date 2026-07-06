# Official Playwright image — keep version in sync with @playwright/test in package.json
FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

# Dependencies and source are copied/mounted at runtime in CI.
# Browsers are preinstalled; do not run `npx playwright install --with-deps`.

CMD ["npm", "run", "test:e2e:ci"]
