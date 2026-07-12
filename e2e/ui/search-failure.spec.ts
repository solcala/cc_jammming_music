import { test, expect } from '../fixtures/test';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { SearchPage } from '../pages';

test.describe('Search failure', () => {
  test('shows an error message when Spotify search fails', async ({ page }) => {
    // [QA_AUDIT_REQUIRED]: Mocking search 500. Cannot force Spotify search errors in CI.
    await mockSpotifyApi(page, { searchStatus: 500 });
    const search = new SearchPage(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await search.fillAndSearch('test');
    const request = await searchRequest;

    expect(new URL(request.url()).searchParams.get('q')).toBe('test');
    await expect(search.searchApiError()).toHaveText(
      'Unable to search right now. Please try again.',
    );
    await expect(search.trackName('track-1')).not.toBeVisible();
  });
});
