import { test, expect } from '../fixtures/test';
import { AppPage, PlaylistPage, SearchPage } from '../pages';

test.describe('Form validation', () => {
  test('shows inline error when searching with an empty query', async ({ page }) => {
    const search = new SearchPage(page);

    await search.clickSearch();

    await expect(search.searchError()).toHaveText('Please enter a song title');
  });

  test('clears search error after typing in the input', async ({ page }) => {
    const search = new SearchPage(page);

    await search.clickSearch();
    await expect(search.searchError()).toBeVisible();

    await search.fillSearch('t');
    await expect(search.searchError()).not.toBeVisible();
  });

  test('shows inline error when saving without a playlist title', async ({
    page,
  }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();

    await app.playlist.clickSave();

    await expect(app.playlist.validationError()).toHaveText('Add a playlist title');
  });

  test('disables save button when playlist has no tracks', async ({ page }) => {
    const playlist = new PlaylistPage(page);

    await playlist.fillTitle('Empty Playlist');

    await expect(playlist.saveButton()).toBeDisabled();
  });

  test('shows duplicate track message in playlist panel', async ({ page }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.search.clickAddTrack('track-1');

    await expect(app.playlist.message()).toHaveText('This song is in the playlist.');
    await expect(app.playlist.trackRemoveButton('track-1')).toHaveCount(1);
  });
});
