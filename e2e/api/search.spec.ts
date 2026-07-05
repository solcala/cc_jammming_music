import { test as base, expect } from '@playwright/test';
import { test } from '../fixtures/test';
import { bootstrapSpotifyAuth } from '../fixtures/auth';
import { mockSpotifyApi } from '../fixtures/mock-spotify-api';
import { mockTracks } from '../fixtures/spotify-mocks';

test.describe('Spotify search API', () => {
  test('requests search with query and renders mapped tracks', async ({ page }) => {
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    const request = await searchRequest;
    expect(request.method()).toBe('GET');
    expect(request.url()).toContain('/v1/search');
    expect(request.url()).toContain('type=track');
    expect(request.url()).toContain('q=test');

    await expect(page.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(page.getByTestId('track-artist-track-1')).toHaveText(
      mockTracks[0].artists[0].name
    );
    await expect(page.getByTestId('track-name-track-2')).toHaveText(mockTracks[1].name);
  });

  test('does not call search API when query is empty', async ({ page }) => {
    let searchCalled = false;

    page.on('request', (request) => {
      if (request.url().includes('/v1/search')) {
        searchCalled = true;
      }
    });

    await page.getByTestId('search-button').click();

    expect(searchCalled).toBe(false);
    await expect(page.getByTestId('search-error')).toHaveText('Please enter a song title');
  });
});

base.describe('Spotify search API errors', () => {
  base('returns no tracks when search responds with 401', async ({ page, baseURL }) => {
    await mockSpotifyApi(page, { searchStatus: 401 });
    await bootstrapSpotifyAuth(page, baseURL!);

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('track-item-track-1')).not.toBeVisible();
    await expect(page.getByTestId('track-item-track-2')).not.toBeVisible();
    await expect(page.getByTestId('search-empty-message')).toHaveText('No results found');
  });
});
