import { test, expect } from '../fixtures/test';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { AppPage, SearchPage } from '../pages';

test.describe('Accessibility', () => {
  test('search input has an accessible name via labeled control', async ({
    page,
  }) => {
    const search = new SearchPage(page);

    await expect(search.searchLabel()).toHaveText('Search by song title');
    await expect(search.searchInput()).toHaveAttribute('id', 'search-by-input');
    await expect(search.searchInput()).toBeVisible();
  });

  test('playlist message uses a polite live region', async ({ page }) => {
    const app = new AppPage(page);
    const message = app.playlist.message();

    await expect(message).toHaveAttribute('role', 'status');
    await expect(message).toHaveAttribute('aria-live', 'polite');
  });

  test('search validation errors use role alert', async ({ page }) => {
    const search = new SearchPage(page);

    await search.clickSearch();

    await expect(search.searchError()).toHaveAttribute('role', 'alert');
    await expect(search.searchError()).toHaveText('Please enter a song title');
  });

  test('search API errors use role alert', async ({ page }) => {
    // [QA_AUDIT_REQUIRED]: Mocking search 500. Cannot force Spotify search errors in CI.
    await mockSpotifyApi(page, { searchStatus: 500 });
    const search = new SearchPage(page);

    await search.fillAndSearch('test');

    await expect(search.searchApiError()).toHaveAttribute('role', 'alert');
    await expect(search.searchApiError()).toHaveText(
      'Unable to search right now. Please try again.',
    );
  });

  test('playlist status announces duplicate track message', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.search.clickAddTrack('track-1');

    await expect(app.playlist.message()).toHaveAttribute('role', 'status');
    await expect(app.playlist.message()).toHaveText('This song is in the playlist.');
  });
});
