import { test, expect } from '../fixtures/test';
import { mockDelayedSave, mockDelayedSearch } from '../fixtures/mock-spotify-api';
import { AppPage, SearchPage } from '../pages';

test.describe('Loading states', () => {
  test('shows Searching... while search is in progress', async ({ page }) => {
    // [QA_AUDIT_REQUIRED]: Artificial delay gate for loading UI. Cannot control Spotify latency in CI.
    const { release } = await mockDelayedSearch(page);
    const search = new SearchPage(page);

    await search.fillSearch('test song');
    await search.clickSearch();

    await expect(search.searchButton()).toHaveText('Searching...');
    await expect(search.searchButton()).toBeDisabled();

    release();
    await expect(search.trackItem('track-1')).toBeVisible();
    await expect(search.searchButton()).toHaveText('Search');
    await expect(search.searchButton()).toBeEnabled();
  });

  test('shows Saving... while save is in progress', async ({ page }) => {
    // [QA_AUDIT_REQUIRED]: Artificial delay on save for loading UI. Cannot control Spotify latency in CI.
    const { release, arm } = await mockDelayedSave(page);
    const app = new AppPage(page);

    await app.searchAndAddTrack();
    await app.playlist.fillTitle('Weekend Vibes');

    arm();
    await app.playlist.clickSave();

    await expect(app.playlist.saveButton()).toHaveText('Saving...');
    await expect(app.playlist.saveButton()).toBeDisabled();

    release();
    await expect(app.playlist.message()).toHaveText('Playlist created');
    await expect(app.playlist.saveButton()).toHaveText('Save to Spotify');
    await expect(app.playlist.saveButton()).toBeDisabled();
  });
});
