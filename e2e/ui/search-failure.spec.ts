import { test, expect } from '../fixtures/test';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';

test.describe('Search failure', () => {
  test('shows an error message when Spotify search fails', async ({ page }) => {
    await mockSpotifyApi(page, { searchStatus: 500 });

    await page.getByTestId('search-by-input').fill('test');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('search-api-error')).toHaveText(
      'Unable to search right now. Please try again.'
    );
    await expect(page.getByTestId('track-name-track-1')).not.toBeVisible();
  });
});
