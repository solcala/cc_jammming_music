import type { Page } from '@playwright/test';
import { AppPage, PlaylistPage, SearchPage } from '../pages';

/**
 * Flow helpers for specs not yet migrated to page objects (Batch 4).
 * Actions / measurements only — put `expect` in `*.spec.ts`.
 * Prefer SearchPage / PlaylistPage / AppPage directly when migrating.
 */

export async function searchTracks(page: Page, query = 'test song') {
  const search = new SearchPage(page);
  await search.fillAndSearch(query);
}

export async function searchAndAddFirstTrack(page: Page) {
  const app = new AppPage(page);
  await app.searchAndAddTrack();
}

export async function savePlaylist(page: Page, name: string) {
  const playlist = new PlaylistPage(page);
  await playlist.savePlaylist(name);
}

/** Returns whether the document scrolls wider than the viewport. No assertion. */
export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}
