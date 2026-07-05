import { test as base } from '@playwright/test';
import { bootstrapSpotifyAuth } from './auth';
import { mockSpotifyApi } from './mock-spotify-api';

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await mockSpotifyApi(page);

    if (baseURL) {
      await bootstrapSpotifyAuth(page, baseURL);
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
