import { test, expect } from '../fixtures/test';
import {
  MOCK_ACCESS_TOKEN,
  mockPlaylist,
  mockSearchResponse,
  mockUser,
} from '../fixtures/spotify-mocks';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Loading states', () => {
  test('shows Searching... while search is in progress', async ({ page }) => {
    let releaseSearch!: () => void;
    const searchBlocked = new Promise<void>((resolve) => {
      releaseSearch = resolve;
    });

    await page.route('**/api.spotify.com/v1/search*', async (route) => {
      await searchBlocked;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSearchResponse),
      });
    });

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('search-button')).toHaveText('Searching...');
    await expect(page.getByTestId('search-button')).toBeDisabled();

    releaseSearch();
    await expect(page.getByTestId('track-item-track-1')).toBeVisible();
    await expect(page.getByTestId('search-button')).toHaveText('Search');
    await expect(page.getByTestId('search-button')).toBeEnabled();
  });

  test('shows Saving... while save is in progress', async ({ page }) => {
    let releaseSave!: () => void;
    const saveBlocked = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    let blockSaveMe = false;

    await page.route('**/api.spotify.com/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      const auth = route.request().headers().authorization;

      if (auth !== `Bearer ${MOCK_ACCESS_TOKEN}`) {
        return route.fulfill({ status: 401, body: '{}' });
      }

      if (url.includes('/v1/search') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSearchResponse),
        });
      }

      if (url.endsWith('/v1/me') && method === 'GET') {
        if (blockSaveMe) {
          await saveBlocked;
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUser),
        });
      }

      if (url.includes('/playlists') && method === 'POST' && !url.includes('/tracks')) {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(mockPlaylist),
        });
      }

      if (url.includes('/playlists/') && url.endsWith('/tracks') && method === 'POST') {
        return route.fulfill({ status: 201, body: '' });
      }

      return route.continue();
    });

    await searchAndAddFirstTrack(page);
    await page.getByTestId('playlist-title-input').fill('Weekend Vibes');

    blockSaveMe = true;
    await page.getByTestId('save-playlist-button').click();

    await expect(page.getByTestId('save-playlist-button')).toHaveText('Saving...');
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();

    releaseSave();
    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');
    await expect(page.getByTestId('save-playlist-button')).toHaveText('Save to Spotify');
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();
  });
});
