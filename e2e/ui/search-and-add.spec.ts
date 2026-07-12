import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { mockEmptySearchResults } from '../fixtures/mock-spotify-api';
import { AppPage, SearchPage } from '../pages';

test.describe('Search and add to playlist', () => {
  test('searches for tracks and displays results', async ({ page }) => {
    const search = new SearchPage(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await search.fillAndSearch('test song');
    const request = await searchRequest;

    expect(new URL(request.url()).searchParams.get('q')).toBe('test song');
    await expect(search.trackName('track-1')).toHaveText(mockTracks[0].name);
    await expect(search.trackArtist('track-1')).toHaveText(
      mockTracks[0].artists[0].name,
    );
    await expect(search.resultsHeading()).toBeVisible();
  });

  test('adds a track from results to the playlist panel', async ({ page }) => {
    const app = new AppPage(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await app.search.fillAndSearch('test song');
    await searchRequest;
    await app.search.clickAddTrack('track-1');

    await expect(app.playlist.trackNameInPlaylist('track-1')).toHaveText(
      mockTracks[0].name,
    );
    await expect(app.playlist.trackRemoveButton('track-1')).toBeVisible();
    await expect(app.search.trackAddButton('track-1')).toBeVisible();
  });

  test('adds multiple tracks to the playlist panel', async ({ page }) => {
    const app = new AppPage(page);

    await app.search.fillAndSearch('test song');
    await app.search.clickAddTrack('track-1');
    await app.search.clickAddTrack('track-2');

    await expect(app.playlist.trackRemoveButton('track-1')).toBeVisible();
    await expect(app.playlist.trackRemoveButton('track-2')).toBeVisible();
    await expect(app.playlist.trackNameInPlaylist('track-1')).toHaveText(
      mockTracks[0].name,
    );
    await expect(app.playlist.trackNameInPlaylist('track-2')).toHaveText(
      mockTracks[1].name,
    );
  });

  test('shows empty state when search returns no tracks', async ({ page }) => {
    const search = new SearchPage(page);
    await mockEmptySearchResults(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await search.fillAndSearch('missing song');
    const request = await searchRequest;

    expect(new URL(request.url()).searchParams.get('q')).toBe('missing song');
    await expect(search.searchEmptyMessage()).toHaveText('No results found');
  });
});
