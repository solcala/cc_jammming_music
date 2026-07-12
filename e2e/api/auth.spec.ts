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
import {
  trackUrlHits,
  waitForSearchRequest,
  waitForTokenExchangeRequest,
} from '../fixtures/request-tracking';
import { SearchPage } from '../pages';
import { parseTokenExchangeForm } from '../schemas/validate';
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

    const tokenRequest = waitForTokenExchangeRequest(page);
    await page.goto(`${baseURL}/?code=${MOCK_AUTH_CODE}`);

    const tokenExchange = await tokenRequest;
    expect(tokenExchange.method()).toBe('POST');
    expect(parseTokenExchangeForm(tokenExchange.postData())).toMatchObject({
      grant_type: 'authorization_code',
      code: MOCK_AUTH_CODE,
    });

    await context.close();
  });

  test('sends bearer token on search requests after PKCE callback bootstrap', async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const searchRequest = waitForSearchRequest(page);

    await search.fillAndSearch('test song');

    const request = await searchRequest;
    expect(request.headers().authorization).toBe(`Bearer ${MOCK_ACCESS_TOKEN}`);
  });

  test('does not redirect to Spotify accounts during mocked tests', async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const authorizeHits = trackUrlHits(
      page,
      'accounts.spotify.com/authorize',
    );

    await search.fillAndSearch('test song');

    await expect(search.trackItem('track-1')).toBeVisible();
    expect(authorizeHits.count()).toBe(0);
  });
});
