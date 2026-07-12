import { test, expect } from '../fixtures/test';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { mockPlaylist, mockTracks, mockUser } from '../fixtures/spotify-mocks';
import {
  waitForAddTracksRequest,
  waitForCreatePlaylistRequest,
  waitForMeRequest,
} from '../fixtures/request-tracking';
import { AppPage } from '../pages';
import {
  parseAddTracksRequest,
  parseCreatePlaylistRequest,
} from '../schemas/validate';

test.describe('Spotify save playlist API', () => {
  test('calls me, create playlist, and add tracks in order', async ({
    page,
  }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.playlist.fillTitle('My Test Playlist');

    const meRequest = waitForMeRequest(page);
    const createPlaylistRequest = waitForCreatePlaylistRequest(
      page,
      mockUser.id,
    );
    const addTracksRequest = waitForAddTracksRequest(page, mockPlaylist.id);

    await app.playlist.clickSave();

    const me = await meRequest;
    const createPlaylist = await createPlaylistRequest;
    const addTracks = await addTracksRequest;

    expect(me.method()).toBe('GET');
    expect(parseCreatePlaylistRequest(createPlaylist.postDataJSON())).toEqual({
      name: 'My Test Playlist',
    });
    expect(parseAddTracksRequest(addTracks.postDataJSON())).toEqual({
      uris: [mockTracks[0].uri],
    });

    expect(me.headers().authorization).toBe(
      createPlaylist.headers().authorization,
    );
    expect(createPlaylist.headers().authorization).toBe(
      addTracks.headers().authorization,
    );
  });

  test('returns 201 and clears playlist on successful save', async ({
    page,
  }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();

    const meRequest = waitForMeRequest(page);
    const createPlaylistRequest = waitForCreatePlaylistRequest(
      page,
      mockUser.id,
    );
    const addTracksRequest = waitForAddTracksRequest(page, mockPlaylist.id);

    await app.playlist.savePlaylist('My Test Playlist');
    await meRequest;
    await createPlaylistRequest;
    await addTracksRequest;

    await expect(app.playlist.message()).toHaveText('Playlist created');
    await expect(app.playlist.titleInput()).toHaveValue('');
    await expect(app.playlist.trackRemoveButton('track-1')).not.toBeVisible();
  });

  test('shows error message when create playlist fails', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.playlist.fillTitle('Failed Playlist');
    // [QA_AUDIT_REQUIRED]: Mocking create playlist 500. Cannot force Spotify server errors in CI.
    await mockSpotifyApi(page, { createPlaylistStatus: 500 });

    const createPlaylistRequest = waitForCreatePlaylistRequest(
      page,
      mockUser.id,
    );

    await app.playlist.clickSave();
    await createPlaylistRequest;

    await expect(app.playlist.message()).toHaveText(
      'Unable to save playlist. Please try again.',
    );
    await expect(app.playlist.titleInput()).toHaveValue('Failed Playlist');
    await expect(app.playlist.trackRemoveButton('track-1')).toBeVisible();
  });
});
