import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { searchAndAddFirstTrack, savePlaylist, searchTracks } from '../fixtures/helpers';

test.describe('Playlist message', () => {
  test('clears success message when playlist title changes', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await savePlaylist(page, 'Weekend Vibes');

    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');

    await page.getByTestId('playlist-title-input').fill('New Playlist');
    await expect(page.getByTestId('playlist-message')).toHaveText('');
  });
});

  test('clears duplicate track message when a different track is added', async ({ page }) => {
    await searchTracks(page);
    await page.getByTestId('track-add-track-1').click();
    await page.getByTestId('track-add-track-1').click();

    await expect(page.getByTestId('playlist-message')).toHaveText('This song is in the playlist.');

    await page.getByTestId('track-add-track-2').click();

    await expect(page.getByTestId('playlist-message')).toHaveText('');
    await expect(page.getByTestId('playlist-section').getByTestId('track-name-track-2')).toHaveText(
      mockTracks[1].name
    );
  });
