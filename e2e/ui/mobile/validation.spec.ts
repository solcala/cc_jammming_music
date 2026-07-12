import { test, expect } from '../../fixtures/test';
import { hasHorizontalOverflow } from '../../fixtures/helpers';
import { PlaylistPage, SearchPage } from '../../pages';

test.describe('Mobile validation', () => {
  test('shows inline error when searching with an empty query', async ({
    page,
  }) => {
    const search = new SearchPage(page);

    await search.clickSearch();

    await expect(search.searchError()).toHaveText('Please enter a song title');
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('disables save button when playlist has no tracks', async ({ page }) => {
    const playlist = new PlaylistPage(page);

    await playlist.fillTitle('Empty Playlist');

    await expect(playlist.saveButton()).toBeDisabled();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
