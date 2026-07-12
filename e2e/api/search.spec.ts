import { test as base, expect } from '@playwright/test';
import { test } from '../fixtures/test';
import { bootstrapSpotifyAuth } from '../fixtures/auth';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { mockTracks } from '../fixtures/spotify-mocks';
import {
  trackUrlHits,
  waitForSearchRequest,
} from '../fixtures/request-tracking';
import { SearchPage } from '../pages';
import { parseSearchQuery } from '../schemas/validate';

test.describe('Spotify search API', () => {
  test('requests search with query and renders mapped tracks', async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const searchRequest = waitForSearchRequest(page);

    await search.fillAndSearch('test song');

    const request = await searchRequest;
    const url = new URL(request.url());

    expect(request.method()).toBe('GET');
    expect(url.pathname).toContain('/v1/search');
    expect(url.searchParams.get('type')).toBe('track');
    expect(parseSearchQuery(url.searchParams.get('q'))).toBe('test song');

    await expect(search.trackName('track-1')).toHaveText(mockTracks[0].name);
    await expect(search.trackArtist('track-1')).toHaveText(
      mockTracks[0].artists[0].name,
    );
    await expect(search.trackName('track-2')).toHaveText(mockTracks[1].name);
  });

  test('does not call search API when query is empty', async ({ page }) => {
    const search = new SearchPage(page);
    const searchHits = trackUrlHits(page, '/v1/search');

    await search.clickSearch();

    expect(searchHits.count()).toBe(0);
    await expect(search.searchError()).toHaveText('Please enter a song title');
  });
});

base.describe('Spotify search API errors', () => {
  base('returns no tracks when search responds with 401', async ({
    page,
    baseURL,
  }) => {
    // [QA_AUDIT_REQUIRED]: Mocking search 401. Cannot force Spotify auth failures in CI.
    await mockSpotifyApi(page, { searchStatus: 401 });
    await bootstrapSpotifyAuth(page, baseURL!);
    const search = new SearchPage(page);
    const searchRequest = waitForSearchRequest(page);

    await search.fillAndSearch('test song');
    await searchRequest;

    await expect(search.trackItem('track-1')).not.toBeVisible();
    await expect(search.trackItem('track-2')).not.toBeVisible();
    await expect(search.searchEmptyMessage()).toHaveText('No results found');
  });
});
