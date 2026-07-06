import { test, expect } from '../fixtures/test';
import { searchAndAddFirstTrack, savePlaylist } from '../fixtures/helpers';

test.describe('Playlist message', () => {
  test('clears success message when playlist title changes', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await savePlaylist(page, 'Weekend Vibes');

    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');

    await page.getByTestId('playlist-title-input').fill('New Playlist');
    await expect(page.getByTestId('playlist-message')).toHaveText('');
  });
});
