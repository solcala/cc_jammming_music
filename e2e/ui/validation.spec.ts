import { test, expect } from '../fixtures/test';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Form validation', () => {
  test('shows alert when searching with an empty query', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Please enter a song title');
      await dialog.accept();
    });

    await page.getByTestId('search-button').click();
  });

  test('shows alert when saving without a playlist title', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Add a playlist title');
      await dialog.accept();
    });

    await page.getByTestId('save-playlist-button').click();
  });

  test('shows alert when saving without tracks', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Add at least a track to the playlist');
      await dialog.accept();
    });

    await page.getByTestId('playlist-title-input').fill('Empty Playlist');
    await page.getByTestId('save-playlist-button').click();
  });

  test('shows alert when adding a duplicate track', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('This song is in the playlist.');
      await dialog.accept();
    });

    await page.getByTestId('track-add-track-1').click();

    await expect(
      page.getByTestId('playlist-section').getByTestId('track-remove-track-1')
    ).toHaveCount(1);
  });
});
