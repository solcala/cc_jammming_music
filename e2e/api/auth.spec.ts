import { test, expect } from '../fixtures/test';
import {
  MOCK_ACCESS_TOKEN,
  MOCK_AUTH_CODE,
  MOCK_PKCE_CODE_VERIFIER,
} from '../fixtures/spotify-mocks';
import {
  blockSpotifyLoginRedirect,
  mockSpotifyTokenExchange,
} from '../fixtures/auth';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { PKCE_CODE_VERIFIER_STORAGE_KEY } from '../../src/util/pkce';

test.describe('Spotify auth', () => {
  test('exchanges the PKCE authorization code on callback load', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await mockSpotifyApi(page);
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

    const tokenRequest = page.waitForRequest(
      '**/accounts.spotify.com/api/token**',
    );
    await page.goto(`${baseURL}/?code=${MOCK_AUTH_CODE}`);

    const tokenExchange = await tokenRequest;
    expect(tokenExchange.method()).toBe('POST');
    expect(tokenExchange.postData()).toContain('grant_type=authorization_code');
    expect(tokenExchange.postData()).toContain(`code=${MOCK_AUTH_CODE}`);

    await context.close();
  });

  test('sends bearer token on search requests after PKCE callback bootstrap', async ({
    page,
  }) => {
    // Bootstrap already exchanged the auth code during fixture setup.
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    const request = await searchRequest;
    expect(request.headers().authorization).toBe(`Bearer ${MOCK_ACCESS_TOKEN}`);
  });

  test('does not redirect to Spotify accounts during mocked tests', async ({
    page,
  }) => {
    let authorizeRequested = false;

    page.on('request', (request) => {
      if (request.url().includes('accounts.spotify.com/authorize')) {
        authorizeRequested = true;
      }
    });

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('track-item-track-1')).toBeVisible();
    expect(authorizeRequested).toBe(false);
  });
});
