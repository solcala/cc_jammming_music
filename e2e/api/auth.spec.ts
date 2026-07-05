import { test, expect } from '../fixtures/test';
import { MOCK_ACCESS_TOKEN } from '../fixtures/spotify-mocks';

test.describe('Spotify auth', () => {
  test('sends bearer token on search requests after hash bootstrap', async ({ page }) => {
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    const request = await searchRequest;
    expect(request.headers().authorization).toBe(`Bearer ${MOCK_ACCESS_TOKEN}`);
  });

  test('does not redirect to Spotify accounts during mocked tests', async ({ page }) => {
    let loginRequested = false;

    page.on('request', (request) => {
      if (request.url().includes('accounts.spotify.com')) {
        loginRequested = true;
      }
    });

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('track-item-track-1')).toBeVisible();
    expect(loginRequested).toBe(false);
  });
});
