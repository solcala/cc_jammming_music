import type { Page, Route } from '@playwright/test';
import {
  MOCK_ACCESS_TOKEN,
  mockPlaylist,
  mockSearchResponse,
  mockUser,
} from './spotify-mocks';

type MockOptions = {
  searchStatus?: number;
  meStatus?: number;
  createPlaylistStatus?: number;
  addTracksStatus?: number;
};

export async function mockSpotifyApi(page: Page, options: MockOptions = {}) {
  const {
    searchStatus = 200,
    meStatus = 200,
    createPlaylistStatus = 201,
    addTracksStatus = 201,
  } = options;

  await page.route('**/api.spotify.com/**', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    const auth = route.request().headers().authorization;

    if (auth !== `Bearer ${MOCK_ACCESS_TOKEN}`) {
      return route.fulfill({ status: 401, body: '{}' });
    }

    if (url.includes('/v1/search') && method === 'GET') {
      return route.fulfill({
        status: searchStatus,
        contentType: 'application/json',
        body: JSON.stringify(searchStatus === 200 ? mockSearchResponse : {}),
      });
    }

    if (url.endsWith('/v1/me') && method === 'GET') {
      return route.fulfill({
        status: meStatus,
        contentType: 'application/json',
        body: JSON.stringify(meStatus === 200 ? mockUser : {}),
      });
    }

    if (url.includes('/playlists') && method === 'POST' && !url.includes('/tracks')) {
      return route.fulfill({
        status: createPlaylistStatus,
        contentType: 'application/json',
        body: JSON.stringify(createPlaylistStatus === 201 ? mockPlaylist : {}),
      });
    }

    if (url.includes('/playlists/') && url.endsWith('/tracks') && method === 'POST') {
      return route.fulfill({ status: addTracksStatus, body: '' });
    }

    return route.continue();
  });
}
