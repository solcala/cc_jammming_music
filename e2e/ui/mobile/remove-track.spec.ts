import { test, expect } from '../../fixtures/test';
import { hasHorizontalOverflow } from '../../fixtures/helpers';
import { AppPage } from '../../pages';

test.describe('Mobile remove track', () => {
  test('removes a track and disables save when playlist is empty', async ({
    page,
  }) => {
    const app = new AppPage(page);
    await app.searchAndAddTrack();
    await app.playlist.fillTitle('Solo Track');

    await app.playlist.clickRemoveTrack('track-1');

    await expect(app.playlist.trackRemoveButton('track-1')).not.toBeVisible();
    await expect(app.playlist.saveButton()).toBeDisabled();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
