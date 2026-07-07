import { test, expect } from '../fixtures/test';
import { MOCK_ACCESS_TOKEN, MOCK_AUTH_CODE } from '../fixtures/spotify-mocks';

test.describe('Spotify auth', () => {
  test('sends bearer token on search requests after PKCE callback bootstrap', async ({
    page,
  }) => {
    const tokenRequest = page.waitForRequest('**/accounts.spotify.com/api/token**');
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    const tokenExchange = await tokenRequest;
    expect(tokenExchange.method()).toBe('POST');
    expect(tokenExchange.postData()).toContain('grant_type=authorization_code');
    expect(tokenExchange.postData()).toContain(`code=${MOCK_AUTH_CODE}`);

    const request = await searchRequest;
    expect(request.headers().authorization).toBe(`Bearer ${MOCK_ACCESS_TOKEN}`);
  });

  test('does not redirect to Spotify accounts during mocked tests', async ({ page }) => {
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
