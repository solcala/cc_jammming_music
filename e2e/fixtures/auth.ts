import type { Page } from '@playwright/test';
import { PKCE_CODE_VERIFIER_STORAGE_KEY } from '../../src/util/pkce';
import {
  MOCK_AUTH_CODE,
  MOCK_PKCE_CODE_VERIFIER,
  mockTokenResponse,
} from './spotify-mocks';

export async function blockSpotifyLoginRedirect(page: Page) {
  await page.route('**/accounts.spotify.com/authorize**', (route) =>
    route.fulfill({ status: 200, body: 'OK' }),
  );
}

export async function mockSpotifyTokenExchange(page: Page) {
  await page.route('**/accounts.spotify.com/api/token**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTokenResponse),
      });
      return;
    }

    await route.continue();
  });
}

export async function bootstrapSpotifyAuth(page: Page, baseURL: string) {
  await blockSpotifyLoginRedirect(page);
  await mockSpotifyTokenExchange(page);

  await page.addInitScript(
    ({ storageKey, verifier }) => {
      sessionStorage.setItem(storageKey, verifier);
    },
    {
      storageKey: PKCE_CODE_VERIFIER_STORAGE_KEY,
      verifier: MOCK_PKCE_CODE_VERIFIER,
    },
  );

  await page.goto(`${baseURL}/?code=${MOCK_AUTH_CODE}`);
  await page.waitForLoadState('domcontentloaded');
}
