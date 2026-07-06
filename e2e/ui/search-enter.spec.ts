import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';

test.describe('Search on Enter', () => {
  test('searches for tracks when Enter is pressed in the search input', async ({ page }) => {
    await page.getByTestId('search-by-input').fill('test song');
    await page.getByTestId('search-by-input').press('Enter');

    await expect(page.getByTestId('track-name-track-1')).toHaveText(mockTracks[0].name);
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  });
});
