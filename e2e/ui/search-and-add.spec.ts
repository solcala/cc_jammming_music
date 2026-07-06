import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { mockEmptySearchResults } from '../fixtures/mock-spotify-api';
import { searchTracks } from '../fixtures/helpers';

test.describe('Search and add to playlist', () => {
  test('searches for tracks and displays results', async ({ page }) => {
    await searchTracks(page);

    await expect(page.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(page.getByTestId('track-artist-track-1')).toHaveText(
      mockTracks[0].artists[0].name
    );
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  });

  test('adds a track from results to the playlist panel', async ({ page }) => {
    await searchTracks(page);

    await page.getByTestId('track-add-track-1').click();

    const playlist = page.getByTestId('playlist-section');
    await expect(playlist.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(playlist.getByTestId('track-remove-track-1')).toBeVisible();
    await expect(page.getByTestId('track-add-track-1')).toBeVisible();
  });

  test('adds multiple tracks to the playlist panel', async ({ page }) => {
    await searchTracks(page);
    await page.getByTestId('track-add-track-1').click();
    await page.getByTestId('track-add-track-2').click();

    const playlist = page.getByTestId('playlist-section');
    await expect(playlist.getByTestId('track-remove-track-1')).toBeVisible();
    await expect(playlist.getByTestId('track-remove-track-2')).toBeVisible();
    await expect(playlist.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(playlist.getByTestId('track-name-track-2')).toHaveText(mockTracks[1].name);
  });

  test('shows empty state when search returns no tracks', async ({ page }) => {
    await mockEmptySearchResults(page);

    await page.getByTestId('search-by-input').fill('missing song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('search-empty-message')).toHaveText('No results found');
  });
});
