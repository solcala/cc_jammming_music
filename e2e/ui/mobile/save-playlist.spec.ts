import { test, expect } from '../../fixtures/test';
import {
  hasHorizontalOverflow,
  searchAndAddFirstTrack,
  savePlaylist,
} from '../../fixtures/helpers';

test.describe('Mobile save playlist', () => {
  test('saves playlist and shows success message', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await savePlaylist(page, 'Mobile Mix');

    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
