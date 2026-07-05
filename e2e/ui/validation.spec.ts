import { test, expect } from '../fixtures/test';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Form validation', () => {
  test('shows inline error when searching with an empty query', async ({ page }) => {
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('search-error')).toHaveText('Please enter a song title');
  });

  test('shows inline error when saving without a playlist title', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('save-playlist-button').click();
    await expect(page.getByTestId('playlist-validation-error')).toHaveText('Add a playlist title');
  });

  test('shows inline error when saving without tracks', async ({ page }) => {
    await page.getByTestId('playlist-title-input').fill('Empty Playlist');
    await page.getByTestId('save-playlist-button').click();
    await expect(page.getByTestId('playlist-validation-error')).toHaveText('Add at least a track to the playlist');
  });

  test('shows duplicate track message in playlist panel', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('track-add-track-1').click();

    await expect(page.getByTestId('playlist-message')).toHaveText('This song is in the playlist.');
    await expect(
      page.getByTestId('playlist-section').getByTestId('track-remove-track-1')
    ).toHaveCount(1);
  });
});
