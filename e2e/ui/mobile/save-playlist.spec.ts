import { test, expect } from '../../fixtures/test';
import { mockPlaylist, mockUser } from '../../fixtures/spotify-mocks';
import { hasHorizontalOverflow } from '../../fixtures/helpers';
import { AppPage } from '../../pages';

test.describe('Mobile save playlist', () => {
  test('saves playlist and shows success message', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();

    const meRequest = page.waitForRequest('**/api.spotify.com/v1/me');
    const createPlaylistRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes(`/v1/users/${mockUser.id}/playlists`) &&
        !request.url().includes('/tracks'),
    );
    const addTracksRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes(`/playlists/${mockPlaylist.id}/tracks`),
    );

    await app.playlist.savePlaylist('Mobile Mix');
    await meRequest;
    await createPlaylistRequest;
    await addTracksRequest;

    await expect(app.playlist.message()).toHaveText('Playlist created');
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
