import { test, expect } from '../fixtures/test';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Accessibility', () => {
  test('search input has an accessible name', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Search by song title' })
    ).toBeVisible();
  });

  test('playlist message uses a polite live region', async ({ page }) => {
    const message = page.getByTestId('playlist-message');
    await expect(message).toHaveAttribute('role', 'status');
    await expect(message).toHaveAttribute('aria-live', 'polite');
  });

  test('search validation errors use role alert', async ({ page }) => {
    await page.getByTestId('search-button').click();
    await expect(page.getByRole('alert')).toHaveText('Please enter a song title');
  });

  test('search API errors use role alert', async ({ page }) => {
    await mockSpotifyApi(page, { searchStatus: 500 });
    await page.getByRole('textbox', { name: 'Search by song title' }).fill('test');
    await page.getByTestId('search-button').click();

    await expect(page.getByRole('alert')).toHaveText(
      'Unable to search right now. Please try again.'
    );
  });

  test('playlist status announces duplicate track message', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('track-add-track-1').click();

    await expect(page.getByRole('status')).toHaveText('This song is in the playlist.');
  });
});
