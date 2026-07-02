import type { Page } from '@playwright/test';
import { MOCK_ACCESS_TOKEN } from './spotify-mocks';

export async function blockSpotifyLoginRedirect(page: Page) {
  await page.route('**/accounts.spotify.com/**', (route) =>
    route.fulfill({ status: 200, body: 'OK' })
  );
}

export async function bootstrapSpotifyAuth(page: Page, baseURL: string) {
  await blockSpotifyLoginRedirect(page);
  await page.goto(`${baseURL}/#access_token=${MOCK_ACCESS_TOKEN}&expires_in=3600`);
  await page.waitForLoadState('domcontentloaded');
}
