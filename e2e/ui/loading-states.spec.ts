import { test, expect } from '../fixtures/test';
import { mockDelayedSave, mockDelayedSearch } from '../fixtures/mock-spotify-api';
import { searchAndAddFirstTrack } from '../fixtures/helpers';

test.describe('Loading states', () => {
  test('shows Searching... while search is in progress', async ({ page }) => {
    const { release } = await mockDelayedSearch(page);

    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('search-button')).toHaveText('Searching...');
    await expect(page.getByTestId('search-button')).toBeDisabled();

    release();
    await expect(page.getByTestId('track-item-track-1')).toBeVisible();
    await expect(page.getByTestId('search-button')).toHaveText('Search');
    await expect(page.getByTestId('search-button')).toBeEnabled();
  });

  test('shows Saving... while save is in progress', async ({ page }) => {
    const { release, arm } = await mockDelayedSave(page);

    await searchAndAddFirstTrack(page);
    await page.getByTestId('playlist-title-input').fill('Weekend Vibes');

    arm();
    await page.getByTestId('save-playlist-button').click();

    await expect(page.getByTestId('save-playlist-button')).toHaveText('Saving...');
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();

    release();
    await expect(page.getByTestId('playlist-message')).toHaveText('Playlist created');
    await expect(page.getByTestId('save-playlist-button')).toHaveText('Save to Spotify');
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();
  });
});
