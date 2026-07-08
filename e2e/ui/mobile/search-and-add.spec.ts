import { test, expect } from '../../fixtures/test';
import { mockTracks } from '../../fixtures/spotify-mocks';
import { expectNoHorizontalOverflow, searchAndAddFirstTrack } from '../../fixtures/helpers';

test.describe('Mobile search and add', () => {
  test('searches for tracks and adds one to the playlist', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    const playlist = page.getByTestId('playlist-section');
    await expect(playlist.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(playlist.getByTestId('track-remove-track-1')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
