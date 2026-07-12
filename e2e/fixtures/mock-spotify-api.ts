import type { Page, Route } from '@playwright/test';
import {
  parseSpotifyPlaylistResponse,
  parseSpotifySearchResponse,
  parseSpotifyUserResponse,
} from '../schemas/validate';
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

type DelayedControl = {
  release: () => void;
};

type DelayedSaveControl = DelayedControl & {
  arm: () => void;
};

function createReleaseGate() {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { gate, release: () => release() };
}

function fulfillJson(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

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
      // [QA_AUDIT_REQUIRED]: Mocking 401 for missing/invalid Bearer. Cannot force Spotify auth failures in CI.
      return route.fulfill({ status: 401, body: '{}' });
    }

    if (url.includes('/v1/search') && method === 'GET') {
      if (searchStatus !== 200) {
        // [QA_AUDIT_REQUIRED]: Mocking non-200 search (e.g. 401/500). Cannot force Spotify search errors in CI.
        return fulfillJson(route, searchStatus, {});
      }
      return fulfillJson(
        route,
        searchStatus,
        parseSpotifySearchResponse(mockSearchResponse),
      );
    }

    if (url.endsWith('/v1/me') && method === 'GET') {
      if (meStatus !== 200) {
        // [QA_AUDIT_REQUIRED]: Mocking non-200 /v1/me. Cannot force Spotify profile errors in CI.
        return fulfillJson(route, meStatus, {});
      }
      return fulfillJson(route, meStatus, parseSpotifyUserResponse(mockUser));
    }

    if (url.includes('/playlists') && method === 'POST' && !url.includes('/tracks')) {
      if (createPlaylistStatus !== 201) {
        // [QA_AUDIT_REQUIRED]: Mocking non-201 create playlist (e.g. 500). Cannot force Spotify server errors in CI.
        return fulfillJson(route, createPlaylistStatus, {});
      }
      return fulfillJson(
        route,
        createPlaylistStatus,
        parseSpotifyPlaylistResponse(mockPlaylist),
      );
    }

    if (url.includes('/playlists/') && url.endsWith('/tracks') && method === 'POST') {
      if (addTracksStatus !== 201) {
        // [QA_AUDIT_REQUIRED]: Mocking non-201 add tracks. Cannot force Spotify track-add errors in CI.
        return route.fulfill({ status: addTracksStatus, body: '' });
      }
      return route.fulfill({ status: addTracksStatus, body: '' });
    }

    return route.continue();
  });
}

export async function mockEmptySearchResults(page: Page) {
  await page.route('**/api.spotify.com/v1/search*', async (route) => {
    await fulfillJson(
      route,
      200,
      parseSpotifySearchResponse({ tracks: { items: [] } }),
    );
  });
}

export async function mockDelayedSearch(page: Page): Promise<DelayedControl> {
  // [QA_AUDIT_REQUIRED]: Artificial delay gate for loading UI. Cannot control Spotify latency in CI.
  const { gate, release } = createReleaseGate();

  await page.route('**/api.spotify.com/v1/search*', async (route) => {
    await gate;
    await fulfillJson(
      route,
      200,
      parseSpotifySearchResponse(mockSearchResponse),
    );
  });

  return { release };
}

export async function mockDelayedSave(page: Page): Promise<DelayedSaveControl> {
  // [QA_AUDIT_REQUIRED]: Artificial delay on /v1/me during save for loading UI. Cannot control Spotify latency in CI.
  const { gate, release } = createReleaseGate();
  let blockMe = false;

  await page.route('**/api.spotify.com/**', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    const auth = route.request().headers().authorization;

    if (auth !== `Bearer ${MOCK_ACCESS_TOKEN}`) {
      // [QA_AUDIT_REQUIRED]: Mocking 401 for missing/invalid Bearer. Cannot force Spotify auth failures in CI.
      return route.fulfill({ status: 401, body: '{}' });
    }

    if (url.includes('/v1/search') && method === 'GET') {
      return fulfillJson(
        route,
        200,
        parseSpotifySearchResponse(mockSearchResponse),
      );
    }

    if (url.endsWith('/v1/me') && method === 'GET') {
      if (blockMe) {
        await gate;
      }
      return fulfillJson(route, 200, parseSpotifyUserResponse(mockUser));
    }

    if (url.includes('/playlists') && method === 'POST' && !url.includes('/tracks')) {
      return fulfillJson(
        route,
        201,
        parseSpotifyPlaylistResponse(mockPlaylist),
      );
    }

    if (url.includes('/playlists/') && url.endsWith('/tracks') && method === 'POST') {
      return route.fulfill({ status: 201, body: '' });
    }

    return route.continue();
  });

  return {
    release,
    arm: () => {
      blockMe = true;
    },
  };
}
