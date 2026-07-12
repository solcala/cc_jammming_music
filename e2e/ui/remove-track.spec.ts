import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { AppPage } from '../pages';

test.describe('Remove track from playlist', () => {
  test('removes a track from the playlist panel', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();

    await expect(app.playlist.trackNameInPlaylist('track-1')).toHaveText(
      mockTracks[0].name,
    );

    await app.playlist.clickRemoveTrack('track-1');

    await expect(app.playlist.trackRemoveButton('track-1')).not.toBeVisible();
    await expect(app.search.trackAddButton('track-1')).toBeVisible();
    await expect(app.search.trackName('track-1')).toHaveText(mockTracks[0].name);
  });

  test('disables save button after removing the last track', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.playlist.fillTitle('Solo Track');

    await app.playlist.clickRemoveTrack('track-1');

    await expect(app.playlist.trackRemoveButton('track-1')).not.toBeVisible();
    await expect(app.playlist.saveButton()).toBeDisabled();
  });
});
