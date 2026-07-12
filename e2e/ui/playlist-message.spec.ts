import { test, expect } from '../fixtures/test';
import { mockTracks, mockPlaylist, mockUser } from '../fixtures/spotify-mocks';
import { AppPage } from '../pages';

test.describe('Playlist message', () => {
  test('clears success message when playlist title changes', async ({ page }) => {
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

    await app.playlist.savePlaylist('Weekend Vibes');
    await meRequest;
    await createPlaylistRequest;
    await addTracksRequest;

    await expect(app.playlist.message()).toHaveText('Playlist created');

    await app.playlist.fillTitle('New Playlist');
    await expect(app.playlist.message()).toHaveText('');
  });

  test('clears duplicate track message when a different track is added', async ({
    page,
  }) => {
    const app = new AppPage(page);

    await app.search.fillAndSearch('test song');
    await app.search.clickAddTrack('track-1');
    await app.search.clickAddTrack('track-1');

    await expect(app.playlist.message()).toHaveText('This song is in the playlist.');

    await app.search.clickAddTrack('track-2');

    await expect(app.playlist.message()).toHaveText('');
    await expect(app.playlist.trackNameInPlaylist('track-2')).toHaveText(
      mockTracks[1].name,
    );
  });
});
