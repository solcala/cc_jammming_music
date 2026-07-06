import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Remove track from playlist', () => {
  test('removes a track from the playlist panel', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    const playlist = page.getByTestId('playlist-section');
    await expect(playlist.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);

    await playlist.getByTestId('track-remove-track-1').click();

    await expect(playlist.getByTestId('track-remove-track-1')).not.toBeVisible();
    await expect(page.getByTestId('track-add-track-1')).toBeVisible();
    await expect(page.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
  });

  test('shows validation when saving after removing the last track', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('playlist-title-input').fill('Solo Track');

    const playlist = page.getByTestId('playlist-section');
    await playlist.getByTestId('track-remove-track-1').click();

    await expect(playlist.getByTestId('track-remove-track-1')).not.toBeVisible();
    await page.getByTestId('save-playlist-button').click();

    await expect(page.getByTestId('playlist-validation-error')).toHaveText(
      'Add at least a track to the playlist',
    );
  });
});
