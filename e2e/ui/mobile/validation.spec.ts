import { test, expect } from '../../fixtures/test';
import { expectNoHorizontalOverflow } from '../../fixtures/helpers';

test.describe('Mobile validation', () => {
  test('shows inline error when searching with an empty query', async ({ page }) => {
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('search-error')).toHaveText('Please enter a song title');
    await expectNoHorizontalOverflow(page);
  });

  test('disables save button when playlist has no tracks', async ({ page }) => {
    await page.getByTestId('playlist-title-input').fill('Empty Playlist');
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();
    await expectNoHorizontalOverflow(page);
  });
});
