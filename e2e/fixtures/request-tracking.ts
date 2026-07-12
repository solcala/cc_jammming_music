import type { Page, Request } from '@playwright/test';

export type UrlHitTracker = {
  count: () => number;
  urls: () => string[];
};

/**
 * Counts requests whose URL includes `urlSubstring`.
 * Put branching here — not in `*.spec.ts`.
 */
export function trackUrlHits(page: Page, urlSubstring: string): UrlHitTracker {
  const hits: string[] = [];

  page.on('request', (request: Request) => {
    if (request.url().includes(urlSubstring)) {
      hits.push(request.url());
    }
  });

  return {
    count: () => hits.length,
    urls: () => [...hits],
  };
}

export function waitForTokenExchangeRequest(page: Page) {
  return page.waitForRequest('**/accounts.spotify.com/api/token**');
}

export function waitForSearchRequest(page: Page) {
  return page.waitForRequest('**/api.spotify.com/v1/search*');
}

export function waitForMeRequest(page: Page) {
  return page.waitForRequest('**/api.spotify.com/v1/me');
}

export function waitForCreatePlaylistRequest(page: Page, userId: string) {
  return page.waitForRequest(
    (request) =>
      request.method() === 'POST' &&
      request.url().includes(`/v1/users/${userId}/playlists`) &&
      !request.url().includes('/tracks'),
  );
}

export function waitForAddTracksRequest(page: Page, playlistId: string) {
  return page.waitForRequest(
    (request) =>
      request.method() === 'POST' &&
      request.url().includes(`/playlists/${playlistId}/tracks`),
  );
}
