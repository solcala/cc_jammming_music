import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { searchAndAddFirstTrack, savePlaylist } from '../fixtures/helpers';

test.describe('Save playlist', () => {
  test('saves playlist and shows success message', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await savePlaylist(page, 'Weekend Vibes');

    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');
  });

  test('clears playlist after successful save', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await savePlaylist(page, 'Weekend Vibes');

    await expect(page.getByTestId('playlist-title-input')).toHaveValue('');
    await expect(
      page.getByTestId('playlist-section').getByTestId('track-remove-track-1')
    ).not.toBeVisible();
    await expect(page.getByTestId('track-add-track-1')).toBeVisible();
    await expect(page.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
  });

  test('shows error message when save fails', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('playlist-title-input').fill('Failed Playlist');
    await mockSpotifyApi(page, { createPlaylistStatus: 500 });

    await page.getByTestId('save-playlist-button').click();

    await expect(page.getByTestId('playlist-message')).toHaveText(
      'Unable to save playlist. Please try again.'
    );
  });
});
