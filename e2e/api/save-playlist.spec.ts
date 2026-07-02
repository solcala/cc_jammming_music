import { test, expect } from '../fixtures/test';
import { mockPlaylist, mockTracks, mockUser } from '../fixtures/spotify-mocks';

async function searchAndAddFirstTrack(page) {
  await page.getByTestId('search-by-input').fill('test song');
  await page.getByTestId('search-button').click();
  await expect(page.getByTestId('track-item-track-1')).toBeVisible();
  await page.getByTestId('track-add-track-1').click();
  await expect(page.getByTestId('track-item-track-1')).toHaveCount(2);
}

test.describe('Spotify save playlist API', () => {
  test('calls me, create playlist, and add tracks in order', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    await page.getByTestId('playlist-title-input').fill('My Test Playlist');

    const meRequest = page.waitForRequest('**/api.spotify.com/v1/me');
    const createPlaylistRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes(`/v1/users/${mockUser.id}/playlists`) &&
        !request.url().includes('/tracks')
    );
    const addTracksRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes(`/playlists/${mockPlaylist.id}/tracks`)
    );

    // First click populates trackUris state; second click sends the save request.
    await page.getByTestId('save-playlist-button').click();
    await page.getByTestId('save-playlist-button').click();

    const me = await meRequest;
    const createPlaylist = await createPlaylistRequest;
    const addTracks = await addTracksRequest;

    expect(me.method()).toBe('GET');
    expect(createPlaylist.postDataJSON()).toEqual({ name: 'My Test Playlist' });
    expect(addTracks.postDataJSON()).toEqual({
      uris: [mockTracks[0].uri],
    });

    expect(me.headers().authorization).toBe(createPlaylist.headers().authorization);
    expect(createPlaylist.headers().authorization).toBe(addTracks.headers().authorization);
  });

  test('returns 201 and clears playlist on successful save', async ({ page }) => {
    await searchAndAddFirstTrack(page);

    await page.getByTestId('playlist-title-input').fill('My Test Playlist');
    await page.getByTestId('save-playlist-button').click();
    await page.getByTestId('save-playlist-button').click();

    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');
    await expect(page.getByTestId('playlist-title-input')).toHaveValue('');
    await expect(page.getByTestId('track-remove-track-1')).not.toBeVisible();
  });
});
