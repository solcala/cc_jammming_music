import { test, expect } from '../../fixtures/test';
import { mockTracks } from '../../fixtures/spotify-mocks';
import { hasHorizontalOverflow } from '../../fixtures/helpers';
import { AppPage } from '../../pages';

test.describe('Mobile search and add', () => {
  test('searches for tracks and adds one to the playlist', async ({ page }) => {
    const app = new AppPage(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await app.searchAndAddTrack();
    const request = await searchRequest;

    expect(new URL(request.url()).searchParams.get('q')).toBe('test song');
    await expect(app.playlist.trackNameInPlaylist('track-1')).toHaveText(
      mockTracks[0].name,
    );
    await expect(app.playlist.trackRemoveButton('track-1')).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
