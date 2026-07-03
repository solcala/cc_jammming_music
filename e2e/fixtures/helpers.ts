import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function searchTracks(page: Page, query = 'test song') {
  await page.getByTestId('search-by-input').fill(query);
  await page.getByTestId('search-button').click();
  await expect(page.getByTestId('track-item-track-1')).toBeVisible();
}

export async function searchAndAddFirstTrack(page: Page) {
  await searchTracks(page);
  await page.getByTestId('track-add-track-1').click();
  await expect(
    page.getByTestId('playlist-section').getByTestId('track-remove-track-1')
  ).toBeVisible();
}

export async function savePlaylist(page: Page, name: string) {
  await page.getByTestId('playlist-title-input').fill(name);
  // First click populates trackUris state; second click sends the save request.
  await page.getByTestId('save-playlist-button').click();
  await page.getByTestId('save-playlist-button').click();
}
