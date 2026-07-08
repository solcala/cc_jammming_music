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
  await page.getByTestId('save-playlist-button').click();
}

export async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
}

export async function expectMatchingControlWidths(
  page: Page,
  firstTestId: string,
  secondTestId: string,
) {
  const firstBox = await page.getByTestId(firstTestId).boundingBox();
  const secondBox = await page.getByTestId(secondTestId).boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox!.width).toBeCloseTo(firstBox!.width, 0);
}
