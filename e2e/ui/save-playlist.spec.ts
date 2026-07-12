import { test, expect } from '../fixtures/test';
import { mockTracks, mockPlaylist, mockUser } from '../fixtures/spotify-mocks';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { AppPage } from '../pages';
import { parseCreatePlaylistRequest } from '../schemas/validate';

test.describe('Save playlist', () => {
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

    await app.playlist.savePlaylist('Weekend Vibes');

    await meRequest;
    const createPlaylist = await createPlaylistRequest;
    await addTracksRequest;

    expect(parseCreatePlaylistRequest(createPlaylist.postDataJSON())).toEqual({
      name: 'Weekend Vibes',
    });
    await expect(app.playlist.message()).toHaveText('Playlist created');
  });

  test('clears playlist after successful save', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();

    const meRequest = page.waitForRequest('**/api.spotify.com/v1/me');
    await app.playlist.savePlaylist('Weekend Vibes');
    await meRequest;

    await expect(app.playlist.titleInput()).toHaveValue('');
    await expect(app.playlist.trackRemoveButton('track-1')).not.toBeVisible();
    await expect(app.search.trackAddButton('track-1')).toBeVisible();
    await expect(app.search.trackName('track-1')).toHaveText(mockTracks[0].name);
  });

  test('shows error message when save fails', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.playlist.fillTitle('Failed Playlist');
    // [QA_AUDIT_REQUIRED]: Mocking create playlist 500. Cannot force Spotify server errors in CI.
    await mockSpotifyApi(page, { createPlaylistStatus: 500 });

    const createPlaylistRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/playlists') &&
        !request.url().includes('/tracks'),
    );

    await app.playlist.clickSave();
    await createPlaylistRequest;

    await expect(app.playlist.message()).toHaveText(
      'Unable to save playlist. Please try again.',
    );
  });
});
