import { test, expect } from '../../fixtures/test';
import { hasHorizontalOverflow, searchAndAddFirstTrack } from '../../fixtures/helpers';

test.describe('Mobile remove track', () => {
  test('removes a track and disables save when playlist is empty', async ({ page }) => {
    await searchAndAddFirstTrack(page);
    await page.getByTestId('playlist-title-input').fill('Solo Track');

    const playlist = page.getByTestId('playlist-section');
    await playlist.getByTestId('track-remove-track-1').click();

    await expect(playlist.getByTestId('track-remove-track-1')).not.toBeVisible();
    await expect(page.getByTestId('save-playlist-button')).toBeDisabled();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
